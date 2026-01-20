# Expo Geofencing Module

Native iOS module for background geofencing in the Timely app.

## Features

- 🌍 Background geofencing using iOS CLLocationManager
- 📍 Monitor workplace location even when app is closed
- 🔔 Local notifications when entering/exiting workplace
- 🔋 Battery-efficient region monitoring
- 📱 iOS 16.1+ support

## How It Works

1. **Setup**: The app requests "Always" location permission from the user
2. **Configuration**: User sets their workplace location in the WorkplaceLocationScreen
3. **Monitoring**: The module registers a circular geofence region (100m radius) around the workplace
4. **Background Detection**: iOS monitors the geofence in the background, even when the app is closed
5. **Wake-up**: When user enters/exits the geofence, iOS wakes up the app briefly
6. **Notification**: The app sends a local notification asking the user to confirm clock in/out
7. **User Action**: User taps the notification to open the app and confirm the time entry

## iOS Native Implementation

The native Swift code (`ExpoGeofencingModule.swift`) uses:
- `CLLocationManager` for region monitoring
- `CLCircularRegion` for defining geofence boundaries
- `UNUserNotificationCenter` for local notifications
- Background location updates enabled via `UIBackgroundModes`

## Usage in React Native

```typescript
import { useGeofencing } from '@/features/time-clock';

function MyComponent() {
  const {
    isAvailable,      // true on iOS, false otherwise
    isMonitoring,     // true if currently monitoring
    hasPermission,    // true if has "Always" permission
    startMonitoring,  // Start monitoring workplace
    stopMonitoring,   // Stop monitoring
    requestPermission, // Request "Always" permission
    workplaceLocation, // Current workplace coordinates
  } = useGeofencing();

  // Start monitoring when workplace is configured
  useEffect(() => {
    if (workplaceLocation && !isMonitoring) {
      startMonitoring();
    }
  }, [workplaceLocation]);
}
```

## Permissions Required

### iOS Info.plist

```xml
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Precisamos da sua localização para detectar quando você chega ao trabalho e registrar o ponto automaticamente, mesmo com o app fechado.</string>

<key>NSLocationAlwaysUsageDescription</key>
<string>Precisamos da sua localização para detectar quando você chega ao trabalho e registrar o ponto automaticamente, mesmo com o app fechado.</string>

<key>UIBackgroundModes</key>
<array>
  <string>location</string>
  <string>remote-notification</string>
</array>
```

## Geofence Parameters

- **Radius**: 100 meters (configurable in `useGeofencing.ts`)
- **Identifier**: "workplace" (constant)
- **Notify on Entry**: ✅ Yes
- **Notify on Exit**: ✅ Yes

## Battery Considerations

iOS geofencing is designed to be battery-efficient:
- Uses cell tower and Wi-Fi positioning primarily
- GPS only activated when needed for precision
- Region monitoring is a system service
- App doesn't need to run continuously

## Limitations

- **iOS Only**: Currently only implemented for iOS
- **Single Location**: Only one workplace location supported
- **Accuracy**: ~100-200m accuracy typical
- **Permission Required**: User must grant "Always" location access
- **System Limits**: iOS limits apps to ~20 monitored regions (we use 1)

## Testing

Testing geofencing requires a physical iOS device:

1. Install the app on a real iPhone (simulator doesn't support geofencing)
2. Go to Settings → Workplace Location
3. Set your current location as workplace
4. Enable detection
5. Move away from the location (>100m)
6. Move back to the location
7. Should receive a notification when entering the geofence

Note: You can simulate location changes using Xcode's location simulation, but results may be inconsistent.

## Troubleshooting

**Notifications not appearing:**
- Check notification permissions in iOS Settings
- Verify "Always" location permission is granted
- Ensure app is configured properly in app.json
- Check console logs for errors

**Geofence not triggering:**
- Ensure you've moved >100m away from workplace
- Location services must be enabled
- May take 5-15 minutes for iOS to detect region changes
- Background App Refresh should be enabled

**Permission not granted:**
- User must explicitly grant "Always" permission
- First request shows "When In Use" or "Always"
- User can change in Settings → Privacy → Location Services
