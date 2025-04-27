"use client";

import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../app/config";
import { useRouter } from "next/navigation";

export function useSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    const ws = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);

    ws.onopen = () => {
      setSocket(ws);
      setLoading(false);
    };

    ws.onclose = (event) => {
      if (event.code === 1008) {
        router.push("/signin");
      }
      setSocket(null);
      setLoading(true);
    };

    return () => {
      ws.close();
    };
  }, [router]);

  return { socket, loading };
}
