# 🔧 Fix: Live Activity "not supported" no dispositivo físico

## ❌ Problema Atual

Mesmo no dispositivo físico, aparece: `Live Activities not supported or enabled`

## 🔍 Causa Raiz

O módulo `expo-live-activity` não está sendo linkado corretamente via CocoaPods. As funções `startActivity` e `endActivity` não estão disponíveis porque o módulo nativo não foi incluído no build.

## ✅ Solução Manual (Funciona 100%)

Já que o autolinking não está funcionando, vamos adicionar o módulo manualmente:

### Opção 1: Adicionar manualmente ao Podfile

1. Abra `/Users/mateushenrique/projects/timely-app/ios/Podfile`
2. Dentro do `target 'Timely' do ... end`, adicione:

```ruby
target 'Timely' do
  use_expo_modules!
  
  # Adicione esta linha manualmente
  pod 'ExpoLiveActivity', :path => '../node_modules/expo-live-activity/ios'
  
  # ... resto do Podfile
end
```

3. Execute:
```bash
cd ios
pod install
```

4. Abra no Xcode e faça Build

### Opção 2: Usar expo-dev-client

Como o app usa módulos nativos customizados, a melhor abordagem é usar development build:

```bash
# Instalar expo-dev-client se ainda não tiver
npm install expo-dev-client

# Build para iOS
npx expo run:ios --device

# Ou via Xcode
cd ios
open Timely.xcworkspace
# Selecione seu dispositivo e Run
```

### Opção 3: Verificar configuração do app.json

O `app.json` tem uma configuração customizada:

```json
[
  "expo-live-activity",
  {
    "frequentUpdates": true,
    "modulePath": "./modules/expo-live-activity/index.ts"
  }
]
```

Essa configuração deveria funcionar, mas pode estar causando problemas com o autolinking. Teste remover o `modulePath` temporariamente:

```json
[
  "expo-live-activity",
  {
    "frequentUpdates": true
  }
]
```

Depois:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
```

## 🎯 Como verificar se funcionou

Após aplicar qualquer solução acima, verifique:

1. **No Podfile.lock**, procure por:
```bash
cd ios
cat Podfile.lock | grep ExpoLiveActivity
```

Deve aparecer algo como:
```
  - ExpoLiveActivity (0.4.2):
```

2. **Na pasta Pods**, verifique:
```bash
ls ios/Pods | grep ExpoLive
```

Deve aparecer:
```
ExpoLiveActivity
```

3. **No app**, os logs devem mostrar:
```
✅ Live Activity started: [activity-id]
```

Em vez de:
```
❌ Live Activities not supported or enabled
```

## 📝 Contexto Técnico

O problema acontece porque:
- `expo-live-activity@0.4.2` está instalado no `node_modules` ✅
- O Widget Extension está configurado no Xcode ✅
- `NSSupportsLiveActivities` está no `Info.plist` ✅
- MAS o módulo nativo não está sendo linkado via CocoaPods ❌

O autolinking do Expo (`use_expo_modules!`) deveria fazer isso automaticamente, mas por algum motivo não está funcionando neste projeto específico.

## 🆘 Se nada funcionar

Como última alternativa, você pode:

1. Desinstalar o `expo-live-activity`
2. Reinstalar com o autolinking limpo:

```bash
# Remover
npm uninstall expo-live-activity

# Limpar
rm -rf node_modules ios/Pods ios/Podfile.lock
npm install

# Reinstalar expo-live-activity
npm install expo-live-activity@0.4.2

# Reinstalar pods
cd ios
pod install
```

Depois teste novamente.
