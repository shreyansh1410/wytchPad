import express from "express";
import authRouter from "./routes/authRoutes";
import roomRouter from "./routes/roomRoutes";
import dotenv from "dotenv";

const app = express();

dotenv.config();
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.use("/auth", authRouter);

app.use("/room", roomRouter);

app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
