# EduResolve Design System

## Overview
EduResolve follows a modern design system inspired by Material Design and Fluent UI, with a professional yet approachable aesthetic suitable for an educational platform.

## Color Palette

### Primary Colors
- **Primary Blue** (`#1e40af`): Main brand color, primary actions, active states
- **Secondary Blue** (`#3b82f6`): Interactive elements, highlights, hover states
- **Light Blue** (`#dbeafe`): Background accents, badges, light surfaces

### Success Colors
- **Primary Green** (`#059669`): Success messages, resolved status, affirmative actions
- **Secondary Green** (`#10b981`): Alternative green, success accents
- **Light Green** (`#d1fae5`): Success backgrounds, light indicators

### Neutral Colors
- **Neutral 50** (`#f9fafb`): Lightest background
- **Neutral 100** (`#f3f4f6`): Light backgrounds, cards
- **Neutral 200** (`#e5e7eb`): Borders, dividers
- **Neutral 300** (`#d1d5db`): Secondary borders
- **Neutral 600** (`#4b5563`): Secondary text
- **Neutral 700** (`#374151`): Tertiary text
- **Neutral 900** (`#111827`): Primary text

### Status Colors
- **Warning**: `#f59e0b` (Amber)
- **Danger**: `#ef4444` (Red)

## Typography

### Hierarchy
- **H1**: 2rem, 700 weight, -0.02em letter-spacing
- **H2**: 1.5rem, 600 weight, -0.01em letter-spacing
- **H3**: 1.25rem, 600 weight
- **Body**: 0.95rem, 500 weight (for labels)
- **Small**: 0.85rem, 400 weight (for descriptions)

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

## Spacing Scale

```
0.5rem (8px)    - gap-1
1rem (16px)     - gap-2
1.5rem (24px)   - gap-3
2rem (32px)     - gap-4
```

## Border Radius

- **Small**: 0.375rem (6px) - buttons, small elements
- **Medium**: 0.5rem (8px) - inputs, small cards
- **Large**: 0.75rem (12px) - cards, modals

## Shadows

- **Small**: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- **Medium**: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- **Large**: 0 10px 15px -3px rgba(0, 0, 0, 0.1)

## Component Patterns

### Buttons
- **Primary**: Blue background, white text
- **Secondary**: Gray background with border
- **Success**: Green background, white text
- **Sizes**: Default (0.625rem 1.25rem), Small (0.5rem 1rem)

### Cards
- White background, subtle shadow, border
- Rounded corners (large radius)
- Hover: Slight lift (translateY -2px), increased shadow

### Status Badges
- **Primary**: Light blue background
- **Success**: Light green background
- **Warning**: Amber background
- **Danger**: Red background

### Form Elements
- Rounded medium corners
- Light gray borders
- Blue focus state with subtle shadow
- Proper padding (0.75rem)

## Responsive Breakpoints

### Media Query Patterns
```css
/* Large screens - 1024px and up */
@media (min-width: 1024px) { ... }

/* Tablets - 768px to 1023px */
@media (max-width: 1023px) { ... }

/* Mobile - 767px and below */
@media (max-width: 768px) { ... }

/* Small mobile - 480px and below */
@media (max-width: 480px) { ... }
```

### Layout Adjustments

**Desktop**
- Sidebar navigation (250px fixed)
- 2-3 column grid layouts
- Full-width content area

**Tablet**
- Sidebar navigation (70px collapsed)
- 2 column grid layouts where possible
- Adjusted font sizes

**Mobile**
- Icon-only sidebar (70px)
- Single column layouts
- Reduced padding and gaps
- Touch-friendly button sizes (minimum 44x44px)

## Animation & Transitions

### Default Transition
```css
transition: all 0.3s ease;
```

### Specific Transitions
- Hover states: 0.3s ease
- Loading states: 1s ease-in-out
- Open/close animations: 0.2s ease

### Motion Principles
- Smooth, not jerky
- Provides visual feedback
- Doesn't distract from content
- Respects `prefers-reduced-motion`

## Accessibility Guidelines

### Color Contrast
- Minimum WCAG AA (4.5:1 for text)
- Icons paired with text labels
- Color not sole means of communication

### Interactive Elements
- Minimum touch target: 44x44px
- Clear focus states (outline or highlight)
- Keyboard navigation support
- Semantic HTML

### Content
- Descriptive alt text for images
- Proper heading hierarchy
- Meaningful link text
- Clear error messages

## Icon Library

**Source**: Lucide React

### Usage
```jsx
import { IconName } from 'lucide-react';
<IconName size={20} color="currentColor" />
```

### Common Icons
- Navigation: `LayoutDashboard`, `Menu`, `X`
- Status: `AlertCircle`, `CheckCircle`, `Clock`
- Actions: `Plus`, `Edit`, `Delete`, `Send`
- Communication: `MessageSquare`, `Mail`, `Phone`
- Media: `Image`, `Video`, `FileText`
- Utilities: `Search`, `Filter`, `Settings`

## Component Examples

### Button Usage
```jsx
// Primary
<button className="btn btn-primary">Action</button>

// Secondary
<button className="btn btn-secondary">Action</button>

// Success
<button className="btn btn-success">Confirm</button>

// Small variant
<button className="btn btn-primary btn-small">Small</button>
```

### Card Usage
```jsx
<div className="card">
  <h3>Title</h3>
  <p>Content</p>
</div>
```

### Utility Classes
```jsx
<div className="flex gap-2 mb-3">
  <span className="badge badge-primary">Tag</span>
  <span className="text-muted">Description</span>
</div>
```

## Future Enhancements

- Dark mode support with CSS variables
- Animation library integration
- Extended icon sets
- Custom theme builder
- Storybook integration for component library
- A11y audit and improvements
