# 🎨 EduResolve Visual & Component Reference

## Color Reference Guide

### Primary Colors
```
Primary Blue
Hex: #1e40af
RGB: (30, 64, 175)
Usage: Main brand, primary buttons, active states
CSS Variable: --primary-blue

Secondary Blue
Hex: #3b82f6
RGB: (59, 130, 246)
Usage: Hover states, interactive elements, highlights
CSS Variable: --secondary-blue

Light Blue
Hex: #dbeafe
RGB: (219, 238, 254)
Usage: Backgrounds, badges, accents
CSS Variable: --light-blue
```

### Success Colors
```
Primary Green
Hex: #059669
RGB: (5, 150, 105)
Usage: Success messages, resolved status, confirmations
CSS Variable: --primary-green

Secondary Green
Hex: #10b981
RGB: (16, 185, 129)
Usage: Alternative green, accents
CSS Variable: --secondary-green

Light Green
Hex: #d1fae5
RGB: (209, 250, 229)
Usage: Success backgrounds, light indicators
CSS Variable: --light-green
```

### Neutral Colors
```
Neutral 50:   #f9fafb (Lightest background)
Neutral 100:  #f3f4f6 (Light background)
Neutral 200:  #e5e7eb (Borders, dividers)
Neutral 300:  #d1d5db (Secondary borders)
Neutral 600:  #4b5563 (Secondary text)
Neutral 700:  #374151 (Tertiary text)
Neutral 900:  #111827 (Primary text)
```

### Status Colors
```
Warning/Amber: #f59e0b (In Progress, Pending)
Danger/Red:    #ef4444 (High Priority, Errors)
```

---

## Button Styles

### Primary Button
```
Background: var(--primary-blue)
Text: White
Padding: 0.625rem 1.25rem
Border Radius: 0.5rem
Font Weight: 500
Hover: --secondary-blue background + shadow-md
Example: "Report New Issue", "Submit"
```

### Secondary Button
```
Background: var(--neutral-100)
Text: var(--primary-blue)
Border: 1px solid var(--neutral-200)
Padding: 0.625rem 1.25rem
Border Radius: 0.5rem
Hover: Darker background
Example: "Cancel", "Filter", "Edit"
```

### Success Button
```
Background: var(--primary-green)
Text: White
Padding: 0.625rem 1.25rem
Border Radius: 0.5rem
Hover: --secondary-green background + shadow
Example: "Confirm", "Approve"
```

### Small Variant
```
All buttons have .btn-small variant
Padding: 0.5rem 1rem
Font Size: 0.875rem
Example: Icon buttons, secondary actions
```

---

## Badge Styles

### Status Badges
```
Pending:      Light blue background, blue text
In Progress:  Amber background, amber text
Resolved:     Light green background, green text
```

### Category Badges
```
Background: Light blue
Text: Primary blue
Padding: 0.375rem 0.875rem
Border Radius: 4px
Font Size: 0.8rem
```

### Priority Indicator
```
Animated dot (●) on right side of card
High:   Red (#ef4444) - animated pulse
Medium: Amber (#f59e0b)
Low:    Blue (#3b82f6)
Animation: Pulse effect every 2 seconds
```

---

## Card Components

### Standard Card
```
Background: White
Border: 1px solid #e5e7eb
Border Radius: 12px
Padding: 1.5rem
Box Shadow: 0 1px 2px rgba(0,0,0,0.05)
Hover: 
  - Shadow increases to shadow-md
  - Transform: translateY(-2px)
  - Transition: 0.3s ease
```

### Issue Card (Student)
```
Extends: Standard Card
Left Border: 4px solid primary blue
On Hover:
  - Left border color changes to green
  - Slight translate effect
Contains:
  - Title (bold)
  - Category (text-muted, small)
  - Status badge
  - Response count
  - View Details & Message buttons
```

### Resource Card (Knowledge Base)
```
Extends: Standard Card
Contains:
  - Title
  - Description
  - Tags
  - Metadata (views, helpfulness, read time)
  - Read More button
Type Badge: Light blue background
```

---

## Form Elements

### Text Inputs
```
Border: 1px solid #d1d5db
Border Radius: 0.5rem
Padding: 0.75rem
Font Size: 0.95rem
Focus State:
  - Border color: Primary blue
  - Box shadow: 0 0 0 3px rgba(30, 64, 175, 0.1)
```

