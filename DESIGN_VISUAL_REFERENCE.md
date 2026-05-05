# EduResolve Design System - Visual Reference

## Color Palette

### Primary Brand Red
```
#dc2626 - Primary Brand Red (Buttons, Active States, Headers)
#b91c1c - Strong Red (Dark headings, Strong emphasis)
```

### Red Tints (Background/Accents)
```
#fef2f2 - Red 50 (Very light background)
#fee2e2 - Red 100 (Light background, hover states)
#fecaca - Red 200 (Medium tint)
#fca5a5 - Red 300 (Visible tint)
#f87171 - Red 400 (Strong tint)
#ef4444 - Red 500 (Medium shade)
#7f1d1d - Red 900 (Darkest)
#450a0a - Red 950 (Almost black)
```

### Surface Colors (Neutral)
```
#ffffff - White (Primary background)
#f7f7f8 - Surface Dim (Page background)
#f3f3f4 - Surface Low (Hover states)
#eeeeef - Surface Default (Slightly grey)
#e6e6e8 - Surface High
#e0e3e6 - Surface Highest
#e5e5e5 - Surface Line (Borders)
#d4d4d4 - Surface Ring (Focus states)
```

### Text Colors
```
#0a0a0a - Black Ink (Primary text)
#525252 - Mute (Secondary text)
#737373 - Soft (Tertiary text)
```

---

## Typography

### Display Large (32px, Bold)
```
Used for: Main page headers
Weight: 700
Line-height: 40px
Letter-spacing: -0.02em
```

### Display Medium (24px, Bold)
```
Used for: Section headers, large cards
Weight: 700
Line-height: 32px
Letter-spacing: -0.01em
```

### Title Large (20px, Semi-bold)
```
Used for: Card titles, subsections
Weight: 600
Line-height: 28px
```

### Body Large (16px, Regular)
```
Used for: Main content, body text
Weight: 400
Line-height: 24px
```

### Body Medium (14px, Regular)
```
Used for: Secondary content
Weight: 400
Line-height: 20px
```

### Label Medium (12px, Semi-bold)
```
Used for: Tags, badges, section labels
Weight: 600
Line-height: 16px
Letter-spacing: 0.05em
```

---

## Component Showcase

### Buttons

#### Primary Button
```html
<button class="btn-primary">
  Continue Learning
</button>
```
- Background: #dc2626 (Brand Red)
- Text: White
- Hover: #b91c1c
- Active: #7f1d1d
- Disabled: 50% opacity

#### Secondary Button
```html
<button class="btn-secondary">
  Cancel
</button>
```
- Background: White
- Border: 1px #e5e5e5
- Text: #0a0a0a
- Hover: #f7f7f8 background

### Cards

