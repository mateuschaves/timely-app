# Button Component

Um componente de botão reutilizável para o aplicativo Timely com suporte a tema claro/escuro, estado de carregamento e variante destrutiva.

## Características

- ✅ **Suporte a Tema**: Adapta-se automaticamente aos temas claro e escuro
- ✅ **Estado de Carregamento**: Exibe um indicador de atividade e desabilita o botão durante o carregamento para evitar cliques duplos
- ✅ **Variante Destrutiva**: Botão vermelho para ações de exclusão/remoção

## Uso Básico

```tsx
import { Button } from '@/components';

function MyScreen() {
  return (
    <Button onPress={() => console.log('Clicado!')}>
      Pressione-me
    </Button>
  );
}
```

## Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `children` | `string` | - | Texto a ser exibido no botão (obrigatório) |
| `isLoading` | `boolean` | `false` | Exibe indicador de carregamento e desabilita o botão |
| `destructive` | `boolean` | `false` | Define o botão como vermelho para ações destrutivas |
| `disabled` | `boolean` | `false` | Desabilita o botão |
| `onPress` | `() => void` | - | Função chamada quando o botão é pressionado |
| ...rest | `TouchableOpacityProps` | - | Todas as outras props do TouchableOpacity |

## Exemplos

### Botão com Estado de Carregamento

```tsx
import { Button } from '@/components';
import { useState } from 'react';

function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await loginApi();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button isLoading={isLoading} onPress={handleLogin}>
      Entrar
    </Button>
  );
}
```

### Botão Destrutivo (Exclusão)

```tsx
import { Button } from '@/components';

function DeleteAccountScreen() {
  const handleDelete = async () => {
    // Lógica de exclusão
    await deleteAccount();
  };

  return (
    <Button destructive onPress={handleDelete}>
      Excluir Conta
    </Button>
  );
}
```

### Botão Destrutivo com Carregamento

```tsx
import { Button } from '@/components';
import { useState } from 'react';

function DeleteItemScreen() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteItem();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      destructive 
      isLoading={isDeleting} 
      onPress={handleDelete}
    >
      Excluir Item
    </Button>
  );
}
```

### Botão Desabilitado

```tsx
import { Button } from '@/components';

function FormScreen() {
  const [isFormValid, setIsFormValid] = useState(false);

  return (
    <Button 
      disabled={!isFormValid} 
      onPress={handleSubmit}
    >
      Enviar
    </Button>
  );
}
```

## Temas

O componente Button utiliza automaticamente as cores do tema ativo do aplicativo:

- **Light Mode**: Fundo preto, texto branco
- **Dark Mode**: Fundo branco, texto preto
- **Destructive**: Fundo vermelho (#dc3545) em ambos os temas

## Testes

O componente possui testes abrangentes cobrindo:
- Renderização básica
- Interação com onPress
- Estado desabilitado
- Estado de carregamento
- Variante destrutiva
- Passagem de props adicionais

Execute os testes com:
```bash
npm test src/components/Button/__tests__/Button.test.tsx
```
