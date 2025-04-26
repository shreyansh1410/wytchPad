"use client";

import { useEffect, useState, useRef } from "react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket || loading) return;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat" && data.message) {
        setChats((prev) => [...prev, data.message]);
      }
    };

    socket.send(
      JSON.stringify({
        type: "join",
        roomId: parseInt(roomId, 10),
      })
    );

    return () => {
      socket.send(
        JSON.stringify({
          type: "leave",
          roomId: parseInt(roomId, 10),
        })
      );
    };
  }, [socket, loading, roomId]);

  useEffect(() => {
    // Auto-scroll to bottom when chats change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const sendMessage = () => {
    if (!socket || !newMessage.trim()) return;

    socket.send(
      JSON.stringify({
        type: "chat",
        message: newMessage.trim(),
        roomId: parseInt(roomId, 10),
      })
    );
    setNewMessage("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#121212",
        minHeight: 0,
      }}
    >
      {loading && (
        <div
          style={{
            padding: "8px 16px",
            background: "#2d3436",
            color: "#fff",
            textAlign: "center",
          }}
        >
          Connecting to chat...
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, minHeight: 0, maxHeight: "calc(100vh - 180px)" }}>
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
        <div ref={messagesEndRef} />
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: 16,
          borderTop: "1px solid #333",
          background: "#121212",
          position: "sticky",
          bottom: 0,
          zIndex: 10,
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
          placeholder={loading ? "Connecting..." : "Type a message..."}
          disabled={loading}
          style={{
            flex: 1,
            background: "#23272a",
            border: "none",
            borderRadius: 8,
            padding: "0.75rem 1rem",
            color: "#fff",
            fontSize: 16,
            outline: "none",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            opacity: loading ? 0.7 : 1,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            background: "#fff",
            color: "#000",
            border: "none",
            borderRadius: 8,
            padding: "0 1.5rem",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 700,
            fontSize: 16,
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            opacity: loading ? 0.7 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
