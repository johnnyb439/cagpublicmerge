# How to Share the Cleared Advisory Group Website

## Option 1: Quick Local Preview (Easiest)
1. Run the development server:
   ```
   npm run dev
   ```
2. Share your screen via Teams/Zoom with your colleague
3. Navigate through the site together

## Option 2: Send Source Code Package
1. Run the batch file:
   ```
   create-preview.bat
   ```
2. This creates a `preview-package` folder
3. Zip the folder and email it to your colleague
4. They can run it locally following the included instructions

## Option 3: Deploy to Free Hosting (Best for Remote Review)

### Vercel (Recommended - Free)
1. Go to https://vercel.com
2. Sign up with GitHub/GitLab/Bitbucket
3. Click "New Project"
4. Import your project folder
5. Click "Deploy"
6. Share the generated URL (e.g., https://your-project.vercel.app)

### Netlify (Alternative - Also Free)
1. Go to https://app.netlify.com
2. Sign up for free account
3. Drag and drop your project folder
4. Get instant preview URL to share

### GitHub Pages (If you use GitHub)
1. Push code to GitHub repository
2. Go to Settings > Pages
3. Enable GitHub Pages
4. Share the generated URL

## Option 4: Screenshots/PDF
1. Take screenshots of each page:
   - Home page
   - About page
   - Services page
   - Jobs board
   - Mock Interview
   - Resources
   - Login/Dashboard

2. Compile into a PDF using any PDF creator

## Option 5: Video Walkthrough
1. Use screen recording software (Windows Game Bar: Win+G)
2. Record yourself navigating through the site
3. Upload to YouTube (unlisted) or share via cloud storage

## Quick Deployment Commands

### For Vercel:
```bash
npx vercel
```

### For Netlify:
```bash
npm install -g netlify-cli
netlify deploy
```

## What to Highlight for Your Colleague

1. **Color Scheme**: Green/Blue theme (no purple/magenta)
2. **American Flag**: Integrated in navigation
3. **Mock Interview**: AI-powered with IT-specific questions
4. **Job Board**: Filtered by clearance levels
5. **Security Focus**: No sensitive data storage
6. **Target Audience**: National Guard, Reservists, Veterans
7. **Company Name**: Cleared Advisory Group
8. **Founder**: Listed as "The Trinity Team"

## Files to Include if Sending Code
- `/app` - All page components
- `/components` - Reusable components
- `/public` - Images and static assets
- `package.json` - Dependencies
- `tailwind.config.ts` - Color configuration
- This README file