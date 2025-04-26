"use client";
import React, { useRef, useEffect } from "react";
import useCanvasDraw from "../../draw";

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    function updateSize() { 
      if (containerRef.current) {
        setSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const { canvasRef, handleMouseDown, handleMouseMove, handleMouseUp } =
    useCanvasDraw(size);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        width: "100%",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {size && (
        <canvas
          ref={canvasRef}
          width={size.width}
          height={size.height}
          style={{
            width: "100%",
            height: "100%",
            background: "#000",
            cursor: "crosshair",
            display: "block",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      )}
    </div>
  );
}
