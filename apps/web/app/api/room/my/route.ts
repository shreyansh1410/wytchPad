import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db/client";
import { getUserIdFromRequest } from "../../_utils/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ msg: "user not authenticated" }, { status: 401 });
    }
    const rooms = await prisma.room.findMany({
      where: { adminId: userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, slug: true, createdAt: true },
    });
    return NextResponse.json({ rooms });
  } catch (err) {
    console.error("Error fetching user's rooms:", err);
    return NextResponse.json(
      {
        msg: "error fetching rooms",
        error: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}
