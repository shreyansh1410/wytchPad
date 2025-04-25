import express from "express";
import {
  signUpController,
  signInController,
} from "../controllers/authController";

const authRouter = express.Router();

authRouter.post("/signup", signUpController);
authRouter.post("/signin", signInController);

export default authRouter;
