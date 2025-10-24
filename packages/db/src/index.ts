// Re-export the Prisma client
export { prisma as db } from './client';
export * from '@prisma/client';

// Re-export Prisma types and enums
export { Prisma } from '@prisma/client';

// Re-export specific model types with custom names
export type {
  User as DbUserType,
  Saved as DbSavedType,
} from '@prisma/client';
