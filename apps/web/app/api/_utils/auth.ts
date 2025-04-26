import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export async function getUserIdFromRequest(
  req: NextRequest
): Promise<string | null> {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET!);
    if (typeof decoded === "string" || !decoded) return null;

    if ("id" in decoded && typeof decoded.id === "string") {
      return decoded.id;
    }

    return null;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}
