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

  // Populate rectangles with pre-existing rect shapes from DB
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

  function drawAll() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255, 255, 255)";
    rectangles.forEach((rect) => {
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });
    if (currentRect) {
      ctx.strokeRect(
        currentRect.x,
        currentRect.y,
        currentRect.width,
        currentRect.height
      );
    }
  }

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX - canvas.getBoundingClientRect().left;
    startY = e.clientY - canvas.getBoundingClientRect().top;
    currentRect = null;
  });

  canvas.addEventListener("mouseup", (e) => {
    if (clicked && currentRect) {
      const shape: Shape = {
        type: "rect",
        x: currentRect.x,
        y: currentRect.y,
        width: currentRect.width,
        height: currentRect.height,
      };
      rectangles.push({ ...currentRect });
      existingShapes.push(shape);

      socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify(shape),
          roomId,
        })
      );
    }
    clicked = false;
    currentRect = null;
    drawAll();
  });

  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;
      const width = mouseX - startX;
      const height = mouseY - startY;
      currentRect = { x: startX, y: startY, width, height };
      drawAll();
    }
  });

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "chat") {
      const shape = JSON.parse(data.message);
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
  };

  drawAll();
}
