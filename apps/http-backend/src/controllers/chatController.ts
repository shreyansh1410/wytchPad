import { prisma } from "@repo/db/client";
import { Request, Response } from "express";

export const getChatController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const roomId = req.params.roomId;
  if (!roomId) {
    return;
  }
  try {
    const room = await prisma.room.findUnique({
      where: {
        id: parseInt(roomId),
      },
    });
    if (!room) {
      res.status(404).json({
        msg: "Room not found",
      });
      return;
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
    return res.status(200).json({
      chats,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error getting chat",
      error: err instanceof Error ? err.message : err,
    });
  }
};
