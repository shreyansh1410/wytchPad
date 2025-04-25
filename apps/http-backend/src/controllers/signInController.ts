import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { signInSchema } from "@repo/common/types";
import { prisma } from "@repo/db/client";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@repo/backend-common/config";

export const signInController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = signInSchema.safeParse({
      email,
      password,
    });
    if (!data.success) {
      res.status(500).json({
        msg: "Invalid sign in credentials",
      });
      return;
    }
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
      select: {
        email: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(403).json({
        msg: "Incorrect email",
      });
    }

    const decodedpass = await bcrypt.compare(password, user.password);
    if (!decodedpass) {
      return res.status(403).json({
        msg: "Incorrect Password",
      });
    }

    const token = jwt.sign({ email }, JWT_SECRET);

    res.status(200).json({
      msg: "signed in successfully",
      token,
    });
  } catch (err) {
    res.status(500).json({
      msg: "error signing in user",
      err,
    });
  }
};
