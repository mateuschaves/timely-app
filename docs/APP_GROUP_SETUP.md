# Configuração do App Group para App Intent

Este documento explica como configurar o App Group corretamente no Xcode para que o App Intent possa acessar o token de autenticação.

## O que foi implementado

1. ✅ Código Swift que salva/recupera o token do App Group (`TokenStorage.swift`)
2. ✅ Código Swift no App Intent que lê o token do App Group (`ClockIntent.swift`)
3. ✅ App Group configurado no arquivo de entitlements (`Timely.entitlements`)

## IMPORTANTE: Verificações no Xcode

### 1. Verificar se o App Group está nas Capabilities

**No Xcode:**

1. Abra o projeto:
   ```bash
   open ios/Timely.xcworkspace
   ```

2. Selecione o projeto "Timely" no Project Navigator (primeiro item)

3. Selecione o target "Timely"

4. Vá na aba **"Signing & Capabilities"**

5. **VERIFIQUE se "App Groups" está listado nas capabilities**

6. Se **NÃO** estiver:
   - Clique no botão **"+ Capability"** (no canto superior esquerdo)
   - Procure e adicione **"App Groups"**
   - **IMPORTANTE**: Certifique-se de que o App Group `group.com.wazowsky.timelyapp` está marcado/ativado

### 2. Verificar o Apple Developer Portal

O App Group também precisa estar configurado no Apple Developer Portal:

1. Acesse [developer.apple.com](https://developer.apple.com)
2. Vá em **Certificates, Identifiers & Profiles**
3. Vá em **Identifiers** → **App Groups**
4. **VERIFIQUE** se existe um App Group com ID `group.com.wazowsky.timelyapp`
5. Se **NÃO** existir:
   - Clique em **"+"** para criar um novo App Group
   - Digite a Description: `Timely App Group`
   - Digite o Identifier: `group.com.wazowsky.timelyapp`
   - Clique em **Continue** e depois **Register**

### 3. Verificar o Provisioning Profile

O Provisioning Profile precisa incluir o App Group:

1. No Xcode, vá em **Signing & Capabilities**
2. Certifique-se de que o **Team** está selecionado corretamente
3. Se necessário, gere um novo Provisioning Profile que inclua o App Group

### 4. Verificar o arquivo de entitlements

O arquivo `ios/Timely/Timely.entitlements` deve conter:

```xml
<key>com.apple.security.application-groups</key>
<array>
    <string>group.com.wazowsky.timelyapp</string>
</array>
```

## Como testar

1. **Limpe o build:**
   - Product → Clean Build Folder (Shift+Cmd+K)

2. **Faça rebuild:**
   - Product → Build (Cmd+B)

3. **Execute o app e faça login novamente** (importante para salvar o token no App Group)

4. **Execute o App Intent** e verifique os logs no console do Xcode

## Logs esperados

### Quando salvar o token (no app):
```
💾 Salvando token no App Group UserDefaults via módulo nativo...
✅ Token salvo no App Group UserDefaults com sucesso
```

### Quando executar o App Intent:
```
🔍 Tentando acessar o App Group 'group.com.wazowsky.timelyapp'...
✅ App Group acessado com sucesso
📋 Chaves disponíveis no App Group: ["timely_token"]
✅ Token encontrado e válido no App Group 'group.com.wazowsky.timelyapp' com a chave 'timely_token'
```

## Erros comuns

### "Não foi possível acessar o App Group"
**Causa**: O App Group não está configurado nas Capabilities do Xcode
**Solução**: Siga o passo 1 acima

### "Nenhum valor encontrado no App Group"
**Causa**: O token não foi salvo no App Group (módulo nativo não funcionou)
**Solução**: 
- Verifique os logs do React Native ao fazer login
- Verifique se o módulo nativo `TokenStorage` está sendo encontrado
- Faça login novamente após verificar que tudo está configurado

### "Módulo TokenStorage não encontrado"
**Causa**: O módulo nativo não está sendo registrado corretamente
**Solução**:
- Verifique se os arquivos `TokenStorage.swift` e `TokenStorageBridge.m` estão no target "Timely"
- Faça um Clean Build e rebuild

