import { useRef, useState, useEffect } from "react";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function useCanvasDraw(size: { width: number; height: number } | null) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [current, setCurrent] = useState<{ x: number; y: number } | null>(null);
  const [rects, setRects] = useState<Rect[]>([]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setCurrent(null);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !start) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCurrent({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = () => {
    if (isDrawing && start && current) {
      const x = Math.min(start.x, current.x);
      const y = Math.min(start.y, current.y);
      const w = Math.abs(current.x - start.x);
      const h = Math.abs(current.y - start.y);
      if (w > 0 && h > 0) {
        setRects((prev) => [...prev, { x, y, w, h }]);
      }
    }
    setIsDrawing(false);
    setStart(null);
    setCurrent(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    rects.forEach((r) => {
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    });
    if (isDrawing && start && current) {
      const x = Math.min(start.x, current.x);
      const y = Math.min(start.y, current.y);
      const w = Math.abs(current.x - start.x);
      const h = Math.abs(current.y - start.y);
      ctx.strokeRect(x, y, w, h);
    }
    ctx.restore();
  }, [isDrawing, start, current, rects, size]);

  return {
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}

export default useCanvasDraw;
