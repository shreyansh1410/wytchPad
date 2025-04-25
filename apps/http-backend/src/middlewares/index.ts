import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export const middleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers["authorization"] ?? "";
    const decoded = jwt.verify(token, JWT_SECRET!);
    if (typeof decoded !== "string" && "id" in decoded) {
      req.userId = (decoded as { id: string }).id;
      next();
    } else {
      res.status(403).json({
        msg: "Middleware has blocked your access: Invalid token payload",
      });
    }
  } catch (err) {
    res.status(500).json({
      msg: "error decoding token",
      error: err instanceof Error ? err.message : err,
    });
  }
};
