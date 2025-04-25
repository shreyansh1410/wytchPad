import express from "express";
import { roomController } from "../controllers/roomController";
import { middleware } from "../middlewares";

const roomRouter = express.Router();

roomRouter.post("/room", middleware, roomController);

export default roomRouter;
