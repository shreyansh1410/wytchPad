import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { signUpSchema } from "@repo/common/types";
import { prisma } from "@repo/db/client";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@repo/backend-common/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const data = signUpSchema.safeParse({
      email,
      password,
    });

    if (!data.success) {
      return NextResponse.json(
        {
          msg: "Invalid registration inputs",
          errors: data.error.errors,
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (user) {
      return NextResponse.json(
        {
          msg: "Email is already in use",
        },
        { status: 409 }
      );
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

    return NextResponse.json(
      {
        msg: "User created successfully",
        token,
        user: { email: createdUser.email, id: createdUser.id },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      {
        msg: "Error signing up",
        error: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}
