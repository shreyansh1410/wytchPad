import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db/client";

interface User {
  ws: WebSocket;
  userId: String;
  rooms: String[];
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

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws: WebSocket, request) => {
  try {
    const url = request.url;
    if (!url) {
      ws.send(JSON.stringify({ error: "Missing URL" }));
      ws.close();
      return;
    }
    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token") ?? "";
    if (!token) {
      ws.send(JSON.stringify({ error: "Missing token" }));
      ws.close();
      return;
    }
    const user = checkUser(token);
    if (!user) {
      ws.send(JSON.stringify({ error: "Invalid or expired token" }));
      ws.close();
      return;
    }

    const userId = user.id;

    users.push({
      ws,
      userId,
      rooms: [],
    });

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());

        /*--------------------------------- */

        if (data.type === "join") {
          const room = await prisma.room.findFirst({
            where: { id: data.roomId },
          });
          if (!room) {
            ws.send(JSON.stringify({ error: "Room does not exist" }));
            return;
          }
          const user = users.find((x) => x.ws === ws);
          user?.rooms.push(data.roomId);
          ws.send(JSON.stringify({ msg: `Joined room ${data.roomId}` }));
        }

        /*--------------------------------- */

        if (data.type === "leave") {
          const user = users.find((x) => x.ws === ws);
          if (!user) return;
          user.rooms = user.rooms.filter((roomId) => roomId !== data.roomId);
          ws.send(JSON.stringify({ msg: `Left room ${data.roomId}` }));
        }

        /*--------------------------------- */

        if (data.type === "chat") {
          //this is not a good approach since DB calls are slow and it will delay the
          //propagation of messages to others
          await prisma.chat.create({
            data: {
              roomId: data.roomId,
              message: data.message,
              userId,
            },
          });
          const roomId = data.roomId;
          const message = data.message;
          users.forEach((user) => {
            if (user.rooms.includes(roomId)) {
              user.ws.send(JSON.stringify({ message: message, roomId }));
            }
          });
        } else {
          ws.send(JSON.stringify({ error: "Invalid message type" }));
        }
      } catch (err) {
        console.error("WS Message error:", err);
        ws.send(JSON.stringify({ error: "Internal server error in WS" }));
      }
    });

    ws.send(JSON.stringify({ msg: "Connected successfully" }));
  } catch (err) {
    console.error("WS Connection error:", err);
    ws.send(JSON.stringify({ error: "Internal server error on connect" }));
    ws.close();
  }
});
