import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const roomId = (await params).roomId;
  const roomIdNum = Number(roomId);
  if (!roomIdNum || isNaN(roomIdNum)) {
    return NextResponse.json({ msg: "Invalid room id" }, { status: 400 });
  }

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomIdNum },
    });

    if (!room) {
      console.log("Room not found for id:", roomIdNum);
      return NextResponse.json({ msg: "room not found" }, { status: 404 });
    }

    return NextResponse.json({ room });
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
