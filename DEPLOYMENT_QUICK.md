# Guia Rápido de Deploy OTA - Timely App

Este é um guia de referência rápida para os comandos mais usados no processo de deploy. Para o manual completo, veja [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🚀 Comandos Essenciais

### Build de Produção

```bash
# Build completo (iOS + Android)
npm run build:prod

# Build apenas iOS
npm run build:ios

# Build apenas Android
npm run build:android
```

### Atualizações OTA

```bash
# Update de produção
npm run update:prod

# Update de preview (staging)
npm run update:preview

# Update de desenvolvimento
npm run update:dev
```

### Submissão para Lojas

```bash
# Submeter para ambas as lojas
npm run submit:all

# Submeter apenas iOS
npm run submit:ios

# Submeter apenas Android
npm run submit:android
```

## 📊 Workflow de Deploy Padrão

### Deploy Completo (Novo Build)

1. **Preparar Código**
   ```bash
   git checkout main
   git pull origin main
   npm install --legacy-peer-deps
   ```

2. **Atualizar Versão** (editar `app.json`)
   ```json
   "version": "1.0.2"
   ```

3. **Build e Submit**
   ```bash
   npm run build:prod
   # Aguarde build completar
   npm run submit:all
   ```

### Deploy Rápido (OTA Update)

1. **Fazer Mudanças no Código**
   ```bash
   # Fazer alterações JavaScript/TypeScript
   git add .
   git commit -m "fix: correção de bug"
   git push origin main
   ```

2. **Publicar Update**
   ```bash
   npm run update:prod
   ```

## ⚡ Comandos EAS Diretos

### Builds

```bash
# Build com auto-submit
eas build --platform all --profile production --auto-submit

# Build sem auto-submit
eas build --platform all --profile production

# Ver lista de builds
eas build:list

# Ver detalhes de um build
eas build:view [BUILD_ID]
```

### Updates

```bash
# Update com mensagem customizada
eas update --branch production --message "Fix: correção crítica"

# Update com mensagem automática
eas update --branch production --auto

# Ver histórico de updates
eas update:list --branch production

# Ver detalhes de um update
eas update:view [UPDATE_ID]
```

### Submit

```bash
# Submit último build
eas submit --platform all --latest

# Submit build específico
eas submit --platform ios --id [BUILD_ID]
```

## 🔄 Quando Usar Cada Tipo de Deploy

### Use OTA Update quando:
- ✅ Correção de bugs JavaScript
- ✅ Mudanças de UI/styling
- ✅ Atualizações de texto/traduções
- ✅ Mudanças de lógica de negócio
- ✅ Updates de assets (imagens, etc)

### Use Build Nativo quando:
- 🔨 Atualizar dependências nativas
- 🔨 Mudar permissões (Info.plist, AndroidManifest)
- 🔨 Atualizar Expo SDK
- 🔨 Adicionar novos plugins nativos
- 🔨 Mudanças em configuração nativa

## 📱 Ambientes

| Ambiente | Canal | Uso |
|----------|-------|-----|
| **Development** | `development` | Desenvolvimento local e testes |
| **Preview** | `preview` | Testes internos / staging |
| **Production** | `production` | Usuários finais nas lojas |

## 🐛 Troubleshooting Rápido

### Update OTA não aparece?

```bash
# 1. Verificar se update foi publicado
eas update:list --branch production

# 2. Forçar no dispositivo
# - Feche o app completamente
# - Limpe cache
# - Reabra com internet conectada
```

### Build falhou?

```bash
# Limpar cache e tentar novamente
eas build --platform [ios|android] --profile production --clear-cache
```

### Credenciais incorretas?

```bash
# Reconfigurar credenciais
eas credentials
```

## 🔐 Primeiro Uso

Se é a primeira vez fazendo deploy:

```bash
# 1. Login no EAS
eas login

# 2. Verificar projeto
eas project:info

# 3. Configurar credenciais (seguir prompts)
eas build --platform all --profile production
```

## 📞 Links Úteis

- [Manual Completo](./DEPLOYMENT.md)
- [Documentação EAS](https://docs.expo.dev/eas/)
- [Documentação OTA Updates](https://docs.expo.dev/eas-update/introduction/)
- [Fóruns Expo](https://forums.expo.dev/)

## 💡 Dicas

1. **Sempre teste em preview antes de produção**
   ```bash
   npm run build:preview
   npm run update:preview
   ```

2. **Mantenha controle de versões**
   ```bash
   git tag -a v1.0.2 -m "Release 1.0.2"
   git push origin v1.0.2
   ```

3. **Monitore builds em tempo real**
   - Acesse: https://expo.dev/accounts/mateuschaves/projects/timely-app/builds

4. **Use scripts npm para consistência**
   - Preferir `npm run build:prod` ao invés de comandos EAS diretos
   - Garante flags e configurações corretas

---

**Para mais detalhes:** Consulte [DEPLOYMENT.md](./DEPLOYMENT.md)
