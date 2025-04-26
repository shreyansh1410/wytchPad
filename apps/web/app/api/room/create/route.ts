import { NextRequest, NextResponse } from "next/server";
import { createRoomSchmea } from "@repo/common/types";
import { prisma } from "@repo/db/client";
import { getUserIdFromRequest } from "../../_utils/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = createRoomSchmea.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          msg: "invalid room credentials",
        },
        { status: 500 }
      );
    }

    const room = await prisma.room.findFirst({
      where: {
        slug: parsedData.data.roomName,
      },
    });

    if (room) {
      return NextResponse.json(
        {
          msg: "A room with this name already exists. Please choose a different name.",
        },
        { status: 409 }
      );
    }

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        {
          msg: "user not authenticated",
        },
        { status: 500 }
      );
    }

    const createdRoom = await prisma.room.create({
      data: {
        slug: parsedData.data.roomName,
        adminId: userId,
      },
    });

    return NextResponse.json({
      roomId: createdRoom.id,
    });
  } catch (err) {
    console.error("Error creating room:", err);
    return NextResponse.json(
      {
        msg: "error creating room",
        error: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}
