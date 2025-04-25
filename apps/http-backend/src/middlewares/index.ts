import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export const middleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Parse and validate the Authorization header: must be 'Bearer <token>'
    const authHeader = (req.headers["authorization"] || req.headers["Authorization"]) as string;
    if (!authHeader) {
      return res.status(401).json({ msg: "No Authorization header provided" });
    }
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ msg: "Invalid Authorization header format" });
    }
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
