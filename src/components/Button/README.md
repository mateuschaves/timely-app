# Button Component

A reusable Button component with theme-aware styling, loading states, and support for destructive actions.

## Features

- ✨ **Theme Integration**: Automatically adapts to light/dark mode using the app's ThemeContext
- 🔄 **Loading States**: Built-in loading indicator with automatic interaction prevention
- ⚠️ **Destructive Actions**: Special styling for delete/destructive operations
- 🎨 **Styled Components**: Uses styled-components for consistent styling
- 📱 **TouchableOpacity**: Extends TouchableOpacityProps for full compatibility
- 🔒 **Type Safe**: Full TypeScript support with proper interfaces

## Usage

### Basic Button

```tsx
import { Button } from '@/components/Button';

<Button 
  title="Click Me" 
  onPress={() => console.log('Button pressed')} 
/>
```

### Loading State

Shows a spinner, hides text, and prevents interaction:

```tsx
<Button 
  title="Save" 
  isLoading={isSaving}
  onPress={handleSave} 
/>
```

### Destructive Action

Applies red styling for delete/destructive operations:

```tsx
<Button 
  title="Delete Account" 
  destructive
  onPress={handleDelete} 
/>
```

### Disabled State

```tsx
<Button 
  title="Submit" 
  disabled={!isFormValid}
  onPress={handleSubmit} 
/>
```

### Combined States

```tsx
<Button 
  title="Deleting..." 
  destructive
  isLoading
  onPress={handleDelete} 
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | ✅ Yes | - | The text displayed in the button |
| `isLoading` | `boolean` | No | `false` | Shows loading indicator, hides text, disables interaction |
| `destructive` | `boolean` | No | `false` | Applies red styling for destructive actions |
| `disabled` | `boolean` | No | `false` | Disables the button |
| ...TouchableOpacityProps | | No | - | All TouchableOpacity props are supported |

## Theme Colors

The Button component uses the following theme colors:

- **Default Background**: `theme.action.primary` (black in light mode, white in dark mode)
- **Destructive Background**: `theme.action.danger` (red #dc3545 in both modes)
- **Text Color**: `theme.text.inverse` (white in light mode, black in dark mode)
- **Loading Indicator**: `theme.text.inverse`

## Styling

The button automatically:
- Adapts to the current theme (light/dark mode)
- Applies 60% opacity when disabled or loading
- Has a height of 50px
- Uses medium border radius (8px)
- Takes full width of its container
- Has an active opacity of 0.7 on press

## Examples

### Form Submission

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await submitForm();
  } finally {
    setIsSubmitting(false);
  }
};

<Button 
  title="Submit Form"
  isLoading={isSubmitting}
  onPress={handleSubmit}
/>
```

### Delete Confirmation

```tsx
const handleDelete = () => {
  Alert.alert(
    'Confirm Delete',
    'Are you sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          await deleteItem();
        }
      }
    ]
  );
};

<Button 
  title="Delete Item"
  destructive
  onPress={handleDelete}
/>
```

## Testing

The component includes comprehensive tests covering:
- Basic rendering
- Press events
- Loading states
- Disabled states
- Destructive styling
- Prop forwarding

Run tests with:
```bash
npm test -- src/components/Button/__tests__/Button.test.tsx
```

## File Structure

```
src/components/Button/
├── index.tsx           # Main component implementation
├── styles.ts           # Styled components
├── types.ts            # TypeScript interfaces
├── README.md           # This file
└── __tests__/
    └── Button.test.tsx # Test suite
```