### Textareas
```
Min Height: 120px
Resize: vertical
Border: 1px solid #d1d5db
Padding: 0.75rem
Same focus state as inputs
```

### Select Elements
```
Same styling as inputs
Border: 1px solid #d1d5db
Padding: 0.75rem
Focus: Same as inputs
```

### Form Labels
```
Font Weight: 600
Font Size: 0.95rem
Color: #111827
Margin Bottom: 0.5rem
```

---

## Typography

### Heading Hierarchy
```
H1: font-size: 2rem, font-weight: 700
    letter-spacing: -0.02em
    Example: Page titles, main hero text

H2: font-size: 1.5rem, font-weight: 600
    letter-spacing: -0.01em
    Example: Section titles

H3: font-size: 1.25rem, font-weight: 600
    Example: Card titles, subsections

Body: font-size: 0.95rem, font-weight: 400/500
      line-height: 1.6
      Example: Main content text

Small: font-size: 0.85rem, color: text-muted
       Example: Labels, descriptions
```

### Text Utility Classes
```
.text-center        → text-align: center
.text-muted         → color: #4b5563
.text-primary       → color: #1e40af
.text-success       → color: #059669
```

---

## Spacing Scale

### Gaps
```
.gap-1 → 0.5rem (8px)
.gap-2 → 1rem (16px)
.gap-3 → 1.5rem (24px)
.gap-4 → 2rem (32px)
```

### Margins
```
.mt-1/.mb-1 → 0.5rem
.mt-2/.mb-2 → 1rem
.mt-3/.mb-3 → 1.5rem
.mt-4/.mb-4 → 2rem
```

### Padding
```
.p-2 → 1rem (16px)
.p-3 → 1.5rem (24px)
.p-4 → 2rem (32px)
```

---

## Icon Usage (Lucide React)

### Import Pattern
```javascript
import { IconName } from 'lucide-react';

// Usage
<IconName size={20} color="currentColor" />
```

### Common Icons by Section

**Navigation Icons**
- `LayoutDashboard` - Dashboard
- `AlertCircle` - Issues
- `CheckCircle` - Resolved
- `Calendar` - Meetings
- `BookOpen` - Resources
- `Users` - Forums
- `BarChart3` - Analytics
- `MessageSquare` - Communication

**Action Icons**
- `Plus` - Add/Create
- `Edit` - Edit
- `X` - Close/Delete
- `Send` - Submit/Send
- `Search` - Search
- `Filter` - Filter
- `Download` - Export
- `Menu` - Menu

**Status Icons**
- `CheckCircle` - Success
- `AlertCircle` - Warning
- `Clock` - Pending
- `TrendingUp` - Progress
- `Bell` - Notifications

---

## Modal Dialog

### Structure
```
Modal Container:
├── Modal Header
│   ├── Title (h2)
│   └── Close button (X)
├── Modal Body
│   └── Form fields
└── Modal Footer
    ├── Cancel button
    └── Submit button
```

### Styling
```
Background: White
Border Radius: 12px
Max Width: 500px
Box Shadow: Large shadow for depth
Z-index: 1000
Overlay: rgba(0,0,0,0.5) semi-transparent
```

---

## Table Structure

### Table Header
```
Background: #f3f4f6
Font Weight: 600
Color: #374151
Border Bottom: 1px solid #e5e7eb
Padding: 1rem 1.5rem
Font Size: 0.9rem
```

### Table Row
```
Border Bottom: 1px solid #e5e7eb
Padding: 1rem 1.5rem
Hover Background: #f3f4f6
Transition: 0.3s ease
Cursor: pointer
```

### Mobile Table (Card View)
```
Converts table rows to cards
Each column displayed on separate line
Label shown before value (CSS pseudo-element)
Maintains data hierarchy
```

---

## Navigation Sidebar

### Desktop View
```
Width: 250px
Fixed position
Top: 80px (below header)
Height: calc(100vh - 80px)
Overflow-y: auto
Border Right: 1px solid #e5e7eb
Background: White
```

### Mobile View
```
Width: 70px
Shows icons only
Text hidden (display: none)
Buttons centered
Compact layout
```

### Navigation Items
```
Padding: 0.75rem 1rem
Margin: 0.25rem 0.5rem
Border Radius: 0.5rem
Color: #4b5563
Hover: Light blue background + blue text
Active:
  - Light blue background
  - Blue text
  - Left border: 3px solid blue
  - Font weight: 600
```

