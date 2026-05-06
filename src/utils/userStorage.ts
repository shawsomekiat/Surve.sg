import type { User } from '../context/AuthContext';

function normalizePart(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || 'anonymous';
}

export function getUserStorageNamespace(user: User | null) {
  if (!user) return 'guest';
  return `${user.role}:${normalizePart(user.email || user.name)}`;
}

export function getScopedStorageKey(scope: string, user: User | null) {
  return `${scope}:${getUserStorageNamespace(user)}`;
}

export function listScopedStorageKeys(scope: string) {
  const prefix = `${scope}:`;
  return Object.keys(localStorage).filter((key) => key.startsWith(prefix));
}
