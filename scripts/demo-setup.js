#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Cleared Advisory Group Demo Environment\n');

// Create demo users for local development
const demoUsers = [
  {
    id: 'demo-jobseeker-1',
    email: 'john.doe@example.com',
    password: 'Test123!@#',
    name: 'John Doe',
    clearanceLevel: 'SECRET',
    role: 'jobseeker',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-employer-1',
    email: 'recruiter@techcorp.com',
    password: 'Test123!@#',
    name: 'Sarah Recruiter',
    clearanceLevel: null,
    role: 'employer',
    company: 'TechCorp Federal',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-admin-1',
    email: 'admin@clearedadvisory.com',
    password: 'Admin123!@#',
    name: 'Admin User',
    clearanceLevel: 'TS/SCI',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

// Demo jobs
const demoJobs = [
  {
    id: 'job-1',
    title: 'Senior Cloud Engineer',
    company: 'AWS Federal',
    location: 'Arlington, VA',
    clearanceRequired: 'SECRET',
    salary: '$120,000 - $160,000',
    description: 'Looking for experienced cloud engineers...',
    postedDate: new Date().toISOString()
  },
  {
    id: 'job-2',
    title: 'DevOps Engineer',
    company: 'Raytheon',
    location: 'Chantilly, VA',
    clearanceRequired: 'TS/SCI',
    salary: '$130,000 - $180,000',
    description: 'DevOps engineer with Kubernetes experience...',
    postedDate: new Date().toISOString()
  }
];

// Check if running in browser
if (typeof window !== 'undefined') {
  // Browser environment - store in localStorage
  localStorage.setItem('demo-users', JSON.stringify(demoUsers));
  localStorage.setItem('demo-jobs', JSON.stringify(demoJobs));
  console.log('✅ Demo data loaded in browser');
} else {
  // Node environment - create demo data file
  const demoData = {
    users: demoUsers,
    jobs: demoJobs,
    certifications: [
      { id: 'cert-1', name: 'Security+', issuer: 'CompTIA', date: '2024-01-15' },
      { id: 'cert-2', name: 'AWS Solutions Architect', issuer: 'AWS', date: '2024-03-20' }
    ]
  };

  const outputPath = path.join(__dirname, '..', 'public', 'demo-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(demoData, null, 2));
  
  console.log('✅ Demo data created at: public/demo-data.json');
  console.log('\n📝 Demo Login Credentials:');
  console.log('------------------------');
  console.log('Job Seeker: john.doe@example.com / Test123!@#');
  console.log('Employer: recruiter@techcorp.com / Test123!@#');
  console.log('Admin: admin@clearedadvisory.com / Admin123!@#');
  console.log('\n⚠️  Note: This is for development only. Configure Supabase for production.');
}