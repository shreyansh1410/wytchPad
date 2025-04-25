import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { signUpSchema, signInSchema } from "@repo/common/types";
import { prisma } from "@repo/db/client";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@repo/backend-common/config";

export const signUpController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    let data;
    data = signUpSchema.safeParse({
      email,
      password,
    });
    if (!data.success) {
      res.status(500).json({
        msg: "Invlaid registration inputs",
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      res.status(500).json({
        msg: "Email is already in use",
      });
      return;
    }

    const hashedPass = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPass,
      },
    });

    const token = jwt.sign({ email }, JWT_SECRET);
    res.status(200).json({
      token,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error signing up",
      err,
    });
  }
};

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
      res.status(403).json({
        msg: "Incorrect email",
      });
      return;
    }

    const decodedpass = await bcrypt.compare(password, user.password);
    if (!decodedpass) {
      res.status(403).json({
        msg: "Incorrect Password",
      });
      return;
    }

    const token = jwt.sign({ email }, JWT_SECRET);

    res.status(200).json({
      msg: "signed in successfully",
      token,
    });
    return;
  } catch (err) {
    res.status(500).json({
      msg: "error signing in user",
      err,
    });
  }
};
