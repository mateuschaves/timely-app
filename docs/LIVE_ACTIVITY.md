# Live Activity Implementation

This document describes the Live Activity implementation for the Timely app on iOS.

## Overview

Live Activities display real-time information from your app on the Lock Screen and in the Dynamic Island on supported devices (iPhone 14 Pro and later). For the Timely app, Live Activities show ongoing work session information when a user has clocked in.

## Features

When a user clocks in (starts work), a Live Activity is automatically started that displays:
- **Entry Time**: The time when the user started work
- **Elapsed Time**: Duration since clock-in (updated every minute)

The Live Activity automatically stops when the user clocks out.

## Requirements

- iOS 16.1 or later
- Expo SDK 54+
- Development build (Live Activities require native code)

## Implementation Details

### Dependencies

- `expo-live-activity@0.4.2`: Expo module for managing iOS Live Activities

### Configuration

The app has been configured to support Live Activities:

**app.json**:
```json
{
  "ios": {
    "deploymentTarget": "16.1",
    "infoPlist": {
      "NSSupportsLiveActivities": true
    }
  },
  "plugins": [
    [
      "expo-live-activity",
      {
        "frequentUpdates": true,
        "modulePath": "./modules/expo-live-activity/index.ts"
      }
    ]
  ]
}
```

### Code Structure

#### 1. ActivityAttributes Module

**Location**: `modules/expo-live-activity/index.ts`

Defines the data structure for the Live Activity:

```typescript
export interface WorkSessionActivityAttributes {
  appName: string;
}

export interface WorkSessionActivityContentState {
  entryTime: string;
  elapsedTime: string;
}
```

#### 2. useLiveActivity Hook

**Location**: `src/features/time-clock/hooks/useLiveActivity.ts`

This hook manages the Live Activity lifecycle:

- `startWorkSessionActivity(entryTime)`: Starts a new Live Activity
- `stopWorkSessionActivity()`: Stops the active Live Activity
- `isSupported()`: Checks if Live Activities are supported

The hook automatically:
- Updates the elapsed time every minute
- Stops any existing activity before starting a new one
- Cleans up intervals on unmount

#### 3. HomeScreen Integration

**Location**: `src/features/home/HomeScreen/index.tsx`

The HomeScreen component manages Live Activities based on user state:

1. **On Clock-In**: Starts a new Live Activity with the current timestamp
2. **On Clock-Out**: Stops the active Live Activity
3. **On App Open**: Restores the Live Activity if there's an active work session

### How It Works

#### Clock-In Flow

1. User taps "Start Work" button
2. App calls the clock-in API
3. On success, starts a Live Activity with the entry time
4. Live Activity updates elapsed time every minute

#### Clock-Out Flow

1. User taps "End Work" button
2. App calls the clock-out API
3. On success, stops the Live Activity

#### App Restart Flow

1. App loads the last event from history
2. If last event was a clock-in (user is still working):
   - Restores Live Activity with the original entry time
   - Resumes elapsed time updates
3. If last event was a clock-out or no events:
   - Ensures no Live Activity is active

### Native Widget Extension

**Important**: To use Live Activities, you need to run `npx expo prebuild` to generate the native iOS project. The `expo-live-activity` plugin will automatically create the necessary Widget Extension.

After prebuild, the Widget Extension will be created at:
```
ios/TimelyWorkSessionLiveActivity/
```

The Widget Extension contains SwiftUI code that renders the Live Activity on the Lock Screen and Dynamic Island.

## Testing

### Prerequisites

1. Physical iOS device with iOS 16.1+ (Live Activities don't work in simulator)
2. Development build of the app

### Steps

1. Generate native code:
   ```bash
   npx expo prebuild --platform ios
   ```

2. Build and install the development build:
   ```bash
   npx expo run:ios --device
   ```

3. Test the Live Activity:
   - Open the app and log in
   - Tap "Start Work"
   - Lock your device
   - Verify that the Live Activity appears on the Lock Screen
   - Wait 1 minute and verify the elapsed time updates
   - Unlock and open the app
   - Tap "End Work"
   - Lock your device and verify the Live Activity disappears

### Testing on Dynamic Island (iPhone 14 Pro+)

If you have an iPhone 14 Pro or later, the Live Activity will also appear in the Dynamic Island.

## Troubleshooting

### Live Activity doesn't appear

1. **Check iOS version**: Ensure device is running iOS 16.1 or later
2. **Check Focus mode**: Some Focus modes can hide Live Activities
3. **Check permissions**: Ensure Live Activities are enabled in Settings > Notifications
4. **Check logs**: Look for Live Activity related logs in Xcode console

### Elapsed time not updating

1. **Check update interval**: The time updates every 60 seconds
2. **Check logs**: Verify update calls are being made
3. **App backgrounded**: Ensure the app is still running in background

### Live Activity persists after clock-out

1. **Check API response**: Verify clock-out API call succeeded
2. **Check logs**: Verify `stopWorkSessionActivity` was called
3. **Force close app**: Try force closing and reopening the app

## Limitations

1. **Simulator support**: Live Activities do not work in iOS Simulator
2. **Device requirement**: Requires iOS 16.1 or later
3. **Update frequency**: Live Activities have limits on update frequency
4. **Platform**: iOS only feature (not available on Android)

## Future Enhancements

Potential improvements for Live Activity:

1. Add tap actions to open app
2. Show additional information (e.g., location, break time)
3. Display notifications for milestones (e.g., 4 hours worked)
4. Customize appearance based on time of day
5. Add support for multiple concurrent sessions

## References

- [Apple Live Activities Documentation](https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities)
- [expo-live-activity GitHub](https://github.com/software-mansion-labs/expo-live-activity)
- [ActivityKit Framework](https://developer.apple.com/documentation/activitykit)
