"use client";

import { useEffect, useRef, useState } from "react";
import { initDraw } from "../draw";
import IconButton from "./IconButton";

enum Shape {
  Pencil,
  Rectangle,
  Circle,
}

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
  const [selectedTool, setSelectedTool] = useState<Shape>(Shape.Rectangle);

  useEffect(() => {
    //@ts-ignore
    window.selectedTool = Shape[selectedTool].toLowerCase();
  }, [selectedTool]);

  useEffect(() => {
    if (canvasRef.current) {
      initDraw(canvasRef.current, roomId, socket);
    }
  }, [canvasRef, roomId, socket]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
      <canvas
        ref={canvasRef}
        width={1500}
        height={600}
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
  selectedTool: Shape;
  setSelectedTool: (s: Shape) => void;
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
        activated={selectedTool === Shape.Pencil}
        icon={<PencilIcon />}
        onClick={() => setSelectedTool(Shape.Pencil)}
      />
      <IconButton
        activated={selectedTool === Shape.Rectangle}
        icon={<RectangleIcon />}
        onClick={() => setSelectedTool(Shape.Rectangle)}
      />
      <IconButton
        activated={selectedTool === Shape.Circle}
        icon={<CircleIcon />}
        onClick={() => setSelectedTool(Shape.Circle)}
      />
    </div>
  );
}
