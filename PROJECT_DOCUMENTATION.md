# Cleared Advisory Group Website Documentation

## Project Overview
This is a modern Next.js website for Cleared Advisory Group, designed to help cleared professionals (National Guard, Reservists, Veterans, and those with security clearances) transition to lucrative IT contracting careers.

## Key Features
- 🚀 Built with Next.js 15 and TypeScript
- 🎨 Styled with Tailwind CSS using custom green/blue color scheme
- 🇺🇸 American flag integration in navbar and hero section
- 🤖 AI-powered Mock Interview Tool for IT positions
- 📱 Fully responsive design
- ⚡ Server-side rendering for optimal performance
- 🔒 Security-focused for cleared professionals

## Technology Stack
- **Framework**: Next.js 15.1.0
- **Language**: TypeScript 5.7.2
- **Styling**: Tailwind CSS 3.4.16
- **UI Library**: React 19.0.0
- **Animations**: Framer Motion 11.16.0
- **Icons**: Lucide React 0.468.0
- **AI Integration**: OpenAI 4.79.1

## Color Scheme
The website uses a professional green/blue color palette:
- **Dynamic Green**: #10B981
- **Emerald Green**: #059669
- **Forest Green**: #047857
- **Dynamic Blue**: #0891B2
- **Sky Blue**: #0EA5E9
- **Navy Blue**: #1E40AF
- **Patriot Red**: #DC2626 (for American flag elements)
- **Opportunity Orange**: #F97316
- **Command Black**: #000000
- **Base White**: #FFFFFF
- **Ops Charcoal**: #1F2937
- **Intel Gray**: #6B7280

## Project Structure
```
cleared-advisory-group-website/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with navbar/footer
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Global styles
│   ├── about/             # About page
│   ├── contact/           # Contact page with form
│   ├── mock-interview/    # AI Mock Interview tool
│   ├── services/          # Services overview
│   ├── resources/         # Resources and guides
│   ├── privacy/           # Privacy policy
│   ├── terms/             # Terms of service
│   └── security/          # Security information
├── components/            # React components
│   ├── Hero.tsx          # Hero section with flag
│   ├── Navbar.tsx        # Navigation with logo
│   ├── Footer.tsx        # Footer with links
│   ├── WhoWeServe.tsx    # Target audience section
│   ├── OurProcess.tsx    # 4-step process
│   ├── MockInterviewFeature.tsx
│   ├── SuccessStories.tsx
│   └── CTASection.tsx    # Call-to-action
├── public/               
│   └── images/           
│       └── cag-logo.png  # Your actual CAG logo
├── tailwind.config.ts    # Custom color configuration
├── package.json          # Dependencies
└── README.md            # Setup instructions
```

## Key Pages

### 1. Homepage (/)
- Hero section with American flag banner
- Who We Serve section (4 target audiences)
- Our Process (4-step journey)
- Mock Interview feature preview
- Success Stories
- Call-to-action section

### 2. About (/about)
- Company mission and purpose
- Core values
- Leadership team
- Impact statistics

### 3. Services (/services)
- Career Transition Planning
- Resume Translation
- Interview Preparation
- Clearance Guidance
- Contractor Navigation
- AI Mock Interview Tool

### 4. Mock Interview (/mock-interview)
- Tier 1: Help Desk, OSP, ISP, Fiber Optics
- Tier 2: Network Admin, Systems Admin
- Interactive practice with AI feedback
- Question/answer interface

### 5. Resources (/resources)
- Getting Started guides
- Career Development tools
- Industry Insights
- FAQs section

### 6. Contact (/contact)
- Contact form with service selection
- Clearance level dropdown
- Military affiliation selection

## Running the Website

### Development Mode
```bash
cd "C:\Users\JohnnyBeast\OneDrive - Miysis Alliance\AI Consulting\cleared-advisory-group-website"
npm run dev
```
Visit: http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## Deployment Options

### 1. Vercel (Recommended)
1. Push code to GitHub
2. Import repository to Vercel
3. Deploy automatically

### 2. Netlify
1. Build: `npm run build`
2. Deploy the `.next` folder

### 3. Traditional Hosting
1. Build: `npm run build`
2. Start: `npm start`
3. Use PM2 for process management

## Environment Variables (Future)
Create a `.env.local` file for:
```
OPENAI_API_KEY=your_api_key_here
EMAIL_SERVICE_API_KEY=your_email_service_key
```

## Future Enhancements

### Backend Integration
- Connect contact form to email service (SendGrid/AWS SES)
- Integrate real OpenAI API for mock interviews
- Add database for storing user progress

### Content Management
- Add blog functionality
- Create admin panel for content updates
- Expand interview question database

### Analytics & SEO
- Add Google Analytics
- Implement structured data
- Create XML sitemap
- Add Open Graph meta tags

## Maintenance Notes

### Updating Content
- Text content can be edited directly in component files
- Colors are defined in `tailwind.config.ts`
- Logo can be replaced at `public/images/cag-logo.png`

### Adding New Pages
1. Create new folder in `app/` directory
2. Add `page.tsx` file
3. Update navigation in `components/Navbar.tsx`
4. Add to sitemap in `app/sitemap.ts`

### Placeholder Items to Update
1. Social media links in Footer.tsx (currently "#")
2. Resource download links in resources page
3. Contact form backend integration
4. Mock interview AI API integration

## Security Considerations
- No sensitive data stored client-side
- Form validation on all inputs
- HTTPS required for production
- Regular dependency updates recommended

## Support & Maintenance
- Built by: Claude (AI Assistant)
- Date: January 2025
- Framework Documentation: https://nextjs.org/docs
- Tailwind Documentation: https://tailwindcss.com/docs

## Company Information
- **Company**: Cleared Advisory Group
- **Tagline**: Your Gateway to Opportunities
- **Target**: National Guard, Reservists, Veterans, Cleared Professionals
- **Focus**: IT career transitions for security cleared individuals

---

Last Updated: ${new Date().toLocaleDateString()}
Version: 1.0.0