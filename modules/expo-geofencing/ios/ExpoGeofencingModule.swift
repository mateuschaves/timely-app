import ExpoModulesCore
import CoreLocation
import UserNotifications

public class ExpoGeofencingModule: Module, CLLocationManagerDelegate {
  private var locationManager: CLLocationManager?
  private var monitoredRegions: [String: CLCircularRegion] = [:]
  
  public func definition() -> ModuleDefinition {
    Name("ExpoGeofencing")
    
    Events("onGeofenceEnter", "onGeofenceExit", "onGeofenceError")
    
    OnCreate {
      setupLocationManager()
    }
    
    Function("startMonitoring") { (identifier: String, latitude: Double, longitude: Double, radius: Double) -> Bool in
      return startMonitoringRegion(identifier: identifier, latitude: latitude, longitude: longitude, radius: radius)
    }
    
    Function("stopMonitoring") { (identifier: String) -> Bool in
      return stopMonitoringRegion(identifier: identifier)
    }
    
    Function("stopAllMonitoring") { () -> Bool in
      return stopAllMonitoring()
    }
    
    Function("getMonitoredRegions") { () -> [String] in
      return Array(monitoredRegions.keys)
    }
    
    AsyncFunction("requestAlwaysAuthorization") { (promise: Promise) in
      requestAlwaysLocationPermission(promise: promise)
    }
    
    Function("hasAlwaysAuthorization") { () -> Bool in
      return hasAlwaysLocationAuthorization()
    }
  }
  
  private func setupLocationManager() {
    locationManager = CLLocationManager()
    locationManager?.delegate = self
    locationManager?.desiredAccuracy = kCLLocationAccuracyBest
    // Only enable background updates if we have always authorization
    if CLLocationManager.authorizationStatus() == .authorizedAlways {
      locationManager?.allowsBackgroundLocationUpdates = true
      locationManager?.pausesLocationUpdatesAutomatically = false
    }
  }
  
  private func startMonitoringRegion(identifier: String, latitude: Double, longitude: Double, radius: Double) -> Bool {
    guard let locationManager = locationManager else {
      return false
    }
    
    // Check if region monitoring is available
    if !CLLocationManager.isMonitoringAvailable(for: CLCircularRegion.self) {
      sendEvent("onGeofenceError", [
        "error": "Region monitoring not available on this device"
      ])
      return false
    }
    
    // Stop monitoring existing region with same identifier
    if let existingRegion = monitoredRegions[identifier] {
      locationManager.stopMonitoring(for: existingRegion)
    }
    
    // Create new region
    let center = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    let region = CLCircularRegion(center: center, radius: radius, identifier: identifier)
    region.notifyOnEntry = true
    region.notifyOnExit = true
    
    // Store and start monitoring
    monitoredRegions[identifier] = region
    locationManager.startMonitoring(for: region)
    
    // Request initial state
    locationManager.requestState(for: region)
    
    return true
  }
  
  private func stopMonitoringRegion(identifier: String) -> Bool {
    guard let locationManager = locationManager,
          let region = monitoredRegions[identifier] else {
      return false
    }
    
    locationManager.stopMonitoring(for: region)
    monitoredRegions.removeValue(forKey: identifier)
    return true
  }
  
  private func stopAllMonitoring() -> Bool {
    guard let locationManager = locationManager else {
      return false
    }
    
    for region in monitoredRegions.values {
      locationManager.stopMonitoring(for: region)
    }
    monitoredRegions.removeAll()
    return true
  }
  
