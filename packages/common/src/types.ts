import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3).max(20),
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

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type CreateRoomSchmea = z.infer<typeof createRoomSchmea>;
export type SignInSchema = z.infer<typeof signInSchema>;
