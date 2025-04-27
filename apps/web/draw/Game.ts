import axios from "axios";
import { Tool } from "../components/Canvas";

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

type Rect = { x: number; y: number; width: number; height: number };

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
        (shape): shape is Rect & { type: "rect" } => shape.type === "rect"
      )
      .map((rect) => ({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      }));
    this.drawAll();
    this.addEventListeners();
    this.socket.onmessage = this.handleSocketMessage;
  }

  private async getExistingShapes(roomId: string) {
    const res = await axios.get(`/api/chats/${roomId}`);
    const chats = Array.isArray(res.data) ? res.data : res.data.chats || [];
    const shapes = chats.map((c: { message: string }) => {
      const chatData = JSON.parse(c.message);
      return chatData;
    });
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
        this.ctx!.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
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
    } else if (this.selectedTool === Tool.Circle && this.currentCircle && this.currentCircle.radius > 0) {
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
    }
  };

  private addEventListeners() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
  }

  private handleMouseDown = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.clientX - this.canvas.getBoundingClientRect().left;
    this.startY = e.clientY - this.canvas.getBoundingClientRect().top;
    this.currentRect = null;
    if (this.selectedTool === Tool.Circle) {
      this.currentCircle = null;
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (this.clicked) {
      const mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - this.canvas.getBoundingClientRect().top;
      const width = mouseX - this.startX;
      const height = mouseY - this.startY;
      if (this.selectedTool === Tool.Rectangle) {
        this.currentRect = { x: this.startX, y: this.startY, width, height };
        this.currentCircle = null;
      } else if (this.selectedTool === Tool.Circle) {
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        this.currentCircle = { centerX, centerY, radius };
        this.currentRect = null;
      }
      this.drawAll();
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (this.clicked) {
      const mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - this.canvas.getBoundingClientRect().top;
      if (this.selectedTool === Tool.Rectangle && this.currentRect) {
        const shape: Shape = {
          type: "rect",
          x: this.currentRect.x,
          y: this.currentRect.y,
          width: this.currentRect.width,
          height: this.currentRect.height,
        };
        this.socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify(shape),
            roomId: this.roomId,
          })
        );
      } else if (
        this.selectedTool === Tool.Circle &&
        this.currentCircle &&
        this.currentCircle.radius > 0
      ) {
        const shape: Shape = {
          type: "circle",
          centerX: this.currentCircle.centerX,
          centerY: this.currentCircle.centerY,
          radius: this.currentCircle.radius,
        };
        this.socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify(shape),
            roomId: this.roomId,
          })
        );
      }
    }
    this.clicked = false;
    this.currentRect = null;
    this.currentCircle = null;
    this.drawAll();
  };

  private handleSocketMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    if (data.type === "chat") {
      const shape = JSON.parse(data.message);
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
        }
        return false;
      });
      if (!isDuplicate) {
        this.existingShapes.push(shape);
        if (shape.type === "rect") {
          this.rectangles.push({
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
          });
        }
        this.drawAll();
      }
    }
  };

  public setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  public destroy() {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    if (this.socket) {
      this.socket.onmessage = null;
    }
  }
}
