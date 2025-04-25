import express from "express";
import {
  roomController,
  getRoomIdController,
  getRoomByIdController,
} from "../controllers/roomController";
import { middleware } from "../middlewares";

const roomRouter = express.Router();

roomRouter.post("/create", roomController);
roomRouter.get("/:roomSlug", getRoomIdController);
roomRouter.get("/id/:roomId", getRoomByIdController);

export default roomRouter;
