# 📚 EduResolve - Academic Support Platform

A modern, user-friendly web application designed to connect students and teachers for resolving academic and personal issues. Built with React, featuring a clean Material Design aesthetic with a professional blue and green color palette.

## 🎯 Features

### 👨‍🎓 **Student Dashboard**
- **Issue Reporting**: Report academic and personal issues with categorization and priority levels
- **Status Tracking**: Monitor the resolution progress of submitted issues
- **Meeting Scheduler**: Request and schedule meetings with teachers and mentors
- **Learning Resources**: Access curated educational materials and guides
- **Peer Forum**: Engage with other students for collaborative learning
- **Progress Analytics**: View personal metrics on issue resolution and response times

### 👨‍🏫 **Teacher Dashboard**
- **Issue Management**: View, categorize, and manage all student issues
- **Analytics Dashboard**: Track common concerns, resolution rates, and satisfaction metrics
- **Communication Tools**: Direct messaging and video call capabilities
- **Scheduling System**: Manage meetings and sessions with students
- **Feedback Collection**: Gather and analyze student feedback
- **Quick Actions**: Shortcuts for scheduling groups sessions and announcements

### 📖 **Shared Knowledge Base**
- **Comprehensive FAQs**: Frequently asked questions organized by category
- **Guides & Tutorials**: Detailed guides on various academic and personal topics
- **Smart Search**: Intelligent search with AI-powered assistance
- **Category Filtering**: Browse resources by academic, personal development, and other categories
- **Resource Metrics**: View popularity, helpfulness ratings, and read time
- **Tag-based Navigation**: Find related content through intuitive tagging system

### 🔔 **Notifications & Updates**
- Real-time notifications for issue updates and responses
- Deadline reminders and resolution status alerts
- Meeting confirmations and schedule updates
- Customizable notification preferences

## 🎨 Design Features

### Color Palette
- **Primary Blue**: `#1e40af` - Main actions and primary elements
- **Secondary Blue**: `#3b82f6` - Interactive states and highlights
- **Primary Green**: `#059669` - Success states and confirmations
- **Secondary Green**: `#10b981` - Accents and alternatives
- **Neutral Grays**: Professional neutral backgrounds and text

### Design System
- Material Design principles for consistency
- Responsive grid-based layout
- Smooth transitions and micro-interactions
- Mobile-first responsive design
- Accessibility-focused component design

### UI Components
- **Cards**: Elevated cards with subtle shadows for content organization
- **Badges**: Status and category indicators with semantic colors
- **Tabs**: Organized navigation within sections
- **Modals**: Clean dialogs for forms and important actions
- **Tables**: Responsive data presentation with hover states
- **Progress Bars**: Visual representation of metrics and completion

## 📱 Responsive Design

- **Desktop**: Full-featured sidebar navigation and multi-column layouts
- **Tablet**: Optimized grid layouts and collapsible navigation
- **Mobile**: Single-column layouts with icon-only navigation drawer

## 🏗️ Project Structure

```
EduResolve/
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Top navigation header
│   │   ├── Header.css
│   │   ├── Navigation.jsx       # Sidebar navigation
│   │   └── Navigation.css
│   ├── pages/
│   │   ├── Login.jsx            # Role-based authentication
│   │   ├── Login.css
│   │   ├── StudentDashboard.jsx # Student main interface
│   │   ├── StudentDashboard.css
│   │   ├── TeacherDashboard.jsx # Teacher main interface
│   │   ├── TeacherDashboard.css
│   │   ├── KnowledgeBase.jsx    # Shared resource center
│   │   └── KnowledgeBase.css
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication state management
│   ├── styles/
│   │   └── globals.css          # Global styles and CSS variables
│   ├── App.jsx                  # Main application component
│   └── index.jsx                # React entry point
├── index.html                   # HTML template
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ and npm/yarn

### Installation

```bash
# Clone or download the project
cd EduResolve

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will open at `http://localhost:3000`

## 🔐 Authentication

The app uses role-based access control:

1. **Login Page**: Choose between Student or Teacher roles
2. **Auto-redirect**: Routes to appropriate dashboard based on selected role
3. **Context-based**: User state managed through React Context API

### Demo Credentials
- **Student**: Sarah Johnson (sarah.johnson@school.edu)
- **Teacher**: Dr. Michael Chen (michael.chen@school.edu)

## 🎯 Key Workflows

### For Students
1. Login → Student Dashboard
2. Report Issue → Track Status → Communicate with Teacher
3. Schedule Meetings → Join Video Calls
4. Access Resources → Join Peer Forums
5. View Progress Analytics

### For Teachers
1. Login → Teacher Dashboard
2. View Student Issues → Categorize & Prioritize
3. Communicate Directly with Students
4. Schedule Meetings & Manage Calendar
5. Collect Feedback & Review Analytics

## 💡 Technical Highlights

### Frontend Stack
- **React 18**: Component-based UI with hooks
- **Vite**: Lightning-fast build tool and dev server
- **Lucide React**: Modern icon library
- **CSS3**: Custom properties and responsive design

### State Management
- React Context API for authentication
- Local state with useState hooks
- Scalable for Redux/Zustand if needed

### Responsive Architecture
- Mobile-first CSS approach
- CSS Grid and Flexbox layouts
- Media queries for all breakpoints
- Touch-friendly interface elements

## 🎨 Customization

### Change Colors
Edit CSS variables in `src/styles/globals.css`:
```css
:root {
  --primary-blue: #1e40af;
  --primary-green: #059669;
  /* ... other colors */
}
```

### Add New Pages
1. Create component in `src/pages/`
2. Create corresponding CSS file
3. Import in `App.jsx`
4. Update Navigation component

### Modify Navigation
Edit the navigation items in `src/components/Navigation.jsx`:
```javascript
const studentNavigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  // Add more items...
];
```

## 🔄 Data Flow

The application uses:
- **Context API**: For global authentication state
- **Local State**: For component-specific data (forms, modals, selections)
- **Props**: For component communication
- **Event Handlers**: For user interactions

Future scalability can include:
- Redux for complex state
- API integration for backend
- Real-time updates with WebSockets
- Database integration

## 📊 UI Patterns

### Status Indicators
- ✅ Resolved (Green)
- 🔄 In Progress (Amber)
- ⏳ Pending (Blue)
- 🔴 High Priority (Red)

### User Interactions
- Hover states for better feedback
- Smooth transitions for all state changes
- Clear loading and empty states
- Validation feedback in forms

## 🌐 Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🤝 Contributing

To enhance the project:
1. Create new components in appropriate folders
2. Maintain consistent styling with design system
3. Test responsive design on multiple devices
4. Use semantic HTML and accessibility best practices

## 📄 License

This project is designed as an educational platform and is available for use.

## 🙋 Support

For questions or suggestions:
- Review the code documentation
- Check component implementations
- Explore the Knowledge Base for user guides

---

**EduResolve** - Connecting Students and Teachers. Supporting Success. 📚✨
