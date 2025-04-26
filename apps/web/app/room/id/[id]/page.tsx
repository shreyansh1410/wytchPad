"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../../../config";
import axios from "axios";
import { ChatClient } from "../../../../components/ChatRoomClient";

export default function RoomIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [room, setRoom] = useState<any>(null);
  const [chats, setChats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchRoom() {
      try {
        const [roomRes, chatsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/room/id/${id}`),
          axios.get(`${BACKEND_URL}/chats/${id}`),
        ]);

        setRoom(roomRes.data.room);
        setChats(
          chatsRes.data.chats.map((chat: any) => chat.message).reverse()
        );
      } catch (err: any) {
        setError(err.response?.data?.msg || "Error loading room");
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [id]);

  if (loading)
    return <div style={{ color: "#fff", padding: 40 }}>Loading room...</div>;
  if (error) return <div style={{ color: "#fff", padding: 40 }}>{error}</div>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        color: "#fff",
      }}
    >
      <div style={{ padding: "20px", borderBottom: "1px solid #333" }}>
        <h2>Room: {room.slug}</h2>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <ChatClient messages={chats} roomId={id} />
      </div>
    </div>
  );
}
