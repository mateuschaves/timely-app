import ActivityKit
import WidgetKit
import SwiftUI

// MARK: - Activity Attributes
// This MUST match exactly the LiveActivityAttributes from expo-live-activity
struct LiveActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var title: String
        var subtitle: String?
        var timerEndDateInMilliseconds: Double?
        var progress: Double?
        var imageName: String?
        var dynamicIslandImageName: String?
    }
    
    var name: String
    var backgroundColor: String?
    var titleColor: String?
    var subtitleColor: String?
    var progressViewTint: String?
    var progressViewLabelColor: String?
    var deepLinkUrl: String?
    var timerType: DynamicIslandTimerType?
    var padding: Int?
    var paddingDetails: PaddingDetails?
    var imagePosition: String?
    var imageWidth: Int?
    var imageHeight: Int?
    var imageWidthPercent: Double?
    var imageHeightPercent: Double?
    var imageAlign: String?
    var contentFit: String?
    
    enum DynamicIslandTimerType: String, Codable {
        case circular
        case digital
    }
    
    struct PaddingDetails: Codable, Hashable {
        var top: Int?
        var bottom: Int?
        var left: Int?
        var right: Int?
        var vertical: Int?
        var horizontal: Int?
    }
}

// MARK: - Live Activity Widget
@available(iOS 16.2, *)
struct TimelyWorkSessionLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: LiveActivityAttributes.self) { context in
            // Lock screen/banner UI goes here
            LiveActivityView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here
                DynamicIslandExpandedRegion(.leading) {
                    HStack {
                        Image(systemName: "clock.fill")
                            .foregroundColor(.blue)
                        Text("Timely")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.subtitle ?? "")
                        .font(.caption)
                        .foregroundColor(.primary)
                        .monospacedDigit()
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(context.state.title)
                            .font(.headline)
                            .foregroundColor(.primary)
                        if let subtitle = context.state.subtitle {
                            Text(subtitle)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.horizontal)
                }
            } compactLeading: {
                Image(systemName: "clock.fill")
                    .foregroundColor(.blue)
            } compactTrailing: {
                Text(context.state.subtitle ?? "")
                    .font(.caption2)
                    .monospacedDigit()
            } minimal: {
                Image(systemName: "clock.fill")
                    .foregroundColor(.blue)
            }
        }
    }
}

// MARK: - Lock Screen View
@available(iOS 16.2, *)
struct LiveActivityView: View {
    let context: ActivityViewContext<LiveActivityAttributes>
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: "clock.fill")
                .font(.title2)
                .foregroundColor(.blue)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(context.state.title)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                if let subtitle = context.state.subtitle {
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .monospacedDigit()
                }
            }
            
            Spacer()
        }
        .padding()
        .activityBackgroundTint(Color.black.opacity(0.25))
        .activitySystemActionForegroundColor(.white)
    }
}

// MARK: - Widget Bundle
@available(iOS 16.2, *)
@main
struct TimelyWorkSessionBundle: WidgetBundle {
    var body: some Widget {
        TimelyWorkSessionLiveActivity()
    }
}
