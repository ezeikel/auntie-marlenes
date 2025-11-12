import { z } from 'zod';

/**
 * User type
 */
export type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Saved Item type
 */
export type SavedItem = {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
};

/**
 * Auth Session type
 */
export type AuthSession = {
  user: User;
  sessionToken: string;
  expiresAt: Date;
};

/**
 * Zod schemas
 */
export const UserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  image: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SavedItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  createdAt: z.date(),
});

export const AuthSessionSchema = z.object({
  user: UserSchema,
  sessionToken: z.string(),
  expiresAt: z.date(),
});
