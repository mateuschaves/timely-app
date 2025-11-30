# 📱 Como Testar Quick Actions e Siri Shortcuts

Este guia explica como testar as Quick Actions e Siri Shortcuts do Timely App no iOS.

## O que são Quick Actions e Siri Shortcuts?

**Quick Actions** são atalhos que aparecem quando você pressiona e segura (long press) o ícone do aplicativo na tela inicial do iOS. Eles permitem acesso rápido a funcionalidades específicas sem precisar abrir o app completamente.

**Siri Shortcuts** são atalhos que podem ser acionados pela Siri ou através do app Atalhos da Apple. Eles permitem que você execute ações do app usando comandos de voz ou widgets.

No Timely App, temos o atalho "Bater Ponto" que registra automaticamente a entrada ou saída com a hora atual do dispositivo. Este atalho funciona tanto como Quick Action quanto como Siri Shortcut.

## 🔧 Pré-requisitos

1. **Build nativo**: As Quick Actions e Siri Shortcuts só funcionam em builds nativos, não no Expo Go
2. **iOS Device ou Simulator**: Funciona tanto em dispositivo físico quanto no simulador
3. **iOS 14.0+**: Requerido pela configuração do app (Quick Actions)
4. **Biblioteca**: Usamos `expo-quick-actions` para gerenciar os shortcuts

## 📝 Passos para Testar

### 1. Fazer um Build Nativo

Você precisa fazer um build nativo do app primeiro:

```bash
# Build local para iOS
npx expo prebuild --platform ios
npx expo run:ios

# Ou usando EAS Build
eas build --platform ios --profile development
```

### 2. Instalar no Dispositivo/Simulador

Após o build, instale o app no seu dispositivo iOS ou simulador.

### 3. Testar Quick Actions e Siri Shortcuts no iOS

#### Testando Quick Actions (Home Screen):

**No iOS Simulator:**
1. Abra o app no simulador
2. Feche o app (swipe up ou Cmd+Shift+H)
3. Volte para a tela inicial
4. **Pressione e segure** o ícone do Timely App
5. Você verá o menu de Quick Actions aparecer
6. Selecione "Bater Ponto"
7. O app abrirá e registrará o ponto automaticamente

**No Dispositivo Físico:**
1. Instale o app no seu iPhone/iPad
2. Feche o app completamente
3. Na tela inicial, **pressione e segure** o ícone do Timely App
4. Você verá vibração háptica e o menu de Quick Actions
5. Selecione "Bater Ponto"
6. O app abrirá e registrará o ponto automaticamente

#### Testando Siri Shortcuts:

**Configurar o Shortcut na Siri:**
1. Abra o app **Atalhos** no iOS
2. Toque em **"+"** para criar um novo atalho
3. Adicione a ação **"Executar Atalho do App"**
4. Selecione "Timely" e escolha "Bater Ponto"
5. Toque em **"Adicionar à Siri"**
6. Grave um comando de voz (ex: "Bater ponto no Timely")
7. Salve o atalho

**Usar o Shortcut:**
- **Por voz**: Diga "Ei Siri, [seu comando]" (ex: "Ei Siri, bater ponto no Timely")
- **Pelo app Atalhos**: Execute o atalho criado
- **Pelo widget**: Adicione o atalho como widget na tela inicial

### 4. Verificar o Funcionamento

Quando você selecionar "Bater Ponto" através do Quick Action:

- ✅ O app deve abrir automaticamente
- ✅ Deve navegar para a tela Home
- ✅ Deve registrar o ponto com a hora atual do dispositivo
- ✅ A ação (entrada/saída) será determinada automaticamente pelo último evento

### 5. Debugging

Para ver os logs do Quick Action/Siri Shortcut:

1. Abra o console do Xcode (se estiver usando build local)
2. Ou use `npx expo start` e veja os logs no terminal
3. Procure por mensagens como:
   - `Quick Action/Siri Shortcut: Bater ponto com hora atual: ...`
   - `Quick Action/Siri Shortcut: Ação determinada pelo último evento: ...`
   - `Quick Action/Siri Shortcut: Ponto batido com sucesso`

## 🧪 Como Funciona

O Timely App usa a biblioteca `expo-quick-actions` para gerenciar os shortcuts. Quando um shortcut é acionado:

1. O sistema iOS detecta o shortcut (Quick Action ou Siri Shortcut)
2. O `expo-quick-actions` dispara o evento no React Native
3. O hook `useQuickActions` processa o evento
4. O app navega para a tela Home
5. O ponto é registrado automaticamente com a hora atual do dispositivo
6. A ação (entrada/saída) é determinada pelo último evento registrado

## 📱 Integração com Siri Shortcuts

O `expo-quick-actions` automaticamente disponibiliza os shortcuts configurados para integração com a Siri. Quando você configura um shortcut no app:

1. O iOS automaticamente detecta os shortcuts disponíveis
2. Eles aparecem no app **Atalhos** da Apple
3. Você pode adicionar comandos de voz personalizados
4. Os shortcuts funcionam mesmo quando o app está fechado

### Como Adicionar à Siri:

1. Abra o app **Atalhos** no iOS
2. Toque em **"Meus Atalhos"**
3. Procure por "Bater Ponto" do Timely
4. Toque em **"Adicionar à Siri"**
5. Grave um comando de voz (ex: "Bater ponto no Timely")
6. Salve o atalho

Agora você pode dizer "Ei Siri, [seu comando]" para bater o ponto!

## ⚠️ Observações Importantes

1. **Autenticação**: O Quick Action/Siri Shortcut só funciona se o usuário estiver autenticado
2. **Última ação**: A ação (entrada/saída) é determinada pelo último evento registrado
3. **Hora atual**: Sempre usa a hora atual do dispositivo quando o shortcut é acionado
4. **Prevenção de duplicatas**: O sistema evita processar o mesmo shortcut múltiplas vezes
5. **Biblioteca**: Usamos `expo-quick-actions` que gerencia tanto Quick Actions quanto Siri Shortcuts automaticamente

## 🔍 Troubleshooting

### Quick Actions não aparecem

- Verifique se fez um build nativo (não funciona no Expo Go)
- Certifique-se de que o app está instalado
- Reinicie o dispositivo/simulador
- Verifique se o `Info.plist` contém as `UIApplicationShortcutItems`

### Quick Action não registra o ponto

- Verifique os logs do console para erros
- Certifique-se de que está autenticado no app
- Verifique a conexão com a API
- Veja se a localização foi configurada (opcional)

### Atalho aparece mas nada acontece

- Verifique se o deeplink está sendo processado corretamente
- Veja os logs do `useQuickActions` hook
- Confirme que a navegação está funcionando

## 📚 Recursos Adicionais

- [expo-quick-actions Documentation](https://github.com/evanbacon/expo-quick-actions)
- [Apple Documentation - Home Screen Quick Actions](https://developer.apple.com/documentation/uikit/menus_and_shortcuts/interacting_with_home_screen_quick_actions)
- [Apple Documentation - Siri Shortcuts](https://developer.apple.com/documentation/sirikit)
- [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)