---

## Responsive Breakpoints

### Media Queries
```css
/* Tablets and down */
@media (max-width: 1023px) { ... }

/* Tablets */
@media (max-width: 768px) { ... }

/* Small mobile */
@media (max-width: 480px) { ... }
```

### Layout Changes

**Desktop (1024px+)**
```
Sidebar: 250px fixed
Main content: margin-left 250px
Navigation: Full text visible
Grid: 2-3 columns
```

**Tablet (768px-1023px)**
```
Sidebar: 70px fixed (icons only)
Main content: margin-left 70px
Navigation: Icons only
Grid: 2 columns or 1
```

**Mobile (<768px)**
```
Sidebar: 70px fixed (icons only)
Navigation: Icons only
Content: Full width with left margin
Grid: 1 column
Tables: Card layout
Font: Slightly reduced
```

---

## Shadow System

### Shadow Sizes
```
Shadow Small (sm):
  0 1px 2px 0 rgba(0, 0, 0, 0.05)

Shadow Medium (md):
  0 4px 6px -1px rgba(0, 0, 0, 0.1)

Shadow Large (lg):
  0 10px 15px -3px rgba(0, 0, 0, 0.1)
```

### Usage
```
Cards: shadow-sm (default), shadow-md (hover)
Modals: shadow-lg
Navigation: shadow-sm
Header: shadow-sm
```

---

## Border Radius

```
Small (sm):  0.375rem (6px)
             Buttons, small elements

Medium (md): 0.5rem (8px)
             Inputs, small cards, badges

Large (lg):  0.75rem (12px)
             Main cards, modals
```

---

## Transitions & Animations

### Default Transition
```css
transition: all 0.3s ease;
```

### Specific Use Cases
```
Hover effects: 0.3s ease
Color changes: 0.2s ease
Open/close: 0.3s ease
Pulse animation: 2s infinite
```

---

## Component Composition Example

### Issue Card
```jsx
<div className="card issue-card">
  <div className="issue-header flex-between">
    <h3>Issue Title</h3>
    <span className="priority-badge">●</span>
  </div>
  <p className="text-muted">Category</p>
  <div className="issue-details gap-2">
    <span className="badge badge-primary">Pending</span>
    <span className="text-muted">Updated: Date</span>
  </div>
  <button className="btn btn-secondary">View Details</button>
</div>
```

---

## Accessibility Features

### Color Contrast
```
Text on primary blue: White (WCAG AAA)
Text on neutral: Dark gray (WCAG AAA)
Button focus: 3px blue outline ring
Links: Underlined, distinct color
```

### Touch Targets
```
Minimum size: 44x44px
Spacing: At least 8px between targets
Mobile buttons: Full width when possible
```

### Semantic HTML
```
<header>, <nav>, <main>, <aside>
<button> for clickable elements
<label> for form inputs
<h1-h6> for headings in order
<p> for paragraphs
```

---

## Color Palette Visual Reference

```
BLUES                    GREENS                   NEUTRALS
Primary: #1e40af        Primary: #059669         50:  #f9fafb
Secondary: #3b82f6      Secondary: #10b981       100: #f3f4f6
Light: #dbeafe          Light: #d1fae5           200: #e5e7eb
                                                 300: #d1d5db
                                                 600: #4b5563
                                                 700: #374151
                                                 900: #111827

STATUS COLORS
Warning: #f59e0b
Danger: #ef4444
Success: #10b981
```

---

## Quick Reference Commands

### CSS Variables Access
```css
background: var(--primary-blue);
color: var(--white);
padding: var(--radius-lg);
box-shadow: var(--shadow-md);
transition: var(--transition);
```

### Utility Classes
```jsx
<div className="flex gap-2 mb-3">
  <span className="badge badge-primary">Tag</span>
  <span className="text-muted">Description</span>
</div>
```

### Common Patterns
```jsx
// Flex between
<div className="flex-between">
  <h2>Title</h2>
  <button>Action</button>
</div>

// Grid
<div className="grid grid-2 gap-3">
  {items.map(item => <div>{item}</div>)}
</div>

// Card with content
<div className="card p-3">
  <h3>Title</h3>
  <p className="text-muted">Description</p>
</div>
```

---

This visual reference provides all the design tokens and component specifications needed to maintain consistency throughout the EduResolve application.

For more details, see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) and [globals.css](src/styles/globals.css)
