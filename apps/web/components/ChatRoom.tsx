import axios from "axios";
import { BACKEND_URL } from "../app/config";

async function getChats(roomId: string) {
  const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
  return res.data.chats;
}

export async function ChatRoom({ roomId }: { roomId: string }) {
  const chats = await getChats(roomId);
}
