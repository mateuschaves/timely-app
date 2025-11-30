const { withInfoPlist, withAppDelegate } = require('@expo/config-plugins');

/**
 * Plugin Expo para configurar Quick Actions no iOS
 * Quando a quick action é acionada, dispara um deeplink que será processado pelo React Native
 */
const withQuickActions = (config) => {
  // Configura as Quick Actions no Info.plist
  config = withInfoPlist(config, (config) => {
    const shortcutItems = [
      {
        UIApplicationShortcutItemType: 'com.wazowsky.timelyapp.quick-action.clock',
        UIApplicationShortcutItemTitle: 'Bater Ponto',
        UIApplicationShortcutItemSubtitle: 'Registrar entrada ou saída',
        UIApplicationShortcutItemIconType: 'Time',
        UIApplicationShortcutItemUserInfo: {
          quickAction: 'clock',
        },
      },
    ];

    config.modResults.UIApplicationShortcutItems = shortcutItems;
    return config;
  });

  // Configura o AppDelegate para processar quick actions e disparar deeplink
  config = withAppDelegate(config, (config) => {
    const appDelegate = config.modResults.contents;

    // Adiciona o método para processar quick actions
    const quickActionMethod = `
  - (BOOL)application:(UIApplication *)application performActionForShortcutItem:(UIApplicationShortcutItem *)shortcutItem completionHandler:(void (^)(BOOL))completionHandler {
    if ([shortcutItem.type isEqualToString:@"com.wazowsky.timelyapp.quick-action.clock"]) {
      // Cria um deeplink com a hora atual do dispositivo
      NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
      [formatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"];
      [formatter setTimeZone:[NSTimeZone timeZoneWithAbbreviation:@"UTC"]];
      NSString *currentTime = [formatter stringFromDate:[NSDate date]];
      
      // Codifica a URL
      NSString *urlString = [NSString stringWithFormat:@"timely://?time=%@&quick-action=true", currentTime];
      NSString *encodedUrl = [urlString stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
      
      // Dispara um deeplink que será processado pelo React Native
      NSURL *url = [NSURL URLWithString:encodedUrl];
      [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
      completionHandler(YES);
      return YES;
    }
    completionHandler(NO);
    return NO;
  }`;

    // Adiciona o método antes do @end final
    if (appDelegate.includes('@end')) {
      config.modResults.contents = appDelegate.replace(
        /(@end\s*)$/,
        `${quickActionMethod}\n\n$1`
      );
    }

    return config;
  });

  return config;
};

module.exports = withQuickActions;

