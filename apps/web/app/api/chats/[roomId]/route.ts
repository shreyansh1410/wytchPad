import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const roomIdNum = Number(roomId);
  if (!roomIdNum || isNaN(roomIdNum)) {
    return NextResponse.json({ msg: "Invalid room id" }, { status: 400 });
  }

  try {
    const room = await prisma.room.findUnique({
      where: {
        id: roomIdNum,
      },
    });

    if (!room) {
      return NextResponse.json({ msg: "Room not found" }, { status: 404 });
    }

    const chats = await prisma.chat.findMany({
      where: {
        roomId: room.id,
      },
      orderBy: {
        id: "desc",
      },
      take: 50,
    });

    return NextResponse.json({
      chats,
    });
  } catch (err) {
    return NextResponse.json(
      {
        msg: "Error getting chat",
        error: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}
