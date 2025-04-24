import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer();

wss.on("connection", (ws: WebSocket) => {
    console.log("Client connected");
    ws.on("message", (message) => {
        console.log("Message received: ", message);
    });
});
