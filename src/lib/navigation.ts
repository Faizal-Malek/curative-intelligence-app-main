export const DEFAULT_ALLOWED_NAVIGATION = [
  'dashboard',
  'calendar',
  'vault',
  'analytics',
  'profile',
  'pricing',
  'settings',
  'support',
] as const;

export type NavigationRoute = (typeof DEFAULT_ALLOWED_NAVIGATION)[number];

export type NavigationConfig = {
  allowed: string[];
  lookup: Record<string, boolean>;
};

type JsonValue = string | number | boolean | JsonValue[] | { [key: string]: JsonValue } | null;

export function normalizeNavigationValue(value?: JsonValue | null): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && !!item);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && !!item);
      }
    } catch {
      // ignore parsing errors and fall back to defaults
    }
  }

  return [...DEFAULT_ALLOWED_NAVIGATION];
}

export function buildNavigationConfig(raw?: JsonValue | null): NavigationConfig {
  const allowed = normalizeNavigationValue(raw);
  const lookup = allowed.reduce<Record<string, boolean>>((acc, route) => {
    acc[route] = true;
    return acc;
  }, {});

  return {
    allowed,
    lookup,
  };
}
