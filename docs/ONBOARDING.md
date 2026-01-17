# Onboarding Feature

## Overview

The onboarding feature provides an introduction to the app for all users. It supports multiple languages and tracks completion status via the backend API.

## Features

- **Unified onboarding flow**: Same intro message for all users
- **Skippable**: All users can skip onboarding at any time with "Fazer depois" option
- **API-based tracking**: Onboarding completion status is stored in the backend and retrieved from `/users/me` endpoint
- **Internationalized**: All strings support pt-BR, en-US, fr-FR, and de-DE
- **Non-blocking**: Users can access the app without completing onboarding

## Architecture

### API Integration

Onboarding status is managed via the backend API:
- **GET `/users/me`**: Returns user data including `onboardingCompleted: boolean`
- **PUT `/users/me`**: Updates user data, including `onboardingCompleted` field

The onboarding status is always fetched from the API and never stored locally in AsyncStorage.

### Screens

1. **IntroScreen**: Initial screen with unified message and skip option for everyone
2. **WorkModelSelectionScreen**: Allows users to select their work model

### Flow

1. User logs in → app fetches user data from API
2. If `onboardingCompleted` is `false` → show onboarding flow
3. User completes or skips onboarding → API is called to set `onboardingCompleted: true`
4. User data is refreshed from API to reflect the updated status

## Usage

### Onboarding Hook

The `useOnboarding` hook retrieves the onboarding status from the authenticated user object:

```typescript
const { isOnboardingCompleted, completeOnboarding, skipOnboarding } = useOnboarding();
```

- `isOnboardingCompleted`: Reflects `user.onboardingCompleted` from API
- `completeOnboarding()`: Calls `PUT /users/me` with `{ onboardingCompleted: true }`
- `skipOnboarding()`: Same as `completeOnboarding()`

### Adding New Screens

1. Create the screen component in `src/features/onboarding/`
2. Add the screen to `OnboardingStackParamList` in `types/index.ts`
3. Add the screen to `OnboardingNavigator.tsx`
4. Update navigation in existing screens to include the new step

### Translation Keys

All onboarding strings are under the `onboarding` namespace:

```json
{
  "onboarding": {
    "intro": {
      "title": "...",
      "body": "...",
      "primaryCta": "...",
      "secondaryCta": "..."
    },
    "workModel": { ... }
  }
}
```

## Testing

Tests are located in `src/features/onboarding/hooks/__tests__/useOnboarding.test.ts`

Run tests with:
```bash
npm test
```

## iOS App Review Compliance

The onboarding uses neutral, transparent language to comply with App Review guidelines:
- No terms like "monitor", "detect", or "track"
- Emphasizes user configuration of automations
- No automatic automations created by the app

