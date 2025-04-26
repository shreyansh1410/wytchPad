import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { signInSchema } from "@repo/common/types";
import { prisma } from "@repo/db/client";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@repo/backend-common/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const data = signInSchema.safeParse({
      email,
      password,
    });

    if (!data.success) {
      return NextResponse.json(
        {
          msg: "Invalid sign in credentials",
          errors: data.error.errors,
        },
        { status: 400 }
      );
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
      return NextResponse.json(
        {
          msg: "Incorrect email",
        },
        { status: 403 }
      );
    }

    const decodedpass = await bcrypt.compare(password, user.password);
    if (!decodedpass) {
      return NextResponse.json(
        {
          msg: "Incorrect Password",
        },
        { status: 403 }
      );
    }

    const token = jwt.sign({ email: user.email, id: user.id }, JWT_SECRET!);

    return NextResponse.json(
      {
        msg: "signed in successfully",
        token,
        user: { email: user.email, id: user.id },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Signin error:", err);
    return NextResponse.json(
      {
        msg: "error signing in user",
        error: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}
