# Configuração do App Intent para Bater Ponto

Este documento explica como configurar o App Intent que permite bater ponto através de atalhos do iOS (iOS 16+).

## O que foi criado

Foi criado o arquivo `ios/Timely/ClockIntent.swift` que implementa um App Intent para bater ponto. Quando executado, ele:

1. **Recupera o token JWT** do UserDefaults (onde o AsyncStorage armazena no iOS)
2. **Busca o último evento** da API para determinar se a próxima ação é entrada ou saída
3. **Faz a chamada HTTP diretamente** para a API sem abrir o app
4. **Funciona mesmo com o dispositivo bloqueado** ou quando executado via Siri/Shortcuts

## Configuração no Xcode

Para que o App Intent funcione, você precisa adicionar o arquivo ao projeto Xcode:

1. Abra o projeto no Xcode:
   ```bash
   open ios/Timely.xcworkspace
   ```

2. No Xcode, adicione o arquivo `ClockIntent.swift` ao target:
   - Clique com o botão direito no grupo `Timely` no Project Navigator
   - Selecione "Add Files to Timely..."
   - Navegue até `ios/Timely/ClockIntent.swift`
   - Certifique-se de que o target "Timely" está marcado
   - Clique em "Add"

3. Verifique se o arquivo está incluído no target:
   - Selecione o arquivo `ClockIntent.swift` no Project Navigator
   - No File Inspector (painel direito), verifique se o target "Timely" está marcado

4. Verifique o deployment target:
   - Selecione o projeto "Timely" no Project Navigator
   - Vá em "Build Settings"
   - Procure por "iOS Deployment Target"
   - O App Intent requer iOS 16.0+, mas o app pode manter compatibilidade com versões anteriores
   - O código usa `@available(iOS 16.0, *)` para garantir compatibilidade

5. **IMPORTANTE - Para aparecer nas sugestões de busca**:
   - Faça um **Clean Build** (Product → Clean Build Folder ou Shift+Cmd+K)
   - Faça um **rebuild completo** do projeto (Product → Build ou Cmd+B)
   - Execute o app no simulador/dispositivo
   - Aguarde alguns minutos para o iOS indexar os App Intents
   - Verifique as configurações de busca:
     - Ajustes → Siri e Busca → Timely
     - Ative "Mostrar App na Busca" e "Mostrar Conteúdo na Busca"
   - Reinicie o simulador/dispositivo se necessário

## Como usar

Após configurar o App Intent:

1. **No app Shortcuts (Atalhos)**:
   - Abra o app Atalhos no iOS
   - Toque em "+" para criar um novo atalho
   - Procure por "Bater Ponto" ou "Timely"
   - Adicione a ação "Bater Ponto"
   - Salve o atalho

2. **Com Siri**:
   - Você pode adicionar o atalho ao Siri
   - Diga "Ei Siri, bater ponto" (ou o nome que você configurou)
   - Ou use as frases sugeridas: "Bater ponto no Timely", "Registrar ponto no Timely", "Marcar ponto no Timely"

3. **No widget de atalhos**:
   - Adicione o widget de atalhos na tela inicial
   - Toque no atalho "Bater Ponto" para executar

4. **Nas sugestões de busca do iOS**:
   - Pesquise por "Timely" ou "Bater Ponto" no Spotlight
   - O App Intent deve aparecer como sugestão
   - Certifique-se de que as configurações de busca estão habilitadas:
     - Ajustes → Siri e Busca → Timely
     - Ative "Mostrar App na Busca" e "Mostrar Conteúdo na Busca"

## Como funciona

Quando o App Intent é executado:

1. **Captura o timestamp**: O intent captura a hora IMEDIATAMENTE no início da execução, antes de qualquer confirmação do usuário
2. **Recupera o token**: O intent acessa o UserDefaults para recuperar o token JWT armazenado pelo AsyncStorage
3. **Registra o ponto**: Faz uma chamada POST para `/clockin` com:
   - `hour`: Hora de invocação capturada no passo 1 (formato ISO8601)
   - O backend determina automaticamente se é entrada ou saída baseado no último evento do usuário
4. **Retorna resultado**: Retorna sucesso ou erro para o usuário

**Importante**: 
- Toda a lógica é executada nativamente em Swift, sem abrir o app React Native
- Funciona mesmo com o dispositivo bloqueado
- O backend é responsável por determinar se é entrada ou saída, então não precisamos fazer chamadas extras
- **Timestamp preciso**: Mesmo se o iOS pedir confirmação do usuário antes de executar a ação, o horário registrado será o momento exato em que o Shortcuts chamou o intent, não quando o usuário confirmou

## Notas importantes

- O App Intent requer iOS 16.0 ou superior
- O app mantém compatibilidade com versões anteriores do iOS
- O intent usa o mesmo sistema de deeplink já existente no app
- A ação (entrada/saída) é determinada automaticamente pelo último evento registrado

