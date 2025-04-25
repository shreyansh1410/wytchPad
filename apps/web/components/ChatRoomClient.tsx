"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatClient({
  messages,
  roomId,
}: {
  messages: string[];
  roomId: string;
}) {
  const [chats, setChats] = useState(messages);
  const [newMessage, setNewMessage] = useState("");
  const { socket, loading } = useSocket();

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;
    socket.send(
      JSON.stringify({ type: "chat", message: newMessage.trim(), roomId })
    );
    setNewMessage("");
  };

  useEffect(() => {
    if (socket && !loading) {
      socket.send(
        JSON.stringify({
          type: "join",
          roomId,
        })
      );
      socket.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === "chat") {
          setChats((c) => [...c, parsedData.message]);
        }
      };
    }
  }, [socket, loading, roomId]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#121212",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {chats.map((chat, index) => (
          <div
            key={index}
            style={{
              marginBottom: 12,
              color: "#fff",
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            }}
          >
            {chat}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: 16,
          borderTop: "1px solid #333",
        }}
      >
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message..."
          style={{
            flex: 1,
            background: "#23272a",
            border: "none",
            borderRadius: 8,
            padding: "0.75rem 1rem",
            color: "#fff",
            fontSize: 16,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            background: "#fff",
            color: "#000",
            border: "none",
            borderRadius: 8,
            padding: "0 1.5rem",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "background 0.2s",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
