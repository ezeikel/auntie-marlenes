// Types-only exports that don't import the database client
// This file is safe to import on the client side

// Re-export specific model types with custom names
export type {
  SavedItem as DbSavedItemType,
  User as DbUserType,
} from './generated/prisma/client';
export * from './generated/prisma/client';
// Re-export Prisma types and enums
export { Prisma } from './generated/prisma/client';
