"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RoomEntryPage() {
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createRoomLoading, setCreateRoomLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!roomName) {
      setError("Room name is required");
      return;
    }
    setLoading(true);
    try {
      const roomId = await fetch(`/api/room/${roomName}`);
      router.push(`/room/${roomId}`);
    } catch (err: any) {
      setError("Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!roomName) {
      setError("Room name is required");
      return;
    }
    setCreateRoomLoading(true);
    try {
      const res = await fetch("/api/room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Failed to create room");
      } else {
        alert("Room created successfully!");
        setRoomName("");
        // Optionally, navigate to the room
        // router.push(`/room/${roomName}`);
      }
    } catch (err) {
      setError("Failed to create room");
    } finally {
      setCreateRoomLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#121212",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        style={{
          background: "#181a1b",
          borderRadius: 18,
          boxShadow: "0 4px 32px 0 rgba(0,0,0,0.25)",
          padding: "2.5rem 2.5rem 2rem 2.5rem",
          width: 370,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <h2
          style={{
            color: "#fff",
            fontWeight: 700,
            marginBottom: 12,
            fontSize: 28,
            textAlign: "center",
          }}
        >
          Enter or Create a Room
        </h2>
        <label style={{ color: "#cfd8dc", fontWeight: 500, marginBottom: 4 }}>
          Room Name <span style={{ color: "#fff" }}>*</span>
          <input
            placeholder="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
            style={{
              background: "#23272a",
              border: "none",
              borderRadius: 7,
              padding: "0.7rem 1rem",
              color: "#fff",
              fontSize: 16,
              outline: "none",
              marginBottom: 8,
              boxSizing: "border-box",
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            }}
          />
        </label>
        {error && (
          <div style={{ color: "#e57373", marginTop: 8, textAlign: "center" }}>
            {error}
          </div>
        )}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            type="button"
            disabled={loading}
            onClick={handleJoin}
            style={{
              flex: 1,
              background: "#fff",
              color: "#000",
              border: "none",
              borderRadius: 8,
              padding: "0.75rem 0",
              fontWeight: 700,
              fontSize: 18,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "background 0.2s",
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Joining..." : "Join Room"}
          </button>
          <button
            type="button"
            disabled={createRoomLoading}
            onClick={handleCreateRoom}
            style={{
              flex: 1,
              background: "#fff",
              color: "#000",
              border: "none",
              borderRadius: 8,
              padding: "0.75rem 0",
              fontWeight: 700,
              fontSize: 18,
              cursor: createRoomLoading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "background 0.2s",
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              opacity: createRoomLoading ? 0.7 : 1,
            }}
          >
            {createRoomLoading ? "Creating..." : "Create Room"}
          </button>
        </div>
      </form>
    </div>
  );
}
