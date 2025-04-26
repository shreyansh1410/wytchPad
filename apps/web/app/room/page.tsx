"use client";
import { useRouter } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => res.json());
};

export default function RoomDashboardPage() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR("/api/room/my", fetcher);

  const handleJoin = (roomId: number) => {
    router.push(`/canvas/${roomId}`);
  };

  const handleCreateRoom = () => {
    router.push("/room/create");
  };

  if (isLoading) {
    return (
      <div style={{ color: "#fff", textAlign: "center", marginTop: 100 }}>
        Loading your rooms...
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ color: "#e57373", textAlign: "center", marginTop: 100 }}>
        Failed to load rooms
      </div>
    );
  }
  const rooms = data?.rooms || [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#121212",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem 0",
      }}
    >
      <div style={{ width: 420, maxWidth: "90vw", marginBottom: 32 }}>
        <button
          onClick={handleCreateRoom}
          style={{
            width: "100%",
            padding: "1rem 0",
            borderRadius: 12,
            background: "#fff",
            color: "#000",
            fontWeight: 700,
            fontSize: 20,
            border: "none",
            marginBottom: 20,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          }}
        >
          + Create New Room
        </button>
        <h1
          style={{
            color: "#fff",
            fontSize: 28,
            marginBottom: 18,
            textAlign: "center",
            fontWeight: 700,
          }}
        >
          Your Rooms
        </h1>
        {rooms.length === 0 ? (
          <div style={{ color: "#cfd8dc", textAlign: "center" }}>
            You haven't created any rooms yet.
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {rooms.map((room: any) => (
              <li
                key={room.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#181a1b",
                  borderRadius: 10,
                  padding: "1rem 1.5rem",
                  marginBottom: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                }}
              >
                <div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                    {room.slug}
                  </div>
                  <div style={{ color: "#cfd8dc", fontSize: 13 }}>
                    Room ID: {room.id}
                  </div>
                  <div style={{ color: "#757575", fontSize: 12 }}>
                    Created: {new Date(room.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => handleJoin(room.id)}
                  style={{
                    background: "#fff",
                    color: "#000",
                    border: "none",
                    borderRadius: 8,
                    padding: "0.6rem 1.2rem",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                  }}
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
