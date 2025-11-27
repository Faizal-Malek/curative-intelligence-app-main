// File Path: src/lib/storage.ts
import { prisma } from './prisma';

// Re-export client-safe utilities
export { formatBytes, isUnlimitedStorage, STORAGE_LIMITS, MAX_FILE_SIZE } from './storage-utils';

export async function getUserStorage(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      storageUsed: true,
      storageLimit: true,
      plan: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    used: Number(user.storageUsed),
    limit: Number(user.storageLimit),
    percentage: (Number(user.storageUsed) / Number(user.storageLimit)) * 100,
    available: Number(user.storageLimit) - Number(user.storageUsed),
    plan: user.plan,
  };
}

export async function checkStorageQuota(userId: string, fileSize: number): Promise<boolean> {
  const storage = await getUserStorage(userId);
  return storage.available >= fileSize;
}

export async function updateUserStorage(userId: string, bytesUsed: number) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      storageUsed: {
        increment: BigInt(bytesUsed),
      },
    },
  });
}

export async function decreaseUserStorage(userId: string, bytesFreed: number) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      storageUsed: {
        decrement: BigInt(bytesFreed),
      },
    },
  });
}
