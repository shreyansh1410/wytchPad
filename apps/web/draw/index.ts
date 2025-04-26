import axios from "axios";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    };

async function getExistingShapes(roomId: string) {
  const res = await axios.get(`/api/chats/${roomId}`);
  const chats = Array.isArray(res.data) ? res.data : res.data.chats || [];
  const shapes = chats.map((c: { message: string }) => {
    const chatData = JSON.parse(c.message);
    return chatData;
  });
  return shapes;
}

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d");

  let existingShapes: Shape[] = await getExistingShapes(roomId);
  console.log(existingShapes);

  const rectangles: Rect[] = existingShapes
    .filter((shape): shape is Rect & { type: "rect" } => shape.type === "rect")
    .map((rect) => ({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    }));

  if (!ctx) {
    return;
  }

  ctx.fillStyle = "rgba(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let clicked = false;
  let startX = 0;
  let startY = 0;
  type Rect = { x: number; y: number; width: number; height: number };
  let currentRect: Rect | null = null;
  let currentCircle: {
    centerX: number;
    centerY: number;
    radius: number;
  } | null = null;

  function drawAll() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255, 255, 255)";
    rectangles.forEach((rect) => {
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });
    existingShapes.forEach((shape) => {
      if (shape.type === "circle" && shape.radius > 0) {
        ctx.beginPath();
        ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
      }
    });
    if (currentRect) {
      ctx.strokeRect(
        currentRect.x,
        currentRect.y,
        currentRect.width,
        currentRect.height
      );
    }
    if (currentCircle && currentCircle.radius > 0) {
      ctx.beginPath();
      ctx.arc(
        currentCircle.centerX,
        currentCircle.centerY,
        currentCircle.radius,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.closePath();
    }
  }

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX - canvas.getBoundingClientRect().left;
    startY = e.clientY - canvas.getBoundingClientRect().top;
    currentRect = null;
    //@ts-ignore
    const selectTool = window.selectedTool;
    if (selectTool === "circle") {
      currentCircle = null;
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;
      const width = mouseX - startX;
      const height = mouseY - startY;
      //@ts-ignore
      const selectTool = window.selectedTool;
      if (selectTool === "rectangle") {
        currentRect = { x: startX, y: startY, width, height };
        currentCircle = null;
      } else if (selectTool === "circle") {
        const centerX = startX + width / 2;
        const centerY = startY + height / 2;
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        currentCircle = { centerX, centerY, radius };
        currentRect = null;
      }
      drawAll();
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    //@ts-ignore
    const selectTool = window.selectedTool;
    if (clicked) {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;
      if (selectTool === "rectangle" && currentRect) {
        const shape: Shape = {
          type: "rect",
          x: currentRect.x,
          y: currentRect.y,
          width: currentRect.width,
          height: currentRect.height,
        };
        socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify(shape),
            roomId,
          })
        );
      } else if (
        selectTool === "circle" &&
        currentCircle &&
        currentCircle.radius > 0
      ) {
        const shape: Shape = {
          type: "circle",
          centerX: currentCircle.centerX,
          centerY: currentCircle.centerY,
          radius: currentCircle.radius,
        };
        socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify(shape),
            roomId,
          })
        );
      }
    }
    clicked = false;
    currentRect = null;
    currentCircle = null;
    drawAll();
  });

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "chat") {
      const shape = JSON.parse(data.message);
      // Prevent duplicate shapes by checking if a shape with same properties exists
      const isDuplicate = existingShapes.some((s) => {
        if (s.type !== shape.type) return false;
        if (s.type === "rect") {
          return (
            s.x === shape.x &&
            s.y === shape.y &&
            s.width === shape.width &&
            s.height === shape.height
          );
        } else if (s.type === "circle") {
          return (
            s.centerX === shape.centerX &&
            s.centerY === shape.centerY &&
            s.radius === shape.radius
          );
        }
        return false;
      });
      if (!isDuplicate) {
        existingShapes.push(shape);
        if (shape.type === "rect") {
          rectangles.push({
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
          });
        }
        drawAll();
      }
    }
  };

  drawAll();
}
