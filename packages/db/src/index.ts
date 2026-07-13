// Re-export the Prisma client
// Re-export Prisma types
export { db, Prisma } from './client';
// Re-export specific model types with custom names
export type {
  SavedItem as DbSavedItemType,
  User as DbUserType,
} from './generated/prisma/client';
export * from './generated/prisma/client';
