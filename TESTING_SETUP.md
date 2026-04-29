# EduResolve-UI Testing Setup Guide

## Project Cleanup Completed ✅

### Files Removed
- `src/app/app.component.ts` (empty)
- `src/app/app.css` (empty)
- `src/app/app.html` (placeholder)

### Changes Made

#### 1. **Auth Guards Disabled** 
- **File**: `src/app/app.routes.ts`
- **Change**: Commented out `canActivate: [authGuard]` from all routes
- **Reason**: Enable free navigation between all dashboards for testing

#### 2. **HTTP Client Provider Added**
- **File**: `src/app/app.config.ts`
- **Change**: Added `provideHttpClient()` with auth interceptor
- **Reason**: Enable HTTP requests throughout the application

#### 3. **Mock User Hardcoded as STUDENT**
- **File**: `src/app/core/auth/auth.service.ts`
- **Change**: Set hardcoded mock user with role: 'student'
- **Details**:
  ```typescript
  currentUser = signal<User | null>({
    id: 'mock-student-1',
    name: 'Alex Morgan',
    email: 'alex.morgan@eduresolve.com',
    role: 'student' // ← CHANGE THIS TO TEST OTHER DASHBOARDS
  });
  ```

---

## How to Test Different Dashboards

### To Test STUDENT Dashboard (Default)
1. The app is pre-configured for student role
2. Run: `npm run dev` or `ng serve`
3. Navigate to `http://localhost:4200`
4. You'll automatically land on `/student/dashboard`

### To Test TEACHER Dashboard
1. Open `src/app/core/auth/auth.service.ts`
2. Change the `role` from `'student'` to `'teacher'`
   ```typescript
   role: 'teacher'
   ```
3. Save the file
4. The app will hot-reload and show the teacher dashboard

### To Test ADMIN Dashboard
1. Open `src/app/core/auth/auth.service.ts`
2. Change the `role` to `'admin'`
   ```typescript
   role: 'admin'
   ```
3. Save and the admin dashboard will load

### To Test PARENT Portal
1. Open `src/app/core/auth/auth.service.ts`
2. Change the `role` to `'parent'`
   ```typescript
   role: 'parent'
   ```
3. Save and the parent portal will load

---

## Project Structure Overview

### Feature Modules
- **`/features/student/`** - Student learning hub
  - Dashboard with NCERT trackers, practice, and doubt solving
  
- **`/features/teacher/`** - Teacher management portal
  - Workflows & Insights, homework dispatch, bulk communication
  
- **`/features/admin/`** - Administrative dashboard
  - Revenue, enrollment, tickets, fee management
  
- **`/features/parent/`** - Parent monitoring portal
  - Child progress, school updates, events, tickets

### Core Components
- **`/core/auth/`** - Authentication service with mock user
- **`/core/guards/`** - Route guards (currently disabled for testing)
- **`/core/main-component/`** - Main layout with sidebar and navigation
- **`/core/top-nav-component/`** - Top navigation bar
- **`/core/breadcrumb-component/`** - Breadcrumb navigation

---

## Routing Configuration

### Root Routes
- `/student` → Student dashboard (default landing)
- `/teacher` → Teacher dashboard
- `/admin` → Admin dashboard
- `/parent` → Parent portal
- `/unauthorized` → Unauthorized page (unused for now)

### Feature Routes (Auto-redirect to dashboard)
Each feature module redirects to its dashboard by default:
- `/student/dashboard` ← Default load
- `/teacher/dashboard`
- `/admin/dashboard`
- `/parent/dashboard`

---

## Testing Commands

```bash
# Start development server
npm run dev
# or
ng serve

# Build for production
ng build

# Run tests (if configured)
npm test

# Run linting
npm run lint
```

---

## Current Mock User Details

**Name**: Alex Morgan  
**Email**: alex.morgan@eduresolve.com  
**ID**: mock-student-1  
**Role**: student (changeable in auth.service.ts)

---

## Known Limitations During Testing

1. **Auth Guards Disabled** - All routes are accessible regardless of role
   - This is intentional for testing all dashboards
   - Re-enable by uncommenting `canActivate: [authGuard]` in routes when ready

2. **No Backend Integration** - API calls will fail
   - Mock data is hardcoded in components
   - Interceptor is configured but no actual API endpoints

3. **Static Mock Data** - All student/teacher/etc data is hardcoded
   - Charts and tables use sample data
   - No real database connectivity

---

## Next Steps (After Testing)

1. **Re-enable Auth Guards** when login system is ready
2. **Connect to Backend API** in `EduResolve_Backend`
3. **Add Real Authentication** flow
4. **Implement Data Services** for dynamic data loading
5. **Add Error Handling** for API failures
6. **Create Unit/E2E Tests**

---

## Common Issues & Fixes

### Issue: Components not displaying
- **Fix**: Ensure CommonModule is imported in component
- **Check**: `imports: [CommonModule, ...]` in component decorator

### Issue: Styles not applied
- **Fix**: Verify Tailwind CSS is configured in `tailwind.config.js`
- **Check**: Run `npm run build` to ensure styles are compiled

### Issue: Routes not working
- **Fix**: Make sure lazy loading is correct in `app.routes.ts`
- **Check**: Path matches feature module exports

### Issue: Mock user not changing
- **Fix**: Hard refresh page after changing auth.service.ts
- **Command**: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

---

## Dashboard Features Overview

### 📚 Student Dashboard
- NCERT progress trackers with visual bars
- Practice assessments and MCQ quizzes
- Learning velocity and streak tracking
- Doubt resolution tools

### 👨‍🏫 Teacher Dashboard  
- ForgeAI bottleneck analysis
- Homework dispatch system
- Class roster with engagement metrics
- Test builder with difficulty matrix
- Bulk communication hub

### 👨‍💼 Admin Dashboard
- Real-time metrics (revenue, enrollment)
- Active ticket volume tracking
- Bulk broadcast communication
- Fee management and transactions
- Ticket queue system

### 👨‍👩‍👧‍👦 Parent Portal
- Child academic performance tracking
- School updates and announcements
- ForgeAI routing for concerns
- Active support tickets
- Upcoming events calendar

---

## Support

For issues or questions, check:
1. Browser console for errors (F12)
2. Network tab for API issues
3. Component imports and declarations
4. Route path configuration

Happy Testing! 🚀
