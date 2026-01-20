# Configuração do Live Activity Widget Extension

## Problema Identificado

O Live Activity Widget Extension não está configurado no projeto do Xcode. Todos os arquivos Swift foram criados, mas o Extension precisa ser adicionado manualmente ao projeto.

## Arquivos Criados

✅ `/ios/LiveActivity/LiveActivity.swift` - Código do Widget
✅ `/ios/LiveActivity/Info.plist` - Configuração do Widget
✅ `/ios/LiveActivity/Assets.xcassets/` - Assets do Widget
✅ `/ios/Timely/Info.plist` - Adicionado `NSSupportsLiveActivities`

## Passos para Configurar no Xcode

### 1. Abrir o Projeto no Xcode

```bash
cd ios
open Timely.xcworkspace
```

### 2. Adicionar o Widget Extension Target

1. No Xcode, selecione o projeto `Timely` no Project Navigator (barra lateral esquerda)
2. Na parte inferior da lista de Targets, clique no botão **"+"**
3. Escolha **"Widget Extension"**
4. Configure:
   - **Product Name**: `LiveActivity`
   - **Bundle Identifier**: `com.timelyapp.LiveActivity` (ou use o mesmo prefixo do seu app)
   - **Starting Point**: Escolha "Live Activity"
   - **Include Configuration Intent**: Desmarque
5. Clique em **"Finish"**
6. Quando perguntar "Activate LiveActivity scheme?", clique em **"Activate"**

### 3. Substituir os Arquivos Gerados

O Xcode criou arquivos padrão, mas precisamos usar os que já criamos:

1. No Project Navigator, delete os arquivos dentro da pasta `LiveActivity` (mas mantenha a pasta)
2. No Finder, abra `/ios/LiveActivity/`
3. Arraste os seguintes arquivos para a pasta `LiveActivity` no Xcode:
   - `LiveActivity.swift`
   - `Info.plist`
   - `Assets.xcassets`
4. Certifique-se de marcar **"Copy items if needed"** e adicione ao Target **"LiveActivity"**

### 4. Configurar o Target

1. Selecione o Target `LiveActivity` no Xcode
2. Vá para **"General"**:
   - **iOS Deployment Target**: 16.2 ou superior
   - **Bundle Identifier**: `com.timelyapp.LiveActivity`
3. Vá para **"Signing & Capabilities"**:
   - Configure o mesmo Team e Signing Certificate do app principal
   - Certifique-se de que **"Automatically manage signing"** está marcado
4. Vá para **"Build Settings"**:
   - Busque por "Swift Language Version"
   - Defina para **Swift 5** ou superior
   - Busque por "Product Bundle Identifier"
   - Certifique-se de que está `com.timelyapp.LiveActivity`

### 5. Adicionar Frameworks Necessários

1. Selecione o Target `LiveActivity`
2. Vá para **"General"** → **"Frameworks and Libraries"**
3. Clique no **"+"** e adicione:
   - `WidgetKit.framework`
   - `SwiftUI.framework`
   - `ActivityKit.framework`

### 6. Configurar o App Group (Opcional mas recomendado)

Para compartilhar dados entre o app e o widget:

1. Selecione o Target principal `Timely`
2. Vá para **"Signing & Capabilities"**
3. Clique em **"+ Capability"** e adicione **"App Groups"**
4. Crie um grupo: `group.com.timelyapp.shared`
5. Repita os passos 1-4 para o Target `LiveActivity`

### 7. Verificar Configuração do Main App

No Target principal `Timely`:

1. Vá para **"Info"**
2. Verifique se as chaves foram adicionadas:
   - `NSSupportsLiveActivities` = YES
   - `NSSupportsLiveActivitiesFrequentUpdates` = YES

### 8. Testar

1. Selecione o scheme **"Timely"** (não LiveActivity)
2. Execute o app em um dispositivo físico com iOS 16.2+ (Live Activities não funcionam no simulador completamente)
3. Faça clock-in
4. Bloqueie o dispositivo e veja o Live Activity na tela de bloqueio!

## Solução de Problemas

### Build Errors

- **"Cannot find 'ActivityKit'"**: Certifique-se de que o iOS Deployment Target está em 16.2+
- **"No such module 'WidgetKit'"**: Adicione o framework WidgetKit ao Target

### Live Activity não aparece

- Verifique se está usando um dispositivo físico (não simulador)
- Verifique se o iOS é 16.2 ou superior
- Verifique os logs no Xcode console para erros de `startActivity`
- Certifique-se de que `NSSupportsLiveActivities` está em `Info.plist` do app principal

### Bundle Identifier errado

- O Bundle Identifier do Widget deve ser: `{APP_BUNDLE_ID}.LiveActivity`
- Exemplo: se seu app é `com.timelyapp`, o widget deve ser `com.timelyapp.LiveActivity`

## Verificação Final

Após configurar, compile o projeto:

```bash
cd ios
xcodebuild -workspace Timely.xcworkspace -scheme Timely -configuration Debug
```

Se compilar sem erros, o Live Activity está configurado corretamente!

## Recursos Adicionais

- [Apple Documentation - Live Activities](https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities)
- [expo-live-activity GitHub](https://github.com/kadoshms/expo-live-activity)
