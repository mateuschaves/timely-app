# GitHub Actions Workflows

## Tests Workflow

O workflow `tests.yml` executa os testes unitários automaticamente quando:

- Um Pull Request é aberto (`opened`)
- Um Pull Request é atualizado (`synchronize`)
- Um Pull Request é reaberto (`reopened`)
- Push é feito nas branches `main` ou `develop`

### O que o workflow faz:

1. **Checkout do código** - Baixa o código do repositório
2. **Setup Node.js** - Configura Node.js 20.x com cache do npm
3. **Instala dependências** - Executa `npm ci --legacy-peer-deps`
4. **Executa testes** - Roda `npm run test:coverage:ci` com cobertura
5. **Upload para Codecov** (opcional) - Se o token `CODECOV_TOKEN` estiver configurado
6. **Upload de artefato** - Salva o relatório de cobertura como artefato
7. **Comenta no PR** - Adiciona um comentário no PR com o resumo da cobertura

### Configuração opcional:

Para habilitar o upload para Codecov:

1. Acesse https://codecov.io
2. Conecte seu repositório
3. Copie o token
4. No GitHub, vá em Settings > Secrets and variables > Actions
5. Adicione um novo secret chamado `CODECOV_TOKEN` com o token copiado

### Visualizando resultados:

- Os resultados dos testes aparecem na aba "Actions" do GitHub
- O relatório de cobertura pode ser baixado como artefato
- Se configurado, a cobertura aparece no Codecov
- Um comentário é adicionado automaticamente no PR com o resumo
