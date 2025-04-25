import { Request, Response } from "express";
import { createRoomSchmea } from "@repo/common/types";
import { prisma } from "@repo/db/client";

export const roomController = async (req: Request, res: Response) => {
  const parsedData = createRoomSchmea.safeParse(req.body);
  try {
    if (!parsedData.success) {
      res.status(500).json({
        msg: "invalid room credentials",
      });
      return;
    }

    const room = await prisma.room.findFirst({
      where: {
        slug: parsedData.data.roomName,
      },
    });

    if (room) {
      res.status(500).json({
        msg: "room with this name already exists",
      });
      return;
    }

    const userId = req.userId;
    if (!userId) {
      return;
    }
    const createdRoom = await prisma.room.create({
      data: {
        slug: parsedData.data.roomName,
        adminId: userId,
      },
    });
    res.json({
      roomId: createdRoom.id,
    });
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({
      msg: "error creating room",
      error: err instanceof Error ? err.message : err,
    });
  }
};
