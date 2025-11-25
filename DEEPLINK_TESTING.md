# 🧪 Guia de Teste de Deeplinks

Este guia mostra como testar deeplinks no Timely App usando Expo.

## 📱 Métodos de Teste

### 1. Usando o Terminal (Recomendado)

#### iOS (Simulador)
```bash
# Abrir deeplink no simulador iOS
xcrun simctl openurl booted "timely://?time=2024-01-01T10:00:00Z&type=entry"
```

#### Android (Emulador)
```bash
# Abrir deeplink no emulador Android
adb shell am start -W -a android.intent.action.VIEW -d "timely://?time=2024-01-01T10:00:00Z&type=entry" com.timelyapp
```

#### Usando o script npm (mais fácil)
```bash
# Testar deeplink de entrada
npm run deeplink:entry

# Testar deeplink de saída
npm run deeplink:exit

# Testar deeplink com hora customizada
npm run deeplink:custom "2024-01-01T14:30:00Z"
```

### 2. Usando o Expo Dev Tools

1. Inicie o app com `npm start`
2. Abra o Expo Dev Tools (pressione `m` no terminal ou acesse http://localhost:19002)
3. Use a opção "Open URL" e cole: `timely://?time=2024-01-01T10:00:00Z&type=entry`

### 3. Testando no Dispositivo Físico

#### iOS (iPhone/iPad)
1. Abra o app Safari no dispositivo
2. Digite na barra de endereço: `timely://?time=2024-01-01T10:00:00Z&type=entry`
3. O app será aberto automaticamente

#### Android
1. Abra o app Terminal ou use ADB
2. Execute:
```bash
adb shell am start -W -a android.intent.action.VIEW -d "timely://?time=2024-01-01T10:00:00Z&type=entry" com.timelyapp
```

### 4. Usando Shortcuts da Apple (iOS)

1. Abra o app Shortcuts
2. Crie um novo atalho
3. Adicione a ação "Texto" com o valor: `timely://?time={HORA_ATUAL}&type=entry`
4. Adicione a ação "Abrir URLs"
5. Execute o atalho

## 🔗 Formatos de Deeplink

### Formato Básico
```
timely://?time=2024-01-01T10:00:00Z&type=entry
```

### Parâmetros Disponíveis

- `time` (obrigatório): Data/hora no formato ISO 8601
  - Exemplo: `2024-01-01T10:00:00Z`
  - Para hora atual: Use `new Date().toISOString()` no JavaScript

- `type` (opcional): Tipo de registro
  - `entry` - Entrada (padrão)
  - `exit` - Saída

### Exemplos

```bash
# Entrada com hora atual
timely://?time=2024-12-24T09:00:00Z&type=entry

# Saída
timely://?time=2024-12-24T18:00:00Z&type=exit

# Apenas hora (tipo padrão será 'entry')
timely://?time=2024-12-24T12:30:00Z
```

## 🐛 Debugging

### Verificar se o deeplink está sendo recebido

1. Abra o console do Expo (pressione `j` no terminal)
2. Procure por mensagens como:
   - `Deeplink recebido: timely://...`
   - `App aberto via deeplink: timely://...`

### Testar no console do React Native

Adicione este código temporariamente no seu componente para ver os deeplinks:

```typescript
useEffect(() => {
  const subscription = Linking.addEventListener('url', (event) => {
    console.log('🔗 Deeplink recebido:', event.url);
    Alert.alert('Deeplink', `Recebido: ${event.url}`);
  });
  return () => subscription.remove();
}, []);
```

## ⚠️ Observações Importantes

1. **App deve estar rodando**: O deeplink só funciona se o app estiver instalado e configurado
2. **Build nativo necessário**: Para testar em dispositivos físicos, você precisa fazer um build nativo (`npx expo prebuild`)
3. **URL encoding**: Se usar caracteres especiais, encode a URL:
   ```bash
   timely://?time=2024-01-01T10%3A00%3A00Z&type=entry
   ```

## 🚀 Teste Rápido

Execute este comando para testar imediatamente (ajuste para seu sistema):

```bash
# iOS Simulator
xcrun simctl openurl booted "timely://?time=$(date -u +%Y-%m-%dT%H:%M:%SZ)&type=entry"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "timely://?time=$(date -u +%Y-%m-%dT%H:%M:%SZ)&type=entry" com.timelyapp
```

