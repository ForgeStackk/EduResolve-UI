# EduResolve Setup Guide

## Quick Start

### 1. Prerequisites
Make sure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager

### 2. Installation Steps

```bash
# Navigate to the project directory
cd EduResolve

# Install all dependencies
npm install

# Start the development server
npm run dev
```

The application will automatically open at `http://localhost:3000`

## Development Workflow

### Running the Development Server
```bash
npm run dev
```
- Hot reload enabled for instant feedback
- Opens in your default browser
- Press `q` to quit the server

### Building for Production
```bash
npm run build
```
- Optimized minified build
- Output in the `dist/` folder
- Ready for deployment

### Preview Production Build
```bash
npm run preview
```
- Test the production build locally
- Useful before deploying

## Project Structure Overview

```
EduResolve/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components (Dashboard, Login, etc.)
│   ├── context/         # React Context for state management
│   ├── styles/          # Global styles and CSS variables
│   ├── App.jsx          # Main app component
│   └── index.jsx        # Entry point
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies and scripts
├── README.md            # Main documentation
├── DESIGN_SYSTEM.md     # Design guidelines
└── SETUP_GUIDE.md       # This file
```

## Key Features Demo

### 1. Student Dashboard
- **URL Path**: Auto-redirects after login
- **Features**:
  - Issue reporting with modal form
  - Status tracking cards
  - Upcoming meetings widget
  - Progress analytics
  - Learning resources sidebar

### 2. Teacher Dashboard
- **URL Path**: Auto-redirects after login
- **Features**:
  - Issue management table with filtering
  - Analytics cards with trending data
  - Common concerns chart
  - Communication panel for messaging
  - Quick action buttons

### 3. Knowledge Base
- **Access**: Available to all users
- **Features**:
  - Full-text search
  - Category filtering
  - Tag-based navigation
  - FAQ accordion
  - AI-powered search hint

## How to Test

### 1. Login as Student
1. Click "Login as Student" button on welcome screen
2. View student dashboard with all features
3. Try:
   - Click "Report New Issue" to open modal
   - Click issue cards to see details
   - Hover over cards for interactive states

### 2. Login as Teacher
1. Logout first (use header button)
2. Click "Login as Teacher" button
3. View teacher dashboard with analytics
4. Try:
   - Click on student issues to open chat panel
   - Use filter and search functionality
   - Review analytics cards and charts

### 3. Knowledge Base
1. Click on "Resources" or similar in navigation
2. Search for topics
3. Filter by category
4. Try clicking tags to filter
5. Expand FAQ items

## Customization Guide

### Change App Title
Edit `src/App.jsx` and `index.html`:
```html
<title>Your App Name - Academic Support Platform</title>
```

### Update Brand Colors
Edit `src/styles/globals.css`:
```css
:root {
  --primary-blue: #1e40af;      /* Change this */
  --primary-green: #059669;     /* And this */
  /* ... other colors */
}
```

### Add New Navigation Items
Edit `src/components/Navigation.jsx`:
```javascript
const studentNavigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  // Add new items here
];
```

### Modify Dashboard Sections
Edit the relevant page file:
- Student: `src/pages/StudentDashboard.jsx`
- Teacher: `src/pages/TeacherDashboard.jsx`
- Knowledge Base: `src/pages/KnowledgeBase.jsx`

## Common Tasks

### Update User Information
Located in `src/context/AuthContext.jsx`:
```javascript
const user = {
  id: '1',
  name: 'Your Name',
  email: 'your.email@school.edu',
  avatar: '👤',
};
```

### Add Mock Data
Edit the data arrays in page components:
```javascript
const issues = [
  { id: 1, title: 'Issue', status: 'pending', ... },
  // Add more items
];
```

### Style Changes
- Global styles: `src/styles/globals.css`
- Component styles: `src/pages/ComponentName.css`
- Utilities: Predefined classes in globals.css

## Troubleshooting

### Port Already in Use
```bash
# Port 3000 is already in use. Vite will use 3001, or you can specify:
npm run dev -- --port 3002
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### Build Issues
```bash
# Clear dist folder and rebuild
rm -rf dist
npm run build
```

### Hot Reload Not Working
- Restart the dev server: `Ctrl+C` then `npm run dev`
- Check if files are saved properly
- Clear browser cache if needed

## Browser DevTools

### Recommended Extensions
- **React Developer Tools**: Debug React components
- **Redux DevTools**: For future state management
- **CSS Inspector**: Analyze styling

### Useful Commands in Console
```javascript
// React Inspector
document.querySelectorAll('[data-testid]')

// Check styles
getComputedStyle(document.querySelector('.card'))
```

## Performance Tips

### Optimize Bundle
- Import only needed icons from `lucide-react`
- Use code splitting for large components
- Minimize CSS by removing unused rules

### Dev Tools
- Use browser DevTools Performance tab
- Lighthouse for audits
- Network tab for resource loading

## Deployment Options

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the dist/ folder
```

### Traditional Hosting
1. Run `npm run build`
2. Upload `dist/` folder to your hosting
3. Configure server for SPA routing

## Next Steps

1. **Explore Components**: Check out how each component is built
2. **Review Styling**: Understand the CSS structure in globals.css
3. **Modify Content**: Update mock data with your information
4. **Customize Colors**: Change the design system colors
5. **Add Features**: Implement new functionality as needed

## Support Resources

- **React Documentation**: https://react.dev
- **Vite Documentation**: https://vitejs.dev
- **Lucide Icons**: https://lucide.dev
- **CSS Grid Guide**: https://css-tricks.com/snippets/css/complete-guide-grid/

## Tips for Success

✅ **Do**:
- Test on multiple devices (desktop, tablet, mobile)
- Use browser DevTools for debugging
- Keep components modular and reusable
- Follow the existing code style
- Test all interactive elements

❌ **Don't**:
- Modify node_modules directly
- Use inline styles extensively
- Hardcode colors (use CSS variables)
- Skip responsive design testing
- Ignore accessibility standards

---

**Need Help?** Review the code comments and check DESIGN_SYSTEM.md for detailed guidelines.

Happy building! 🚀