  private func requestAlwaysLocationPermission(promise: Promise) {
    guard let locationManager = locationManager else {
      promise.reject("E_LOCATION_MANAGER", "Location manager not initialized")
      return
    }
    
    let status = CLLocationManager.authorizationStatus()
    
    if status == .authorizedAlways {
      promise.resolve(["status": "granted"])
      return
    }
    
    // Store promise to resolve when delegate callback is triggered
    // For simplicity, we'll resolve immediately with current status
    // In production, consider using delegate pattern for async permission result
    locationManager.requestAlwaysAuthorization()
    
    // Return current status - iOS will show permission dialog
    // User needs to check hasAlwaysAuthorization() after dialog is dismissed
    let statusString: String
    switch status {
    case .authorizedAlways:
      statusString = "granted"
    case .authorizedWhenInUse:
      statusString = "whenInUse"
    case .denied:
      statusString = "denied"
    case .restricted:
      statusString = "restricted"
    case .notDetermined:
      statusString = "notDetermined"
    @unknown default:
      statusString = "unknown"
    }
    
    promise.resolve(["status": statusString])
  }
  
  private func hasAlwaysLocationAuthorization() -> Bool {
    return CLLocationManager.authorizationStatus() == .authorizedAlways
  }
  
  // MARK: - CLLocationManagerDelegate
  
  public func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
    guard let circularRegion = region as? CLCircularRegion else { return }
    
    print("📍 Entered geofence region: \(region.identifier)")
    
    sendEvent("onGeofenceEnter", [
      "identifier": region.identifier,
      "latitude": circularRegion.center.latitude,
      "longitude": circularRegion.center.longitude,
      "radius": circularRegion.radius,
      "timestamp": Date().timeIntervalSince1970
    ])
    
    // Send local notification
    sendNotification(title: "Chegou ao trabalho", body: "Você chegou ao local de trabalho. Deseja registrar o ponto?", identifier: region.identifier, type: "enter")
  }
  
  public func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
    guard let circularRegion = region as? CLCircularRegion else { return }
    
    print("📍 Exited geofence region: \(region.identifier)")
    
    sendEvent("onGeofenceExit", [
      "identifier": region.identifier,
      "latitude": circularRegion.center.latitude,
      "longitude": circularRegion.center.longitude,
      "radius": circularRegion.radius,
      "timestamp": Date().timeIntervalSince1970
    ])
    
    // Send local notification
    sendNotification(title: "Saiu do trabalho", body: "Você saiu do local de trabalho. Deseja registrar a saída?", identifier: region.identifier, type: "exit")
  }
  
  public func locationManager(_ manager: CLLocationManager, monitoringDidFailFor region: CLRegion?, withError error: Error) {
    print("❌ Geofencing monitoring failed: \(error.localizedDescription)")
    
    sendEvent("onGeofenceError", [
      "identifier": region?.identifier ?? "unknown",
      "error": error.localizedDescription
    ])
  }
  
  public func locationManager(_ manager: CLLocationManager, didDetermineState state: CLRegionState, for region: CLRegion) {
    print("📍 Region state determined: \(region.identifier) - State: \(state.rawValue)")
    
    // If already inside region when monitoring starts, trigger entry event
    if state == .inside {
      locationManager(manager, didEnterRegion: region)
    }
  }
  
  public func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
    print("📍 Location authorization changed: \(status.rawValue)")
    
    // Update background location settings when authorization changes
    if status == .authorizedAlways {
      locationManager?.allowsBackgroundLocationUpdates = true
      locationManager?.pausesLocationUpdatesAutomatically = false
    } else {
      locationManager?.allowsBackgroundLocationUpdates = false
    }
  }
  
  // MARK: - Notifications
  
  private func sendNotification(title: String, body: String, identifier: String, type: String) {
    let center = UNUserNotificationCenter.current()
    
    // Request notification permission
    center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
      if granted {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        content.userInfo = [
          "geofenceIdentifier": identifier,
          "geofenceType": type
        ]
        
        // Create trigger (immediate)
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        
        // Create request
        let request = UNNotificationRequest(
          identifier: "geofence_\(identifier)_\(type)_\(Date().timeIntervalSince1970)",
          content: content,
          trigger: trigger
        )
        
        // Add notification
        center.add(request) { error in
          if let error = error {
            print("❌ Failed to send notification: \(error.localizedDescription)")
          }
        }
      }
    }
  }
}
