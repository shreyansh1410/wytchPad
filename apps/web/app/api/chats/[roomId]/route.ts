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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const roomIdNum = Number(roomId);
  if (!roomIdNum || isNaN(roomIdNum)) {
    return NextResponse.json({ msg: "Invalid room id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          msg: "No shape id provided",
          receivedBody: body,
        },
        { status: 400 }
      );
    }

    console.log(`Attempting to delete shape with ID: ${id}`);

    // Get all chats for this room
    const chats = await prisma.chat.findMany({
      where: {
        roomId: roomIdNum,
      },
    });

    console.log(`Found ${chats.length} chats in room ${roomIdNum}`);

    let deletedCount = 0;
    for (const chat of chats) {
      try {
        // Parse the message and check if it contains our shape
        const msg = JSON.parse(chat.message);

        // Log some info to debug the comparison
        console.log(`Comparing shape ID ${msg.id} with target ID ${id}`);

        // Make a more flexible comparison
        if (msg.id && (msg.id === id || msg.id.toString() === id.toString())) {
          console.log(`Found matching shape in chat ${chat.id}, deleting...`);
          await prisma.chat.delete({ where: { id: chat.id } });
          deletedCount++;
        }
      } catch (err) {
        console.error(`Error processing chat ${chat.id}:`, err);
      }
    }

    console.log(`Deleted ${deletedCount} chats containing the shape`);

    return NextResponse.json({ success: true, deletedCount });
  } catch (err) {
    console.error("Error in delete shape handler:", err);
    return NextResponse.json(
      {
        msg: "Error deleting shape",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
