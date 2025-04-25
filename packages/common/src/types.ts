import { z } from "zod";

export const signUpSchema = z.object({
  firstName: z.string().min(3).max(20).optional(),
  lastName: z.string().min(3).max(20).optional(),
  email: z.string().email(),
  password: z.string().min(6).max(20),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(20),
});

export const createRoomSchmea = z.object({
  roomName: z.string().min(3).max(20),
});
