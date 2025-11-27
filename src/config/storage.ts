export const STORAGE_KEYS = {
  USER: '@timely:user',
  TOKEN: '@timely:token',
  LANGUAGE: '@timely:language',
  WORK_SETTINGS: '@timely:workSettings',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

