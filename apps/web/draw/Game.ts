import axios from "axios";
import { Tool } from "../components/Canvas";

type Shape =
  | {
      id: string;
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      id: string;
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      id: string;
      type: "pencil";
      points: { x: number; y: number }[];
      color?: string;
    };

type Rect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "rect";
};
type PencilPath = { points: { x: number; y: number }[] };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private roomId: string;
  private socket: WebSocket;
  private rectangles: Rect[] = [];
  private existingShapes: Shape[] = [];
  private clicked = false;
  private startX = 0;
  private startY = 0;
  private currentRect: Rect | null = null;
  private currentCircle: {
    centerX: number;
    centerY: number;
    radius: number;
  } | null = null;
  private currentPencilPath: PencilPath = { points: [] };
  private isDrawing = false;
  public selectedTool: Tool;

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    selectedTool: Tool
  ) {
    this.canvas = canvas;
    this.roomId = roomId;
    this.socket = socket;
    this.selectedTool = selectedTool;
    this.ctx = this.canvas.getContext("2d");
    this.init();
  }

  private async init() {
    this.existingShapes = await this.getExistingShapes(this.roomId);
    this.rectangles = this.existingShapes
      .filter(
        (shape): shape is Shape & { type: "rect" } => shape.type === "rect"
      )
      .map((rect) => ({
        id: rect.id,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        type: "rect",
      }));
    this.drawAll();
    this.addEventListeners();
    this.socket.onmessage = this.handleSocketMessage;
  }

  private async getExistingShapes(roomId: string) {
    const res = await axios.get(`/api/chats/${roomId}`);
    const chats = Array.isArray(res.data) ? res.data : res.data.chats || [];
    const shapes = chats
      .map((c: { message: string; id: number }) => {
        try {
          const chatData = JSON.parse(c.message);

          // Ensure each shape has an ID - use the chat ID if shape ID is missing
          if (!chatData.id) {
            chatData.id = `chat_${c.id}`;
            console.log(`Added ID to shape: ${chatData.id}`);
          }

          return chatData;
        } catch (err) {
          console.error("Failed to parse chat message:", c.message);
          return null;
        }
      })
      .filter((shape: any) => shape !== null);

    return shapes;
  }

  private drawAll = () => {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "rgba(255, 255, 255)";

    // Draw all saved shapes
    this.existingShapes.forEach((shape) => {
      if (shape.type === "rect") {
        this.ctx!.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle" && shape.radius > 0) {
        this.ctx!.beginPath();
        this.ctx!.arc(
          shape.centerX,
          shape.centerY,
          shape.radius,
          0,
          Math.PI * 2
        );
        this.ctx!.stroke();
        this.ctx!.closePath();
      } else if (shape.type === "pencil" && shape.points.length > 0) {
        this.ctx!.beginPath();
        this.ctx!.moveTo(shape.points[0]!.x, shape.points[0]!.y);

        for (let i = 1; i < shape.points.length; i++) {
          this.ctx!.lineTo(shape.points[i]!.x, shape.points[i]!.y);
        }

        this.ctx!.stroke();
        this.ctx!.closePath();
      }
    });

    // Draw only the preview for the current tool
    if (this.selectedTool === Tool.Rectangle && this.currentRect) {
      this.ctx!.strokeRect(
        this.currentRect.x,
        this.currentRect.y,
        this.currentRect.width,
        this.currentRect.height
      );
    } else if (
      this.selectedTool === Tool.Circle &&
      this.currentCircle &&
      this.currentCircle.radius > 0
    ) {
      this.ctx!.beginPath();
      this.ctx!.arc(
        this.currentCircle.centerX,
        this.currentCircle.centerY,
        this.currentCircle.radius,
        0,
        Math.PI * 2
      );
      this.ctx!.stroke();
      this.ctx!.closePath();
    } else if (
      this.selectedTool === Tool.Pencil &&
      this.currentPencilPath.points.length > 0
    ) {
      const points = this.currentPencilPath.points;
      this.ctx!.beginPath();
      this.ctx!.moveTo(points[0]!.x, points[0]!.y);

      for (let i = 1; i < points.length; i++) {
        this.ctx!.lineTo(points[i]!.x, points[i]!.y);
      }

      this.ctx!.stroke();
      this.ctx!.closePath();
    }
  };

  private addEventListeners() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("mouseleave", this.handleMouseLeave);
  }

  private async deleteShapeFromServer(shape: Shape) {
    try {
      // Check if shape has an ID
      if (!shape.id) {
        console.error("Attempting to delete shape without ID:", shape);
        // Assign an ID if missing
        shape.id = window.crypto.randomUUID();
      }

      console.log("Attempting to delete shape with ID:", shape.id);
      console.log("Request payload:", { id: shape.id });

      const response = await axios.post(`/api/chats/${this.roomId}`, {
        id: shape.id,
      });
      console.log("Delete response:", response.data);

      this.socket.send(
        JSON.stringify({
          type: "delete",
          message: JSON.stringify(shape),
          roomId: this.roomId,
        })
      );
    } catch (error) {
      console.error("Error deleting shape:", error);
      // restoring the shape if deletion fails
      this.existingShapes.push(shape);
      this.drawAll();
    }
  }

  private isPointOnRect(x: number, y: number, rect: Shape & { type: "rect" }) {
    return (
      x >= rect.x &&
      x <= rect.x + rect.width &&
      y >= rect.y &&
      y <= rect.y + rect.height
    );
  }

  private isPointOnCircle(
    x: number,
    y: number,
    circle: { centerX: number; centerY: number; radius: number }
  ) {
    const dx = x - circle.centerX;
    const dy = y - circle.centerY;
    return dx * dx + dy * dy <= circle.radius * circle.radius;
  }

  private isPointOnPencil(
    x: number,
    y: number,
    points: { x: number; y: number }[],
    threshold = 6
  ) {
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (p1 && p2) {
        const dist = this.pointToSegmentDistance(x, y, p1, p2);
        if (dist <= threshold) return true;
      }
    }
    return false;
  }

  private pointToSegmentDistance(
    x: number,
    y: number,
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ) {
    const A = x - p1.x;
    const B = y - p1.y;
    const C = p2.x - p1.x;
    const D = p2.y - p1.y;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;
    let xx, yy;
    if (param < 0) {
      xx = p1.x;
      yy = p1.y;
    } else if (param > 1) {
      xx = p2.x;
      yy = p2.y;
    } else {
      xx = p1.x + param * C;
      yy = p1.y + param * D;
    }
    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private eraseShapeAt(x: number, y: number) {
    const idx = this.existingShapes.findIndex((shape) => {
      if (shape.type === "rect") {
        return this.isPointOnRect(x, y, shape);
      } else if (shape.type === "circle") {
        return this.isPointOnCircle(x, y, shape);
      } else if (shape.type === "pencil") {
        return this.isPointOnPencil(x, y, shape.points);
      }
      return false;
    });

    if (idx !== -1) {
      const shapeToRemove = this.existingShapes[idx]!;

      // Debug the shape before removing
      console.log("Found shape to remove:", shapeToRemove);

      // Make sure we have an ID
      if (!shapeToRemove.id) {
        console.error("Shape is missing ID!", shapeToRemove);
        // Generate an ID if missing
        shapeToRemove.id = window.crypto.randomUUID();
      }

      this.existingShapes.splice(idx, 1);

      if (shapeToRemove.type === "rect") {
        this.rectangles = this.rectangles.filter(
          (r) => r.id !== shapeToRemove.id
        );
      }

      this.deleteShapeFromServer(shapeToRemove);
      this.drawAll();
    }
  }

  private handleMouseDown = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.clientX - this.canvas.getBoundingClientRect().left;
    this.startY = e.clientY - this.canvas.getBoundingClientRect().top;

    if (this.selectedTool === Tool.Rectangle) {
      this.currentRect = null;
    } else if (this.selectedTool === Tool.Circle) {
      this.currentCircle = null;
    } else if (this.selectedTool === Tool.Pencil) {
      this.isDrawing = true;
      this.currentPencilPath = {
        points: [{ x: this.startX, y: this.startY }],
      };
    } else if (this.selectedTool === Tool.Eraser) {
      this.eraseShapeAt(this.startX, this.startY);
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    const mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - this.canvas.getBoundingClientRect().top;

    if (this.clicked) {
      const width = mouseX - this.startX;
      const height = mouseY - this.startY;

      if (this.selectedTool === Tool.Rectangle) {
        this.currentRect = {
          id: window.crypto.randomUUID(),
          x: this.startX,
          y: this.startY,
          width,
          height,
          type: "rect",
        };
        this.currentCircle = null;
      } else if (this.selectedTool === Tool.Circle) {
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        this.currentCircle = { centerX, centerY, radius };
        this.currentRect = null;
      } else if (this.selectedTool === Tool.Pencil && this.isDrawing) {
        // Add point to the current pencil path
        this.currentPencilPath.points.push({ x: mouseX, y: mouseY });
      }

      this.drawAll();
    }

    // Handle eraser - even if mouse is not clicked
    // This allows showing visual feedback when hovering over erasable shapes
    if (this.selectedTool === Tool.Eraser) {
      // If mouse is clicked, we're actively erasing
      if (this.clicked) {
        this.eraseShapeAt(mouseX, mouseY);
      } else {
        // Optional: You could add hover effects here
        // For example, highlighting the shape that would be erased
        this.drawAll();

        // Find shape under cursor
        const hoverShape = this.existingShapes.find((shape) => {
          if (shape.type === "rect") {
            return this.isPointOnRect(mouseX, mouseY, shape);
          } else if (shape.type === "circle") {
            return this.isPointOnCircle(mouseX, mouseY, shape);
          } else if (shape.type === "pencil") {
            return this.isPointOnPencil(mouseX, mouseY, shape.points);
          }
          return false;
        });

        // If there's a shape under cursor, highlight it
        if (hoverShape && this.ctx) {
          this.ctx.save();
          this.ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
          this.ctx.lineWidth = 2;

          if (hoverShape.type === "rect") {
            this.ctx.strokeRect(
              hoverShape.x,
              hoverShape.y,
              hoverShape.width,
              hoverShape.height
            );
          } else if (hoverShape.type === "circle") {
            this.ctx.beginPath();
            this.ctx.arc(
              hoverShape.centerX,
              hoverShape.centerY,
              hoverShape.radius,
              0,
              Math.PI * 2
            );
            this.ctx.stroke();
          } else if (hoverShape.type === "pencil") {
            this.ctx.beginPath();
            this.ctx.moveTo(hoverShape.points[0]!.x, hoverShape.points[0]!.y);
            for (let i = 1; i < hoverShape.points.length; i++) {
              this.ctx.lineTo(hoverShape.points[i]!.x, hoverShape.points[i]!.y);
            }
            this.ctx.stroke();
          }

          this.ctx.restore();
        }
      }
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (this.clicked) {
      const mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - this.canvas.getBoundingClientRect().top;

      if (this.selectedTool === Tool.Rectangle && this.currentRect) {
        const shapeId = window.crypto.randomUUID();
        const shape: Shape = {
          id: shapeId,
          type: "rect",
          x: this.currentRect.x,
          y: this.currentRect.y,
          width: this.currentRect.width,
          height: this.currentRect.height,
        };
        this.sendShapeToServer(shape);
      } else if (
        this.selectedTool === Tool.Circle &&
        this.currentCircle &&
        this.currentCircle.radius > 0
      ) {
        const shape: Shape = {
          id: window.crypto.randomUUID(),
          type: "circle",
          centerX: this.currentCircle.centerX,
          centerY: this.currentCircle.centerY,
          radius: this.currentCircle.radius,
        };
        this.sendShapeToServer(shape);
      } else if (
        this.selectedTool === Tool.Pencil &&
        this.isDrawing &&
        this.currentPencilPath.points.length > 1
      ) {
        const shape: Shape = {
          id: window.crypto.randomUUID(),
          type: "pencil",
          points: this.currentPencilPath.points,
        };
        this.sendShapeToServer(shape);
      }
    }

    this.clicked = false;
    this.isDrawing = false;
    this.currentRect = null;
    this.currentCircle = null;
    this.currentPencilPath = { points: [] };
    this.drawAll();
  };

  private handleMouseLeave = (e: MouseEvent) => {
    if (this.clicked || this.isDrawing) {
      this.handleMouseUp(e);
    }
  };

  private sendShapeToServer(shape: Shape) {
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify(shape),
        roomId: this.roomId,
      })
    );
  }

  private handleSocketMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    if (data.type === "chat") {
      const shape = JSON.parse(data.message);
      if (!shape.id) {
        shape.id = window.crypto.randomUUID();
        console.log("Added missing ID to shape from socket:", shape.id);
      }
      const isDuplicate = this.existingShapes.some((s) => {
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
        } else if (s.type === "pencil") {
          if (s.points.length !== shape.points.length) return false;
          return (
            JSON.stringify(s.points[0]) === JSON.stringify(shape.points[0]) &&
            JSON.stringify(s.points[s.points.length - 1]) ===
              JSON.stringify(shape.points[shape.points.length - 1])
          );
        }
        return false;
      });

      if (!isDuplicate) {
        this.existingShapes.push(shape);
        if (shape.type === "rect") {
          this.rectangles.push({
            id: shape.id,
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            type: "rect",
          });
        }
        this.drawAll();
      }
    } else if (data.type === "delete") {
      const shape = JSON.parse(data.message);
      this.existingShapes = this.existingShapes.filter((s) => {
        if (s.type !== shape.type) return true;
        if (s.type === "rect") {
          return !(
            s.x === shape.x &&
            s.y === shape.y &&
            s.width === shape.width &&
            s.height === shape.height
          );
        } else if (s.type === "circle") {
          return !(
            s.centerX === shape.centerX &&
            s.centerY === shape.centerY &&
            s.radius === shape.radius
          );
        } else if (s.type === "pencil") {
          if (s.points.length !== shape.points.length) return true;
          return !(
            JSON.stringify(s.points[0]) === JSON.stringify(shape.points[0]) &&
            JSON.stringify(s.points[s.points.length - 1]) ===
              JSON.stringify(shape.points[shape.points.length - 1])
          );
        }
        return true;
      });
      this.drawAll();
    }
  };

  public setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  public destroy() {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("mouseleave", this.handleMouseLeave);
    if (this.socket) {
      this.socket.onmessage = null;
    }
  }
}
