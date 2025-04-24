import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
export const signUpController = (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const token = jwt.sign({ username, password }, JWT_SECRET);
    res.status(200).json({
      token,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error signing up",
      err,
    });
  }
};
