import { Request, Response } from "express";

export const roomController = (req: Request, res: Response) => {
    res.json({
        roomId : "123"
    })
}