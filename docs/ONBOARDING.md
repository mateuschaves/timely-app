# Onboarding Feature

## Overview

The onboarding feature provides an introduction to the app for all users. It supports multiple languages and can be versioned to show updated onboarding flows when needed.

## Features

- **Unified onboarding flow**: Same intro message for both new and existing users
- **Skippable**: All users can skip onboarding at any time with "Fazer depois" option
- **Versioned**: Onboarding can be shown again to all users by incrementing the version number
- **Internationalized**: All strings support pt-BR, en-US, fr-FR, and de-DE
- **Non-blocking**: Users can access the app without completing onboarding

## Architecture

### Storage Keys

- `@timely:onboardingCompleted`: Boolean flag indicating onboarding completion
- `@timely:onboardingVersion`: Current onboarding version the user has seen

### Screens

1. **IntroScreen**: Initial screen with unified message and skip option for everyone
2. **WorkModelSelectionScreen**: Allows users to select their work model

### User Detection

The system tracks onboarding completion using the `onboardingCompleted` flag:
- When `onboardingCompleted` doesn't exist or is false: onboarding is shown
- When `onboardingCompleted` is true and version matches: onboarding is skipped
- When version changes: onboarding is shown again regardless of previous completion

All users see the same intro message and have the option to skip.

## Usage

### Forcing Onboarding for All Users

To show onboarding again (e.g., for major updates), increment the version in:

```typescript
// src/features/onboarding/hooks/useOnboarding.ts
const CURRENT_ONBOARDING_VERSION = '1.1.0'; // Changed from '1.0.0'
```

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
      "existing": { ... },
      "new": { ... }
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
