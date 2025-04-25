import express from "express";
import { getChatController } from "../controllers/chatController";

const chatRouter = express.Router();

chatRouter.get("/:roomId", getChatController);

export default chatRouter;
