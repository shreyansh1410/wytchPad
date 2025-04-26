"use client";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../../config";
import axios from "axios";

export default function RoomSlug({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);

  useEffect(() => {
    async function fetchAndRedirect() {
      try {
        const res = await axios.get(`${BACKEND_URL}/room/${slug}`);
        if (res.data && res.data.roomId) {
          router.replace(`/room/id/${res.data.roomId}`);
        } else {
          router.replace("/room?error=notfound");
        }
      } catch (err) {
        router.replace("/room?error=notfound");
      }
    }
    fetchAndRedirect();
  }, [slug, router]);

  return <div style={{ color: "#fff", padding: 40 }}>Resolving room...</div>;
}
