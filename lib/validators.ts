import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores");

export const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);

export const recoveryCodeSchema = z
  .string()
  .trim()
  .min(8, "Recovery code must be at least 8 characters")
  .max(64);

export const registerSchema = z.object({
  username: usernameSchema,
  email: z.string().trim().email(),
  password: passwordSchema,
  recoveryCode: recoveryCodeSchema,
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1), // username or email
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(1),
  recoveryCode: recoveryCodeSchema,
  newPassword: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});
