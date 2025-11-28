// utils/normalizeActivity.ts

/**
 * Normalizes Actin Disruption Activity into three categories:
 * "+" - anything containing + (including +-, ++, +++, etc.)
 * "-" - only pure - (exactly "-")
 * "not tested" - everything else (empty strings, "not tested", "unknown", etc.)
 */
export const normalizeActivity = (activity: string): string => {
  if (!activity || typeof activity !== 'string') {
    return 'not tested';
  }

  const trimmedActivity = activity.trim().toLowerCase();

  if (trimmedActivity.includes('+')) {
    return '+';
  }

  if (trimmedActivity === '-') {
    return '-';
  }
  return 'not tested';
};

// Array of normalized activity options for your filter dropdown
export const ACTIVITY_OPTIONS = ['+', '-', 'not tested'] as const;