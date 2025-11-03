# UI Components

Reusable shadcn/ui components styled for dark mode.

## Components

### Input
```tsx
import { Input } from '@/app/components/ui/input'

<Input 
  type="text" 
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Label
```tsx
import { Label } from '@/app/components/ui/label'

<Label htmlFor="input-id">Label Text</Label>
```

### Button
```tsx
import { Button } from '@/app/components/ui/button'

<Button variant="default" size="lg">Click me</Button>
// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon
```

### Checkbox
```tsx
import { Checkbox } from '@/app/components/ui/checkbox'
import { Label } from '@/app/components/ui/label'

<div className="flex items-center space-x-2">
  <Checkbox 
    id="check" 
    checked={checked}
    onCheckedChange={(checked) => setChecked(checked === true)}
  />
  <Label htmlFor="check">Accept terms</Label>
</div>
```

### Select
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Textarea
```tsx
import { Textarea } from '@/app/components/ui/textarea'

<Textarea 
  placeholder="Enter message"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### FormField (Wrapper)
```tsx
import { FormField } from '@/app/components/ui/form'
import { Input } from '@/app/components/ui/input'

<FormField 
  label="Email" 
  error={errors.email}
  helperText="Enter your email address"
  required
>
  <Input type="email" />
</FormField>
```

## Dark Mode Styling

All components are pre-styled for dark mode with:
- Background: `#1a1a1f`
- Card/Input: `#2d2d35`
- Borders: `#3a3a44`
- Text: `#ffffff` / `#a0a0a8`
- Primary: `#8b5cf6` (purple)


