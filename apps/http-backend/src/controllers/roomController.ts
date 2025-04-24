import { Request, Response } from "express";
import { createRoomSchmea } from "@repo/common/types";

export const roomController = (req: Request, res: Response) => {
  const data = createRoomSchmea.safeParse(req.body);
  if (!data.success) {
    res.status(500).json({
      msg: "invalid room credentials",
    });
    return;
  }
  res.json({
    roomId: "123",
  });
};
