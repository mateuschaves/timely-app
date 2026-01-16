# Correção do Apple Sign In após expo prebuild

Após executar `expo prebuild`, o plugin `expo-apple-authentication` pode não configurar corretamente o arquivo de entitlements. Este documento explica como corrigir.

## O que foi feito

1. ✅ Criado o arquivo `ios/Timely/Timely.entitlements` com a capability do Apple Sign In
2. ✅ Adicionado o arquivo ao projeto Xcode (`project.pbxproj`)
3. ✅ Configurado `CODE_SIGN_ENTITLEMENTS` nos build settings (Debug e Release)

## Verificação no Xcode

Para garantir que está tudo correto:

1. **Abra o projeto no Xcode:**
   ```bash
   open ios/Timely.xcworkspace
   ```

2. **Verifique o arquivo de entitlements:**
   - No Project Navigator, verifique se `Timely.entitlements` aparece no grupo `Timely`
   - Se não aparecer, adicione manualmente:
     - Clique com botão direito no grupo `Timely`
     - Selecione "Add Files to Timely..."
     - Navegue até `ios/Timely/Timely.entitlements`
     - Certifique-se de que o target "Timely" está marcado
     - Clique em "Add"

3. **Verifique as Capabilities:**
   - Selecione o projeto "Timely" no Project Navigator
   - Selecione o target "Timely"
   - Vá na aba "Signing & Capabilities"
   - Verifique se "Sign In with Apple" está listado nas capabilities
   - Se não estiver, clique em "+ Capability" e adicione "Sign In with Apple"

4. **Verifique o Build Settings:**
   - Na aba "Build Settings"
   - Procure por "Code Signing Entitlements"
   - Deve estar configurado como `Timely/Timely.entitlements`

5. **Verifique o Bundle Identifier:**
   - Na aba "General" ou "Build Settings"
   - O Bundle Identifier deve ser `com.wazowsky.timelyapp` (conforme `app.json`)
   - Se estiver diferente, atualize para corresponder ao `app.json`

## Se ainda não funcionar

1. **Limpe o build:**
   - Product → Clean Build Folder (Shift+Cmd+K)

2. **Reinstale os pods:**
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

3. **Faça um rebuild completo:**
   - Product → Build (Cmd+B)

4. **Verifique se o Apple Developer Account está configurado:**
   - Na aba "Signing & Capabilities"
   - Certifique-se de que há um Team selecionado
   - O Sign In with Apple só funciona com um Team válido

## Erro comum

Se você receber um erro como:
- "Sign in with Apple capability is not enabled"
- "Missing com.apple.developer.applesignin entitlement"

Isso significa que:
1. O arquivo de entitlements não está sendo usado
2. A capability não está habilitada no Xcode
3. O Bundle Identifier não corresponde ao configurado no Apple Developer Console

Siga os passos acima para corrigir.

