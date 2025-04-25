import { z } from "zod";

export const signUpSchema = z.object({
  firstName: z.string().min(3).max(20),
  lastName: z.string().min(3).max(20),
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

export type signUpSchema = z.infer<typeof signUpSchema>;
export type CreateRoomSchmea = z.infer<typeof createRoomSchmea>;
export type signInSchema = z.infer<typeof signInSchema>;
