export function initDraw(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");

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
  const rectangles: Rect[] = [];

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
      rectangles.push({ ...currentRect });
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

  // Initial draw
  drawAll();
}
