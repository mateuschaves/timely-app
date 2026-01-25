import ExpoModulesCore
import CoreLocation

// Helper class to handle CLLocationManagerDelegate since we can't inherit from both NSObject and BaseModule
private class GeofencingDelegate: NSObject, CLLocationManagerDelegate {
  weak var module: ExpoGeofencingModule?
  
  init(module: ExpoGeofencingModule) {
    self.module = module
    super.init()
  }
  
  func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
    module?.handleEnterRegion(region)
  }
  
  func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
    module?.handleExitRegion(region)
  }
  
  func locationManager(_ manager: CLLocationManager, monitoringDidFailFor region: CLRegion?, withError error: Error) {
    module?.handleMonitoringFailed(region, error: error)
  }
  
  func locationManager(_ manager: CLLocationManager, didDetermineState state: CLRegionState, for region: CLRegion) {
    module?.handleDetermineState(state, for: region)
  }
  
  func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
    module?.handleAuthorizationChange(status)
  }
}

public class ExpoGeofencingModule: Module {
  private var locationManager: CLLocationManager?
  private var delegate: GeofencingDelegate?
  private var monitoredRegions: [String: CLCircularRegion] = [:]
  // Track region states to prevent duplicate events
  private var regionStates: [String: CLRegionState] = [:]
  // Track last event timestamps to prevent rapid duplicate events
  private var lastEnterTimestamps: [String: TimeInterval] = [:]
  private var lastExitTimestamps: [String: TimeInterval] = [:]
  
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
    delegate = GeofencingDelegate(module: self)
    locationManager?.delegate = delegate
    locationManager?.desiredAccuracy = kCLLocationAccuracyBest
    // Note: For geofencing, we don't need allowsBackgroundLocationUpdates
    // Geofencing works automatically in background with "Always" authorization
    // allowsBackgroundLocationUpdates is only needed for continuous location updates
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
    regionStates.removeValue(forKey: identifier)
    lastEnterTimestamps.removeValue(forKey: identifier)
    lastExitTimestamps.removeValue(forKey: identifier)
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
    regionStates.removeAll()
    lastEnterTimestamps.removeAll()
    lastExitTimestamps.removeAll()
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
  
  // MARK: - Delegate Handlers (called by GeofencingDelegate)
  
  fileprivate func handleEnterRegion(_ region: CLRegion) {
    guard let circularRegion = region as? CLCircularRegion else { return }
    
    let identifier = region.identifier
    let currentTime = Date().timeIntervalSince1970
    
    // Check if we're already inside this region (prevent duplicate events)
    if let currentState = regionStates[identifier], currentState == .inside {
      print("📍 Already inside region \(identifier), ignoring duplicate enter event")
      return
    }
    
    // Check if we recently sent an enter event (within last 60 seconds)
    if let lastEnter = lastEnterTimestamps[identifier],
       currentTime - lastEnter < 60 {
      print("📍 Recent enter event for \(identifier) (\(currentTime - lastEnter)s ago), ignoring duplicate")
      return
    }
    
    // Update state and timestamp
    regionStates[identifier] = .inside
    lastEnterTimestamps[identifier] = currentTime
    
    print("📍 Entered geofence region: \(identifier)")
    
    sendEvent("onGeofenceEnter", [
      "identifier": identifier,
      "latitude": circularRegion.center.latitude,
      "longitude": circularRegion.center.longitude,
      "radius": circularRegion.radius,
      "timestamp": currentTime
    ])
    
    // Note: Notifications are handled by the React Native layer with proper i18n support
  }
  
  fileprivate func handleExitRegion(_ region: CLRegion) {
    guard let circularRegion = region as? CLCircularRegion else { return }
    
    let identifier = region.identifier
    let currentTime = Date().timeIntervalSince1970
    
    // Check if we're already outside this region (prevent duplicate events)
    if let currentState = regionStates[identifier], currentState == .outside {
      print("📍 Already outside region \(identifier), ignoring duplicate exit event")
      return
    }
    
    // Check if we recently sent an exit event (within last 60 seconds)
    if let lastExit = lastExitTimestamps[identifier],
       currentTime - lastExit < 60 {
      print("📍 Recent exit event for \(identifier) (\(currentTime - lastExit)s ago), ignoring duplicate")
      return
    }
    
    // Update state and timestamp
    regionStates[identifier] = .outside
    lastExitTimestamps[identifier] = currentTime
    
    print("📍 Exited geofence region: \(identifier)")
    
    sendEvent("onGeofenceExit", [
      "identifier": identifier,
      "latitude": circularRegion.center.latitude,
      "longitude": circularRegion.center.longitude,
      "radius": circularRegion.radius,
      "timestamp": currentTime
    ])
    
    // Note: Notifications are handled by the React Native layer with proper i18n support
  }
  
  fileprivate func handleMonitoringFailed(_ region: CLRegion?, error: Error) {
    print("❌ Geofencing monitoring failed: \(error.localizedDescription)")
    
    sendEvent("onGeofenceError", [
      "identifier": region?.identifier ?? "unknown",
      "error": error.localizedDescription
    ])
  }
  
  fileprivate func handleDetermineState(_ state: CLRegionState, for region: CLRegion) {
    let identifier = region.identifier
    print("📍 Region state determined: \(identifier) - State: \(state.rawValue)")
    
    // Update the region state
    regionStates[identifier] = state
    
    // Only trigger entry event if we're inside and we weren't tracking this state before
    // This prevents duplicate events when monitoring starts
    if state == .inside {
      // Only send event if we don't have a recent enter event
      let currentTime = Date().timeIntervalSince1970
      if let lastEnter = lastEnterTimestamps[identifier],
         currentTime - lastEnter < 60 {
        print("📍 Already processed enter event for \(identifier) recently, skipping")
        return
      }
      handleEnterRegion(region)
    } else {
      // Update state to outside if we're not inside
      regionStates[identifier] = .outside
    }
  }
  
  fileprivate func handleAuthorizationChange(_ status: CLAuthorizationStatus) {
    print("📍 Location authorization changed: \(status.rawValue)")
    
    // Note: For geofencing, we don't need to set allowsBackgroundLocationUpdates
    // Geofencing region monitoring works automatically in background with "Always" authorization
    // Setting allowsBackgroundLocationUpdates requires specific background modes and can cause crashes
    // if not properly configured in Info.plist
  }
}
