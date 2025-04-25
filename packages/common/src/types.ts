import { z } from "zod";

export const signUpSchema = z.object({
  firstName: z.string().min(3).max(20),
  lastName: z.string().min(3).max(20),
  password: z.string().min(6).max(20),
  email: z.string().email(),
});

export const signInSchema = z.object({
  password: z.string().min(6).max(20),
  email: z.string().email(),
});

export const createRoomSchmea = z.object({
  roomName: z.string().min(3).max(20),
});

export type signUpSchema = z.infer<typeof signUpSchema>;
export type CreateRoomSchmea = z.infer<typeof createRoomSchmea>;
export type signInSchema = z.infer<typeof signInSchema>;