```html
<div class="card card-pad">
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</div>
```
- Background: White (#ffffff)
- Border: 1px #e5e5e5
- Border-radius: 0.5rem (8px)
- Padding: 1rem (via `.card-pad`)
- No shadow (clean, minimal)

### Chips/Tags

#### Primary Chip
```html
<span class="chip">
  Mathematics
</span>
```
- Background: #fef2f2 (Red 50)
- Text: #b91c1c (Red 700)
- Border-radius: 9999px (fully rounded)

#### Neutral Chip
```html
<span class="chip-neutral">
  2 hours
</span>
```
- Background: #f3f3f4 (Surface Low)
- Text: #525252 (Mute)

### Progress Bar

```html
<div class="w-full bg-surface-low rounded-full h-2.5 overflow-hidden">
  <div class="h-full rounded-full bg-brand-700" style="width: 65%"></div>
</div>
```
- Track: #f3f3f4 (Surface Low)
- Fill: #b91c1c (Brand Red 700)
- Height: 10px (h-2.5)
- Rounded: Fully rounded

### Eyebrow Label

```html
<p class="eyebrow">WEEKLY GOAL</p>
```
- Font-size: 12px
- Font-weight: 600
- Color: #525252 (Mute)
- Text-transform: uppercase
- Letter-spacing: 0.05em

---

## Spacing Scale

```
4px   (xs)  - Tight spacing
8px   (base)- Default unit
12px  (sm)  - Small spacing
16px  (md)  - Medium spacing
24px  (lg)  - Large spacing
32px  (xl)  - Extra large spacing
```

Used in:
- Padding: `p-1` (4px), `p-3` (12px), `p-4` (16px), `p-6` (24px)
- Margin: `m-1`, `m-2`, `m-4`, `m-6`
- Gap: `gap-1`, `gap-2`, `gap-3`, `gap-4`
- Space-y: `space-y-2` (vertical gaps between children)

---

## Border Radius Scale

```
sm: 2px (0.125rem)   - Subtle curves
DEFAULT: 4px (0.25rem) - Standard radius
md: 6px (0.375rem)   - Medium radius
lg: 8px (0.5rem)     - Larger radius
xl: 12px (0.75rem)   - Extra large radius
2xl: 16px (1rem)     - Large radius
full: 9999px         - Fully rounded (circles, pills)
```

---

## Component States

### Focus State
```
Border-color: #dc2626 (Brand Red)
Ring: 1px solid #dc2626
```

### Hover State
```
Background: #f7f7f8 (Surface Dim)
Color: #0a0a0a (Black Ink)
```

### Active/Selected State
```
Background: #fef2f2 (Red 50)
Color: #b91c1c (Red 700)
Border: #dc2626 (Brand Red)
```

### Disabled State
```
Opacity: 50%
Cursor: not-allowed
```

---

## Layout Grid

### Desktop (> 768px)
- Max-width: 640px center-aligned
- Container padding: 16px (px-4)
- Gap between cards: 12px (gap-3)

### Mobile (< 768px)
- Full width
- Side padding: 16px (px-4)
- Bottom navigation: 72px fixed height
- Safe area padding

---

## Accessibility

- **Color Contrast**: All text meets WCAG AA standards (7:1 ratio for body text)
- **Font Size**: Minimum 14px for body text, 12px for labels
- **Touch Targets**: Minimum 44px height for buttons and links
- **Focus Indicators**: Clear 1px ring with brand red color
- **Semantic HTML**: Proper heading hierarchy (h1, h2, h3...)
- **Icon Labels**: All icon buttons have aria-labels

---

## Animation & Transitions

### Micro-interactions
```css
transition: all 0.2s ease-in-out;  /* Standard transition */
transition: background-color 0.3s ease; /* Smooth hover */
```

### Progress Bar
```css
transition: width 0.3s ease-in-out; /* Progress fill animation */
```

### Focus
```css
transition: all 0.15s ease; /* Quick focus highlight */
```

---

## Dark Mode (Future)

The design system is built to support dark mode. Future implementation:
```
Primary background: #1a1a1a
Secondary background: #2d2d2d
Text: #ffffff
Accents: #ff4444 (lighter red for contrast)
```

---

## Icon Usage

### Recommended Icons (Emoji)
- 🏠 Home/Dashboard
- 📚 Learn/Books
- ✏️ Quiz/Write
- 📝 Tests/Documents
- ❓ Doubts/Questions
- 🔖 Bookmarks/Save
- ⭐ Ratings/Badges
- 🔥 Streak/Fire
- 📊 Progress/Analytics
- 🎯 Goals/Target
- 📖 Lessons/Content
- 👥 Teams/Groups

---

## Quick Implementation Tips

1. **Use CSS Variables**: Reference design tokens instead of hardcoding colors
2. **Compose Utilities**: Combine Tailwind classes instead of writing custom CSS
3. **Maintain Consistency**: Use `.card`, `.btn-primary`, `.chip` classes
4. **Test Responsiveness**: Always check mobile view at 375px width
5. **Verify Contrast**: Use WCAG checker for color combinations
6. **Animate Subtly**: Keep transitions under 300ms for snappy UI

---

## Figma Colors (for design tools)

```
Primary Red: #dc2626
Strong Red: #b91c1c
Light Red: #fef2f2
White: #ffffff
Black: #0a0a0a
Muted: #525252
Border: #e5e5e5
```

---

## Dependencies

- **Font**: Inter (via Google Fonts - already imported in styles.css)
- **Framework**: Angular with Tailwind CSS
- **Icons**: Using Unicode emojis (no external icon library needed)
- **Colors**: CSS variables in `:root` selector

---

For detailed implementation guide, see **STUDYMENTOR_DESIGN_GUIDE.md**
