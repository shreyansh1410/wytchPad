import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { signUpSchema, signInSchema } from "@repo/common/types";
import { prisma } from "@repo/db/client";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@repo/backend-common/config";

export const signUpController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email, password } = req.body;
    const data = signUpSchema.safeParse({
      email,
      password,
    });
    if (!data.success) {
      return res.status(400).json({
        msg: "Invalid registration inputs",
        errors: data.error.errors,
      });
    }

    const user = await prisma.user.findFirst({
      where: { email },
    });
    if (user) {
      return res.status(409).json({
        msg: "Email is already in use",
      });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const createdUser = await prisma.user.create({
      data: {
        email,
        password: hashedPass,
      },
    });

    const token = jwt.sign(
      { email: createdUser.email, id: createdUser.id },
      JWT_SECRET!
    );
    return res.status(201).json({
      msg: "User created successfully",
      token,
      user: { email: createdUser.email, id: createdUser.id },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      msg: "Error signing up",
      error: err instanceof Error ? err.message : err,
    });
  }
};

export const signInController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email, password } = req.body;
    const data = signInSchema.safeParse({
      email,
      password,
    });
    if (!data.success) {
      return res.status(400).json({
        msg: "Invalid sign in credentials",
        errors: data.error.errors,
      });
    }
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
      select: {
        email: true,
        password: true,
        id: true,
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

    const token = jwt.sign({ email: user.email, id: user.id }, JWT_SECRET!);

    return res.status(200).json({
      msg: "signed in successfully",
      token,
      user: { email: user.email, id: user.id },
    });
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({
      msg: "error signing in user",
      error: err instanceof Error ? err.message : err,
    });
  }
};
