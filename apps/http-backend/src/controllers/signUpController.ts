import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { signUpSchema } from "@repo/common/types";
import { prisma } from "@repo/db/client";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@repo/backend-common/config";

export const signUpController = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    let data;
    if (lastName) {
      data = signUpSchema.safeParse({
        firstName,
        lastName,
        email,
        password,
      });
    } else {
      data = signUpSchema.safeParse({
        firstName,
        email,
        password,
      });
    }
    if (!data.success) {
      res.status(500).json({
        msg: "Invlaid registration inputs",
      });

      return;
    }

    const hashedPass = bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        hashedPass,
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
