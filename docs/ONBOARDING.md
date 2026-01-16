# Onboarding Feature

## Overview

The onboarding feature provides a contextual introduction to the app for both new and existing users. It supports multiple languages and can be versioned to show updated onboarding flows when needed.

## Features

- **Different flows for new vs existing users**: New users see a simplified intro, while existing users see an explanation of new features
- **Skippable**: Users can skip onboarding at any time (especially existing users)
- **Versioned**: Onboarding can be shown again to all users by incrementing the version number
- **Internationalized**: All strings support pt-BR, en-US, fr-FR, and de-DE
- **Non-blocking**: Users can access the app without completing onboarding

## Architecture

### Storage Keys

- `@timely:onboardingCompleted`: Boolean flag indicating onboarding completion
- `@timely:onboardingVersion`: Current onboarding version the user has seen

### Screens

1. **IntroScreen**: Initial screen with different copy for new/existing users
2. **WorkModelSelectionScreen**: Allows users to select their work model

### User Detection

The system determines if a user is new or existing by checking the onboarding completion flag:
- **New users**: `onboardingCompleted` flag doesn't exist or is false (never completed onboarding)
- **Existing users**: `onboardingCompleted` flag is true (completed onboarding before)

This approach ensures that when onboarding version changes, existing users still see the "existing user" intro flow, while truly new users see the "new user" flow.

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
