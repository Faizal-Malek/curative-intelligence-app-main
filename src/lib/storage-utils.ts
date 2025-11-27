export const STORAGE_LIMITS = {
  free: 1024 * 1024 * 1024, // 1GB
  basic: 5 * 1024 * 1024 * 1024, // 5GB
  pro: 20 * 1024 * 1024 * 1024, // 20GB
  enterprise: Number.MAX_SAFE_INTEGER, // Unlimited
} as const;

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB per file

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function isUnlimitedStorage(plan: string): boolean {
  return plan.toLowerCase() === 'enterprise';
}
