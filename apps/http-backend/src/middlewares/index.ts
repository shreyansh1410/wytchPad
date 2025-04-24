import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export const middleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers["authorization"] ?? "";
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded !== "string" && "userId" in decoded) {
      req.userId = (decoded as JwtPayload).userId as string;
      next();
    } else {
      res.status(403).json({
        msg: "Unauthorised",
      });
    }
  } catch (err) {
    res.status(500).json({
      msg: "error decoding token",
      err,
    });
  }
};
