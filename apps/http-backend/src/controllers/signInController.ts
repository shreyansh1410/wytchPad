import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SignInSchema } from "@repo/common/types";

export const signInController = (req: Request, res: Response) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET!;
    const { username, password } = req.body;
    const userId = 1;
    const token = jwt.sign({userId}, JWT_SECRET);

    res.status(200).json({
      msg: "signed in successfully",
      token,
    });
  } catch (err) {
    res.status(500).json({
      msg: "error signing in user",
      err,
    });
  }
};
