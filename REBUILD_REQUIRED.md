# 🔨 REBUILD NECESSÁRIO

## ❌ Problema Atual

`Error: Cannot read property 'startActivity' of null`

Isso significa que o módulo nativo `ExpoLiveActivity` não está sendo carregado no runtime, mesmo estando instalado via CocoaPods.

## ✅ Solução: Full Rebuild

Como adicionamos um novo módulo nativo (`ExpoLiveActivity`) que não estava sendo usado antes, **é NECESSÁRIO fazer um rebuild completo** do app.

### Opção 1: Via Expo (Recomendado)

```bash
cd /Users/mateushenrique/projects/timely-app

# Limpar tudo
rm -rf ios/build
cd ios && pod install && cd ..

# Rebuild completo
npx expo run:ios --device
```

### Opção 2: Via Xcode

```bash
cd ios
open Timely.xcworkspace
```

No Xcode:
1. **Product** → **Clean Build Folder** (⇧⌘K)
2. Conecte seu dispositivo iOS
3. **Product** → **Build** (⌘B)
4. **Product** → **Run** (⌘R)

### Opção 3: Via Terminal (Mais rápido)

```bash
cd /Users/mateushenrique/projects/timely-app/ios

# Clean
xcodebuild -workspace Timely.xcworkspace -scheme Timely clean

# Build
xcodebuild -workspace Timely.xcworkspace \
  -scheme Timely \
  -configuration Debug \
  -destination 'platform=iOS,name=SEU_DISPOSITIVO' \
  build
```

## 🎯 Por que Rebuild?

Quando você adiciona/modifica módulos nativos:
- ✅ Metro Bundler recarrega o JavaScript
- ❌ Mas o código nativo **NÃO** é recarregado

Módulos nativos precisam ser:
1. Compilados (Swift/Objective-C → binário)
2. Linkados ao app principal
3. Incluídos no bundle do app

Por isso um simples "Reload" do Metro não funciona.

## 🔍 Como saber se funcionou

Após o rebuild, faça clock-in e veja nos logs:

### ✅ Sucesso:
```
LOG  Live Activity started: ABC123-DEF456
LOG  Live Activity updated: 0h 01min
```

### ❌ Ainda com erro:
```
ERROR  Error starting Live Activity: [TypeError: Cannot read property 'startActivity' of null]
```

Se ainda der erro após rebuild, significa que há problema com a instalação do pod. Nesse caso:

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
# Depois rebuild novamente
```

## 📝 Checklist

Antes de buildar, certifique-se:
- [ ] `ios/Podfile` tem `pod 'ExpoLiveActivity'`
- [ ] `ios/Podfile.lock` tem `ExpoLiveActivity (0.4.2)`
- [ ] Executou `pod install` com sucesso
- [ ] Fechou e reabriu o Xcode (se estava aberto)

## 🚀 Depois do Rebuild

1. App vai instalar novamente no dispositivo
2. Faça clock-in
3. Live Activity deve funcionar!
4. Bloqueie o aparelho para ver o Live Activity

## ⏱️ Tempo Estimado

- Via `expo run:ios`: ~3-5 minutos
- Via Xcode: ~2-3 minutos
- Via xcodebuild: ~2-3 minutos

## 💡 Dica

Use `expo run:ios --device` porque:
- ✅ Detecta seu dispositivo automaticamente
- ✅ Faz pod install se necessário
- ✅ Faz build e instala em um comando
- ✅ Inicia o Metro Bundler junto
