// Types-only exports that don't import the database client
// This file is safe to import on the client side
export * from './generated/prisma/client';

// Re-export Prisma types and enums
export { Prisma } from './generated/prisma/client';

// Re-export specific model types with custom names
export type {
  User as DbUserType,
  SavedItem as DbSavedItemType,
} from './generated/prisma/client';
