import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db/client";

interface User {
  ws: WebSocket;
  userId: string;
  rooms: number[];
}

let users: User[] = [];

function checkUser(token: string): { id: string; email?: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!);
    if (typeof decoded === "string" || !decoded) return null;
    if ("id" in decoded && typeof (decoded as any).id === "string") {
      return { id: (decoded as any).id, email: (decoded as any).email };
    }
    return null;
  } catch (err) {
    console.error("JWT verification failed in the websocket:", err);
    return null;
  }
}

function cleanupDisconnectedUsers() {
  users = users.filter((user) => {
    try {
      user.ws.ping();
      return true;
    } catch {
      return false;
    }
  });
}

const wss = new WebSocketServer({ port: 8080 });

setInterval(cleanupDisconnectedUsers, 30000);

wss.on("connection", (ws: WebSocket, request) => {
  let authenticated = false;

  try {
    const url = request.url;
    if (!url) {
      ws.send(JSON.stringify({ type: "error", message: "Missing URL" }));
      ws.close(1008, "Missing URL");
      return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token") ?? "";
    if (!token) {
      ws.send(JSON.stringify({ type: "error", message: "Missing token" }));
      ws.close(1008, "Missing token");
      return;
    }

    const user = checkUser(token);
    if (!user) {
      ws.send(
        JSON.stringify({ type: "error", message: "Invalid or expired token" })
      );
      ws.close(1008, "Invalid token");
      return;
    }

    authenticated = true;
    const userId = user.id;

    const userConnection: User = {
      ws,
      userId,
      rooms: [],
    };
    users.push(userConnection);

    ws.on("message", async (message) => {
      if (!authenticated) return;

      try {
        const data = JSON.parse(message.toString());

        if (data.type === "join") {
          const roomId = parseInt(data.roomId, 10);
          if (isNaN(roomId)) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Invalid room ID format",
              })
            );
            return;
          }

          const room = await prisma.room.findFirst({
            where: { id: roomId },
          });
          if (!room) {
            ws.send(
              JSON.stringify({ type: "error", message: "Room does not exist" })
            );
            return;
          }

          const user = users.find((x) => x.ws === ws);
          if (user && !user.rooms.includes(roomId)) {
            user.rooms.push(roomId);
            ws.send(JSON.stringify({ type: "join", success: true, roomId }));
          }
        } else if (data.type === "leave") {
          const roomId = parseInt(data.roomId, 10);
          const user = users.find((x) => x.ws === ws);
          if (!user) return;
          user.rooms = user.rooms.filter((id) => id !== roomId);
          ws.send(JSON.stringify({ type: "leave", success: true, roomId }));
        } else if (data.type === "chat") {
          const roomId = parseInt(data.roomId, 10);
          if (isNaN(roomId)) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Invalid room ID format",
              })
            );
            return;
          }

          const currentUser = users.find((x) => x.ws === ws);
          if (!currentUser || !currentUser.rooms.includes(roomId)) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Not joined to this room",
              })
            );
            return;
          }

          await prisma.chat.create({
            data: {
              roomId: roomId,
              message: data.message,
              userId,
            },
          });

          const messageData = JSON.stringify({
            type: "chat",
            message: data.message,
            roomId: roomId,
            userId: userId,
          });
          users
            .filter((u) => u.rooms.includes(roomId))
            .forEach((user) => {
              try {
                if (user.ws.readyState === WebSocket.OPEN) {
                  user.ws.send(messageData);
                }
              } catch (error) {
                console.error("Error sending message to user:", error);
              }
            });
        } else if (data.type === "delete") {
          const roomId = parseInt(data.roomId, 10);
          if (isNaN(roomId)) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Invalid room ID format",
              })
            );
            return;
          }

          const currentUser = users.find((x) => x.ws === ws);
          if (!currentUser || !currentUser.rooms.includes(roomId)) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Not joined to this room",
              })
            );
            return;
          }
          const shapeStr = data.message;
          const chatToDelete = await prisma.chat.findFirst({
            where: {
              roomId: roomId,
              message: shapeStr,
            },
          });

          if (!chatToDelete) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Shape not found for deletion",
              })
            );
            return;
          }

          await prisma.chat.delete({ where: { id: chatToDelete.id } });

          const deleteData = JSON.stringify({
            type: "delete",
            message: shapeStr,
            roomId: roomId,
          });
          users
            .filter((u) => u.rooms.includes(roomId))
            .forEach((user) => {
              try {
                if (user.ws.readyState === WebSocket.OPEN) {
                  user.ws.send(deleteData);
                }
              } catch (error) {
                console.error("Error sending delete to user:", error);
              }
            });
        }
      } catch (err) {
        console.error("WS Message error:", err);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Internal server error in WS",
          })
        );
      }
      return;
    });

    ws.on("close", () => {
      users = users.filter((user) => user.ws !== ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      try {
        ws.close(1011, "Internal error");
      } catch {
        // Ignore error if socket is already closed
      }
    });
  } catch (err) {
    console.error("WS Connection error:", err);

    ws.send(
      JSON.stringify({
        type: "error",
        message: "Internal server error on connect",
      })
    );
    ws.close(1011, "Internal error");
  }
});
