# 🚀 CAG Project Recovery Guide

## Quick Recovery (If Site Crashes)

### 1. Navigate to Project Directory
```bash
cd /Users/tone/Desktop/CAG-Official-2025/cagadvisor-latest
```

### 2. Pull Latest Changes
```bash
git pull origin master
```

### 3. Install Dependencies (if needed)
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Verify Site is Running
- Open: http://localhost:3000 or http://localhost:3001
- Should see the minimal dark navbar with Login/Create Account buttons

---

## Full Recovery from Scratch

### 1. Clone Repository
```bash
cd /Users/tone/Desktop/CAG-Official-2025/
git clone https://github.com/johnnyb439/caglive.git cagadvisor-latest
cd cagadvisor-latest
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development
```bash
npm run dev
```

---

## Current Project State (Commit: 0978a75)

### ✅ What We've Implemented:
- **Minimal Dark Navbar**: Clean, professional header
- **MoreMenu Component**: Dropdown with About, Services, Jobs, Mock Interview, Resources
- **NavActions Component**: Login (ghost) + Create Account (blue glow) buttons
- **SiteHeader Component**: Main navbar component
- **CSS Enhancements**: --cag-blue variable and .cag-glow effect
- **Guest State**: Forces showing signup/login buttons on landing page

### 📁 Key Files Created/Modified:
```
components/
├── SiteHeader.tsx      # Main navbar component
├── MoreMenu.tsx        # Accessible dropdown menu
├── NavActions.tsx      # Auth-aware action buttons
└── Navbar.tsx          # Original (now replaced)

app/
├── layout.tsx          # Updated to use SiteHeader
└── globals.css         # Added --cag-blue and .cag-glow

PROJECT_RECOVERY_GUIDE.md  # This recovery guide
```

---

## Troubleshooting Common Issues

### ❌ Port Already in Use
```bash
# Kill processes on ports 3000/3001
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:3001 | xargs kill -9

# Then restart
npm run dev
```

### ❌ Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### ❌ Git Issues
```bash
# Check current status
git status
git log --oneline -5

# If behind remote
git pull origin master

# If need to reset to last known good state
git reset --hard 0978a75
```

### ❌ Build Errors
```bash
# Check for TypeScript errors
npm run lint

# Build for production test
npm run build
```

---

## Important URLs & Info

### 🌐 Live URLs:
- **GitHub**: https://github.com/johnnyb439/caglive
- **Live Site**: https://caglive.vercel.app
- **Local Dev**: http://localhost:3000 or http://localhost:3001

### 🔧 Key Commands:
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run lint` - Check code quality
- `git pull` - Get latest changes
- `git push` - Push your changes

### 📋 Current Navbar Features:
- **Left**: Small CAG logo + name
- **Right**: "More..." dropdown + Login/Create Account buttons
- **Dark Theme**: No bottom border, clean minimal design
- **Responsive**: Works on all device sizes
- **Accessible**: Full keyboard navigation support

---

## Session Recovery Commands

### Quick Start After System Restart:
```bash
# 1. Navigate to project
cd /Users/tone/Desktop/CAG-Official-2025/cagadvisor-latest

# 2. Pull latest changes  
git pull

# 3. Start development
npm run dev

# 4. Open browser to: http://localhost:3001
```

### When Working with Claude Code Again:
1. Navigate to the project directory
2. Run `git pull` to get latest changes
3. Share this recovery guide with Claude
4. Reference commit `0978a75` for current navbar state

---

## Next Steps & Future Enhancements

### 🎯 Immediate Tasks:
- [ ] Test navbar on different screen sizes
- [ ] Verify all dropdown links work
- [ ] Test login/signup form integration

### 🚀 Future Enhancements:
- [ ] Add authentication integration
- [ ] Mobile hamburger menu optimization
- [ ] Additional navbar animations
- [ ] User avatar when logged in

---

## Emergency Contacts & Resources

- **Project Location**: `/Users/tone/Desktop/CAG-Official-2025/cagadvisor-latest`
- **Last Known Good Commit**: `0978a75`
- **Repository**: `https://github.com/johnnyb439/caglive`
- **Technology Stack**: Next.js 15, React, Tailwind CSS, TypeScript

---

*Last Updated: $(date)*
*Recovery Guide Version: 1.0*