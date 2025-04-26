import express, { Request, Response } from "express";
import authRouter from "./routes/authRoutes";
import roomRouter from "./routes/roomRoutes";
import chatRouter from "./routes/chatRoutes";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "ws://localhost:8080"],
  })
);

dotenv.config();
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.use("/auth", authRouter);
app.use("/chats", chatRouter);
app.use("/room", roomRouter);

app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({
    message: "hello",
  });
  return;
});

app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
