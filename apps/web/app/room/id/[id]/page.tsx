"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../../../config";
import axios from "axios";

export default function RoomIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await axios.get(`${BACKEND_URL}/room/id/${id}`);
        setRoom(res.data.room);
      } catch (err: any) {
        setError("Room not found");
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [id]);

  if (loading) return <div style={{ color: "#fff", padding: 40 }}>Loading room...</div>;
  if (error) return <div style={{ color: "#fff", padding: 40 }}>{error}</div>;

  return (
    <div style={{ color: "#fff", padding: 40 }}>
      <h2>Room Details</h2>
      <div><strong>ID:</strong> {room.id}</div>
      <div><strong>Slug:</strong> {room.slug}</div>
      <div><strong>Admin ID:</strong> {room.adminId}</div>
    </div>
  );
}
