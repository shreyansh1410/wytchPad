import "dotenv/config";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { createRoomSchmea } from "@repo/common/types";
import { prisma } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws: WebSocket, request) => {
  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") ?? "";
  const decoded = jwt.verify(token, JWT_SECRET);
  if (typeof decoded === "string") return;
  if (!decoded || !decoded.userId) {
    ws.close();
    return;
  }
  const userId = decoded.userId;
  ws.on("message", (message) => {
    try{
      const data = JSON.parse(message.toString());
      const res = createRoomSchmea.safeParse(data);
      if (!res.success) {
        ws.send(JSON.stringify({error: "Invalid room creation data"}));
        return;
      }
      ws.send("pong");
    }catch(err){
      ws.send(JSON.stringify({error: "Internal server error in WS"}))
    }
  });
});
