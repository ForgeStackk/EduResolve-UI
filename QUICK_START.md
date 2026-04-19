# 🚀 EduResolve Quick Start Guide

## ⚡ Get Started in 60 Seconds

### Step 1: Install Dependencies (30 seconds)
```bash
cd EduResolve
npm install
```

### Step 2: Start Development Server (10 seconds)
```bash
npm run dev
```

The app automatically opens at `http://localhost:3000`

### Step 3: Choose Your Role (20 seconds)
- Click **"Login as Student"** to explore student dashboard
- Or click **"Login as Teacher"** to explore teacher dashboard

**✅ Done! You're running EduResolve**

---

## 🎯 Quick Navigation

### Try These Features

#### As Student:
1. **Report an Issue** - Click "Report New Issue" button
2. **View Issues** - See your reported issues with status
3. **Check Meetings** - View scheduled meetings
4. **Explore Resources** - Access learning materials

#### As Teacher:
1. **View Issues** - See all student submissions in table
2. **Filter Issues** - Use tab navigation (Pending, In Progress, etc.)
3. **Check Analytics** - Review student concern statistics
4. **Send Message** - Click on a student issue to open chat

#### For Everyone:
1. Go to **Resources** in navigation (when available)
2. **Search** - Try searching for topics
3. **Filter** - Select categories
4. **Expand FAQs** - Click FAQ items to see answers

---

## 📁 Key Files to Know

| File | Purpose | Edit When |
|------|---------|-----------|
| `src/styles/globals.css` | Colors & fonts | Want to change design |
| `src/context/AuthContext.jsx` | User data | Want to change user info |
| `src/components/Navigation.jsx` | Menu items | Want to add menu options |
| `src/pages/StudentDashboard.jsx` | Student content | Want to modify student page |
| `src/pages/TeacherDashboard.jsx` | Teacher content | Want to modify teacher page |

---

## 🎨 Quick Customization

### Change Colors
Edit `src/styles/globals.css` (lines 1-18):
```css
:root {
  --primary-blue: #1e40af;     /* Change this to any color */
  --primary-green: #059669;    /* And this */
}
```

### Change App Name
1. Edit `index.html` - Change `<title>`
2. Edit `src/pages/Login.jsx` - Change "EduResolve" text

### Add Menu Items
Edit `src/components/Navigation.jsx` - Add to `studentNavigation` or `teacherNavigation` array

### Update User Names
Edit `src/context/AuthContext.jsx` - Change `user` object values

---

## 📱 Responsive Testing

### Desktop View
- Full sidebar navigation
- Multi-column layouts
- All features visible

### Tablet View (768px-1023px)
Open DevTools → Device toolbar → Choose iPad

### Mobile View (<768px)
Open DevTools → Device toolbar → Choose iPhone 12

**Tip**: All features work on mobile - sidebar becomes icon-only

---

## 🔧 Common Tasks

### Build for Production
```bash
npm run build        # Creates dist/ folder
npm run preview      # Test the build locally
```

### Check Your Work
```bash
npm run dev          # Always running in background
# Make changes and save - auto-refreshes!
```

### Deploy
1. Run `npm run build`
2. Upload `dist/` folder to hosting
3. Done! 🎉

---

## 🐛 Troubleshooting

### Issue: Port 3000 already in use
**Solution**: Run `npm run dev -- --port 3002`

### Issue: Changes not showing up
**Solution**: 
1. Save file (Ctrl+S)
2. Refresh browser (F5)
3. Check browser console for errors

### Issue: Styles look wrong
**Solution**: 
1. Check globals.css is loading
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart dev server

### Issue: Can't find node_modules
**Solution**: Run `npm install` again

---

## 📚 Documentation Map

| Guide | What | Read Time |
|-------|------|-----------|
| **README.md** | Project overview | 5 min |
| **SETUP_GUIDE.md** | Full setup details | 10 min |
| **DESIGN_SYSTEM.md** | Design tokens | 8 min |
| **VISUAL_REFERENCE.md** | Component specs | 8 min |
| **FEATURES.md** | Feature details | 15 min |
| **FILE_STRUCTURE.md** | Code organization | 5 min |

---

## 🎓 Learning Paths

### 🟢 Beginner
1. Run the app locally
2. Explore all features
3. Read README.md
4. Try changing colors in globals.css

