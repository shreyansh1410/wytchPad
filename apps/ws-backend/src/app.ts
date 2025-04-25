import "dotenv/config";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { createRoomSchmea } from "@repo/common/types";

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
    ws.send("pong");
  });
});
