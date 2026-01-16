export const STORAGE_KEYS = {
  USER: '@timely:user',
  TOKEN: '@timely:token',
  LANGUAGE: '@timely:language',
  THEME: '@timely:theme',
  WORK_SETTINGS: '@timely:workSettings',
  LAST_PROCESSED_DEEPLINK: '@timely:lastProcessedDeeplink',
  ONBOARDING_COMPLETED: '@timely:onboardingCompleted',
  ONBOARDING_VERSION: '@timely:onboardingVersion',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