### 🟡 Intermediate
1. Modify mock data in StudentDashboard.jsx
2. Add new navigation items
3. Change user names in AuthContext.jsx
4. Customize the Knowledge Base content

### 🔴 Advanced
1. Connect to backend API
2. Add real authentication
3. Implement WebSocket for messaging
4. Add video conferencing
5. Deploy to production

---

## ✅ Feature Checklist

What's ready to use:
- ✅ Role-based login
- ✅ Student dashboard with issue reporting
- ✅ Teacher dashboard with analytics
- ✅ Knowledge base with search
- ✅ Responsive mobile design
- ✅ Real-time chat UI (mock)
- ✅ Professional styling
- ✅ Accessibility features

What's ready for backend:
- ✅ API endpoints structure
- ✅ Form validation ready
- ✅ Error handling patterns
- ✅ Data state management

---

## 🔑 Keyboard Shortcuts

### Browser DevTools
- **F12** - Open DevTools
- **Ctrl+Shift+C** - Inspect element
- **Ctrl+Shift+J** - Console
- **Ctrl+Shift+M** - Toggle mobile view

### Development
- **Ctrl+S** - Save file
- **F5** - Refresh page
- **Ctrl+Shift+Delete** - Clear cache

---

## 📊 Dashboard at a Glance

### Student Dashboard Has:
```
- Hero banner with welcome message
- 4 stat cards (Issues, Resolved, Pending, Resources)
- My Issues section with filtering
- Upcoming meetings widget
- Progress analytics
- Recommended resources sidebar
```

### Teacher Dashboard Has:
```
- Hero banner for teachers
- 4 analytics cards with trends
- Student issues management table
- Tab filtering system
- Common concerns chart
- Quick action buttons
- Communication panel (click issues to chat)
```

### Knowledge Base Has:
```
- Large search box
- Category sidebar
- Resource cards with metadata
- Tag cloud for browsing
- FAQ accordion
- AI search section
```

---

## 🎁 What's Included

✅ 25 project files
✅ 3,000+ lines of code
✅ 6 comprehensive docs
✅ 4 full pages
✅ Mobile responsive
✅ Professional design
✅ Ready to customize
✅ Ready to deploy

---

## 🚀 Next Steps

### Immediate (0-5 minutes)
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Test as Student
- [ ] Test as Teacher

### Short Term (5-15 minutes)
- [ ] Explore all pages
- [ ] Read README.md
- [ ] Try changing colors
- [ ] Check mobile view

### Medium Term (15-60 minutes)
- [ ] Modify user data
- [ ] Add navigation items
- [ ] Customize content
- [ ] Test responsiveness

### Long Term (1+ hours)
- [ ] Add backend integration
- [ ] Build full API
- [ ] Add real database
- [ ] Deploy to production

---

## 💡 Pro Tips

1. **Always save before testing** - Ctrl+S
2. **Use DevTools** - F12 to inspect elements
3. **Mobile first** - Test mobile early
4. **Keep globals.css clean** - Don't duplicate code
5. **Use CSS variables** - Makes updates easy
6. **Comment your changes** - Help future you
7. **Test all breakpoints** - Desktop, tablet, mobile
8. **Keep components modular** - Easier to maintain

---

## 🎉 Success Indicators

You'll know it's working when you see:
- ✅ App loads at localhost:3000
- ✅ Login page with role selection
- ✅ Student dashboard after login
- ✅ Teacher dashboard loads
- ✅ Knowledge Base search works
- ✅ Responsive on mobile
- ✅ No console errors

---

## 📞 Quick Help

**Question**: How do I change colors?
**Answer**: Edit `src/styles/globals.css` lines 1-18

**Question**: How do I add a menu item?
**Answer**: Edit `src/components/Navigation.jsx` - add to navigation arrays

**Question**: How do I deploy?
**Answer**: Run `npm run build` then upload `dist/` folder

**Question**: How do I make it production-ready?
**Answer**: See SETUP_GUIDE.md and add backend integration

---

## 🌟 You're All Set!

```bash
# Your command:
npm run dev

# Result:
✅ App opens at localhost:3000
✅ Ready to explore
✅ Ready to customize
✅ Ready to deploy
```

**Happy coding! 🚀**

---

**For detailed help, see:**
- Setup issues → SETUP_GUIDE.md
- Design changes → DESIGN_SYSTEM.md  
- Feature questions → FEATURES.md
- Code organization → FILE_STRUCTURE.md
