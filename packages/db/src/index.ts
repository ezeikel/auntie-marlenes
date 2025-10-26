// Re-export the Prisma client
export { db } from './client';
export * from '@prisma/client';

// Re-export Prisma types
export { Prisma } from './client';

// Re-export specific model types with custom names
export type {
  User as DbUserType,
  SavedItem as DbSavedItemType,
} from '@prisma/client';
