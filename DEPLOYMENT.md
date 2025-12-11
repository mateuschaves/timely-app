# Manual de Deploy - Timely App

Este manual descreve o processo completo de deploy da aplicação Timely em produção usando EAS (Expo Application Services) e atualizações OTA (Over-The-Air).

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração Inicial](#configuração-inicial)
3. [Build de Produção](#build-de-produção)
4. [Atualizações OTA](#atualizações-ota)
5. [Deploy em Produção](#deploy-em-produção)
6. [Gerenciamento de Versões](#gerenciamento-de-versões)
7. [Rollback e Recuperação](#rollback-e-recuperação)
8. [Troubleshooting](#troubleshooting)

## 🔧 Pré-requisitos

### Ferramentas Necessárias

1. **Node.js** (v18 ou superior)
   ```bash
   node --version
   ```

2. **npm** ou **yarn**
   ```bash
   npm --version
   ```

3. **EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

4. **Expo CLI** (opcional, mas recomendado)
   ```bash
   npm install -g expo-cli
   ```

### Contas e Credenciais

1. **Conta Expo**: Criar em [expo.dev](https://expo.dev)
2. **Apple Developer Account**: Para builds iOS (necessário para produção)
3. **Google Play Console**: Para builds Android (necessário para produção)

### Configuração do Projeto

O projeto já está configurado com:
- ✅ EAS Project ID: `ea5bb2c2-37c7-4f85-9a32-e9f31de5e4cf`
- ✅ Bundle Identifier iOS: `com.wazowsky.timelyapp`
- ✅ Package Android: `com.timelyapp`
- ✅ Atualizações OTA habilitadas
- ✅ Canais de update configurados (development, preview, production)

## 🚀 Configuração Inicial

### 1. Fazer Login no EAS

```bash
eas login
```

Insira suas credenciais da conta Expo.

### 2. Verificar Configuração do Projeto

```bash
eas whoami
eas project:info
```

Isso deve mostrar o projeto vinculado: `timely-app`

### 3. Configurar Credenciais (Primeira Vez)

#### iOS

```bash
# Configurar credenciais de desenvolvimento
eas credentials

# Ou deixar o EAS gerenciar automaticamente durante o primeiro build
eas build --platform ios --profile production
```

Você precisará fornecer:
- Apple Team ID
- Certificados de distribuição
- Provisioning Profiles

#### Android

```bash
# Configurar credenciais Android
eas credentials

# Ou deixar o EAS criar um keystore automaticamente
eas build --platform android --profile production
```

## 🏗️ Build de Produção

### Tipos de Build

O projeto possui três perfis de build configurados:

1. **Development**: Build de desenvolvimento com client development
2. **Preview**: Build interno para testes
3. **Production**: Build final para as lojas

### Build iOS Production

```bash
# Build completo para iOS
eas build --platform ios --profile production

# Build específico para App Store
eas build --platform ios --profile production --auto-submit
```

**Nota**: O `--auto-submit` envia automaticamente para a App Store Connect após o build.

### Build Android Production

```bash
# Build completo para Android (AAB para Play Store)
eas build --platform android --profile production

# Build específico para Play Store com submissão automática
eas build --platform android --profile production --auto-submit
```

### Build para Ambas Plataformas

```bash
# Build simultâneo iOS e Android
eas build --platform all --profile production
```

### Monitoramento do Build

Após iniciar o build:
1. Acesse o link fornecido no terminal
2. Ou visite: [https://expo.dev/accounts/mateuschaves/projects/timely-app/builds](https://expo.dev/accounts/mateuschaves/projects/timely-app/builds)
3. Monitore o progresso e logs em tempo real

## 📱 Atualizações OTA

As atualizações OTA permitem enviar updates de JavaScript e assets sem precisar rebuildar a aplicação nativa.

### Quando Usar OTA

✅ **Use OTA para:**
- Correções de bugs JavaScript/TypeScript
- Mudanças de UI/UX
- Atualizações de conteúdo
- Mudanças de lógica de negócio
- Updates de texto e traduções

❌ **NÃO use OTA para:**
- Atualizações de dependências nativas
- Mudanças em permissões (Info.plist, AndroidManifest.xml)
- Atualizações de versão do Expo SDK
- Mudanças em configurações nativas

### Publicar Update OTA

#### Produção

```bash
# Publicar update no canal de produção
eas update --branch production --message "Fix: Correção de bug no registro de ponto"

# Publicar com auto-geração de mensagem
eas update --branch production --auto
```

#### Preview (Staging)

```bash
# Publicar update no canal de preview para testes
eas update --branch preview --message "Feature: Nova tela de relatórios"
```

#### Development

```bash
# Publicar update no canal de desenvolvimento
eas update --branch development --message "Teste de nova feature"
```

### Verificar Updates Publicados

```bash
# Ver histórico de updates
eas update:list --branch production

# Ver detalhes de um update específico
eas update:view [UPDATE_ID]
```

### Como Funciona o OTA

1. **Verificação Automática**: 
   - O app verifica updates no launch (configurado como `ON_LOAD`)
   - Downloads são feitos em background

2. **Aplicação do Update**:
   - Update é aplicado no próximo restart do app
   - Usuário não precisa ir à loja

3. **Canais (Channels)**:
   - `production`: Updates para builds de produção
   - `preview`: Updates para builds de preview
   - `development`: Updates para builds de desenvolvimento

## 🎯 Deploy em Produção

### Workflow Completo de Deploy

#### 1. Preparação

```bash
# Certifique-se de estar na branch main/master
git checkout main
git pull origin main

# Instale dependências
npm install --legacy-peer-deps
```

#### 2. Atualizar Versão

Edite `app.json` e incremente a versão:

```json
{
  "expo": {
    "version": "1.0.2"  // Incremente de 1.0.1 para 1.0.2
  }
}
```

Commit a mudança:
```bash
git add app.json
git commit -m "chore: bump version to 1.0.2"
git push origin main
```

#### 3. Build de Produção

```bash
# Build para ambas as plataformas
eas build --platform all --profile production

# Ou builds separados
eas build --platform ios --profile production
eas build --platform android --profile production
```

#### 4. Testar o Build

```bash
# Baixe os builds gerados
# iOS: arquivo .ipa
# Android: arquivo .apk ou .aab

# Teste em dispositivos reais ou simuladores
# Valide todas as funcionalidades críticas
```

#### 5. Submeter para as Lojas

##### App Store (iOS)

**Opção 1: Submissão Automática**
```bash
eas build --platform ios --profile production --auto-submit
```

**Opção 2: Submissão Manual**
```bash
# Após o build, faça o submit
eas submit --platform ios --latest
```

Ou manualmente:
1. Baixe o arquivo .ipa do build
2. Acesse App Store Connect
3. Crie uma nova versão
4. Faça upload do .ipa usando Transporter ou Xcode
5. Preencha metadados e screenshots
6. Submeta para revisão

##### Google Play (Android)

**Opção 1: Submissão Automática**
```bash
eas build --platform android --profile production --auto-submit
```

**Opção 2: Submissão Manual**
```bash
# Após o build, faça o submit
eas submit --platform android --latest
```

Ou manualmente:
1. Baixe o arquivo .aab do build
2. Acesse Google Play Console
3. Vá para Production > Create new release
4. Faça upload do .aab
5. Preencha as notas de versão
6. Submeta para revisão

#### 6. Deploy de Updates OTA Pós-Lançamento

Após os apps estarem nas lojas, você pode enviar updates OTA:

```bash
# Update de produção
eas update --branch production --message "Fix: Correção crítica de bug"
```

## 📊 Gerenciamento de Versões

### Estratégia de Versionamento

Usamos **Semantic Versioning** (SemVer):

- **MAJOR.MINOR.PATCH** (ex: 1.0.1)
  - **MAJOR**: Mudanças incompatíveis ou refatoração grande
  - **MINOR**: Novas features compatíveis
  - **PATCH**: Correções de bugs

### Quando Incrementar Versão

#### PATCH (1.0.1 → 1.0.2)
- Correções de bugs
- Pequenas melhorias de performance
- Atualizações de texto

```bash
# Para updates PATCH, use OTA quando possível
eas update --branch production --message "Fix: bug no login"
```

#### MINOR (1.0.2 → 1.1.0)
- Novas features
- Melhorias significativas
- Atualizações de dependências não-nativas

```bash
# Para MINOR, considere novo build
eas build --platform all --profile production
```

#### MAJOR (1.1.0 → 2.0.0)
- Mudanças breaking
- Redesign completo
- Atualização de SDK do Expo
- Mudanças em dependências nativas

```bash
# MAJOR sempre requer novo build
eas build --platform all --profile production
```

### Build Numbers

O EAS incrementa automaticamente o build number quando `autoIncrement: true` está configurado no perfil de produção.

- iOS: `CFBundleVersion`
- Android: `versionCode`

## 🔄 Rollback e Recuperação

### Rollback de Update OTA

Se um update OTA causar problemas:

```bash
# 1. Ver histórico de updates
eas update:list --branch production

# 2. Voltar para um update anterior específico
eas update:republish --group [GROUP_ID]

# 3. Ou criar um novo update revertendo as mudanças
git revert [COMMIT_HASH]
git push origin main
eas update --branch production --message "Rollback: Revertendo mudança problemática"
```

### Rollback de Build

Se um build nas lojas causar problemas:

#### Curto Prazo
```bash
# Envie um OTA com fix imediato
eas update --branch production --message "Hotfix: Correção crítica"
```

#### Longo Prazo
```bash
# 1. Reverta as mudanças no código
git revert [COMMIT_HASH]
git push origin main

# 2. Incremente a versão
# Edite app.json: version: "1.0.3"

# 3. Faça novo build
eas build --platform all --profile production

# 4. Submeta para as lojas
eas submit --platform all --latest
```

### Recuperação de Desastres

#### Backup de Credenciais

```bash
# Sempre mantenha backup das credenciais
eas credentials

# Exporte certificados e keystores localmente
```

#### Documentação de Configuração

Mantenha documentado:
- Apple Team ID
- Google Play Service Account
- Bundle Identifiers
- Signing Certificates

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Build Falha com Erro de Credenciais

**Solução:**
```bash
eas credentials
# Reconfigure as credenciais manualmente
```

#### 2. Update OTA Não Aparece nos Dispositivos

**Verificar:**
```bash
# 1. Confirme que o update foi publicado
eas update:list --branch production

# 2. Verifique o canal do build
eas build:list --platform ios --profile production

# 3. Certifique-se de que channel e branch correspondem
```

**Forçar update no app:**
- Feche completamente o app
- Limpe o cache (se possível)
- Reabra o app com internet conectada

#### 3. Erro "RuntimeVersion Mismatch"

**Causa:** O runtimeVersion do update não corresponde ao do build

**Solução:**
```bash
# Certifique-se de que a versão no app.json é a mesma
# Ou faça um novo build se mudou dependências nativas
eas build --platform all --profile production
```

#### 4. Erro de NPM com Peer Dependencies

**Solução:** Já configurado no `eas.json`:
```json
"env": {
  "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
}
```

Se ainda tiver problemas:
```bash
npm install --legacy-peer-deps
```

#### 5. Build Timeout

**Solução:**
```bash
# Limpe o cache e tente novamente
eas build --platform [ios|android] --profile production --clear-cache
```

### Logs e Debugging

```bash
# Ver logs de build
eas build:list
eas build:view [BUILD_ID]

# Ver logs de update
eas update:list --branch production
eas update:view [UPDATE_ID]

# Ver configuração do projeto
eas project:info

# Diagnosticar problemas
eas diagnostics
```

## 📞 Suporte

### Recursos Úteis

- **Documentação EAS**: https://docs.expo.dev/eas/
- **Documentação OTA Updates**: https://docs.expo.dev/eas-update/introduction/
- **Fóruns Expo**: https://forums.expo.dev/
- **Discord Expo**: https://chat.expo.dev/

### Comandos Úteis de Referência

```bash
# Ver todas as opções de build
eas build --help

# Ver todas as opções de update
eas update --help

# Ver status do projeto
eas project:info

# Ver builds recentes
eas build:list --limit 10

# Ver updates recentes
eas update:list --branch production --limit 10

# Cancelar um build em andamento
eas build:cancel [BUILD_ID]

# Ver uso de recursos
eas account:view
```

## 🔐 Segurança e Melhores Práticas

### Segurança

1. **Nunca commite credenciais** no repositório
2. **Use secrets do EAS** para variáveis sensíveis (API keys, tokens)
3. **Mantenha credenciais em local seguro** (1Password, LastPass, etc.)
4. **Ative 2FA** na conta Expo
5. **Restrinja acesso ao projeto** apenas para membros da equipe

**Nota sobre Project ID e Update URL:** O Project ID no `app.json` (`ea5bb2c2-37c7-4f85-9a32-e9f31de5e4cf`) é uma informação pública e necessária para que o app se conecte ao servidor de updates do EAS. Não representa um risco de segurança pois:
- É apenas um identificador do projeto
- Acesso ao projeto requer autenticação no Expo
- Apenas contas autorizadas podem publicar updates
- É análogo a outros IDs públicos (bundle identifier, package name)

### Melhores Práticas

1. **Teste sempre antes de fazer deploy**
   - Use perfil `preview` para testes internos
   - Teste em dispositivos reais
   - Valide todas as features críticas

2. **Use branches e tags no Git**
   ```bash
   git tag -a v1.0.2 -m "Release version 1.0.2"
   git push origin v1.0.2
   ```

3. **Mantenha changelog atualizado**
   - Documente todas as mudanças
   - Facilite comunicação com usuários

4. **Monitore crashes e erros**
   - Integre com Sentry ou similar
   - Responda rapidamente a problemas

5. **Faça deploys incrementais**
   - OTA updates para correções rápidas
   - Builds nativos para mudanças maiores

6. **Tenha plano de rollback**
   - Sempre saiba como reverter
   - Mantenha versões estáveis disponíveis

## 📝 Checklist de Deploy

### Antes do Deploy

- [ ] Código revisado e aprovado
- [ ] Testes passando
- [ ] Versão atualizada em `app.json`
- [ ] Changelog atualizado
- [ ] Testado em dispositivos iOS e Android
- [ ] Screenshots atualizados (se necessário)
- [ ] Credenciais configuradas

### Durante o Deploy

- [ ] Build iniciado: `eas build --platform all --profile production`
- [ ] Build completado com sucesso
- [ ] Binários baixados e testados
- [ ] Submit para lojas: `eas submit --platform all --latest`

### Após o Deploy

- [ ] Verificar status nas lojas (App Store Connect / Play Console)
- [ ] Monitorar feedback inicial de usuários
- [ ] Verificar crashes e erros
- [ ] Tag criada no Git com versão
- [ ] Documentação atualizada
- [ ] Equipe notificada

---

**Última atualização:** Dezembro 2024  
**Versão do manual:** 1.0  
**Mantido por:** Equipe Timely
