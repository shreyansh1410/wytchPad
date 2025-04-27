"use client";

import { NextResponse } from "next/server";
import { useRouter } from "next/navigation";

export async function POST() {
  localStorage.clear();
  const router = useRouter();
  router.push("/signin");
  return NextResponse.json({ msg: "Logged out successfully" });
}
