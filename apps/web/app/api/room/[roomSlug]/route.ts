import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomSlug: string }> }
) {
  const { roomSlug } = await params;
  if (!roomSlug) {
    return NextResponse.json({ msg: "Room slug is required" }, { status: 400 });
  }

  try {
    const room = await prisma.room.findFirst({
      where: {
        slug: roomSlug,
      },
    });

    if (!room) {
      return NextResponse.json({ msg: "room not found" }, { status: 404 });
    }

    return NextResponse.json({
      roomId: room.id,
    });
  } catch (err) {
    console.error("Error finding room:", err);
    return NextResponse.json(
      {
        msg: "Error finding room",
        error: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}
