"use client";

import { useEffect, useRef, useState } from "react";
import { Game } from "../draw/Game";
import IconButton from "./IconButton";

enum Tool {
  Pencil,
  Rectangle,
  Circle,
}
export { Tool };

const PencilIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);
const RectangleIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

const CircleIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>(Tool.Rectangle);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      gameRef.current = new Game(
        canvasRef.current,
        roomId,
        socket,
        selectedTool
      );
    }
    if (gameRef.current) {
      gameRef.current.setTool(selectedTool);
    }
  }, [canvasRef, roomId, socket, selectedTool]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          display: "block",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      ></canvas>
    </div>
  );
}

function TopBar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 10,
        display: "flex",
        gap: 8,
      }}
    >
      <IconButton
        activated={selectedTool === Tool.Pencil}
        icon={<PencilIcon />}
        onClick={() => setSelectedTool(Tool.Pencil)}
      />
      <IconButton
        activated={selectedTool === Tool.Rectangle}
        icon={<RectangleIcon />}
        onClick={() => setSelectedTool(Tool.Rectangle)}
      />
      <IconButton
        activated={selectedTool === Tool.Circle}
        icon={<CircleIcon />}
        onClick={() => setSelectedTool(Tool.Circle)}
      />
    </div>
  );
}
