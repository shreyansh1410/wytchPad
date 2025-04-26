"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RoomEntryPage() {
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!slug) {
      setError("Room slug is required");
      return;
    }
    setLoading(true);
    try {
      router.push(`/room/${slug}`);
    } catch (err: any) {
      setError("Failed to join room");
    } finally {
      setLoading(false);
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
        onSubmit={handleJoin}
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
          Enter a Room
        </h2>
        <label style={{ color: "#cfd8dc", fontWeight: 500, marginBottom: 4 }}>
          Room Slug <span style={{ color: "#fff" }}>*</span>
          <input
            placeholder="Room slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
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
          <div style={{ color: "#e57373", marginTop: 8, textAlign: "center" }}>{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#fff",
            color: "#000",
            border: "none",
            borderRadius: 8,
            padding: "0.75rem 0",
            fontWeight: 700,
            fontSize: 18,
            marginTop: 6,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "background 0.2s",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Joining..." : "Join Room"}
        </button>
      </form>
    </div>
  );
}
