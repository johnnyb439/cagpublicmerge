#!/bin/bash

# Deploy to caglive2 as a separate Vercel project
echo "Deploying to caglive2.vercel.app..."

# Remove existing .vercel folder to create new project
rm -rf .vercel

# Deploy with explicit project name
npx vercel --prod --yes --scope johnny-bouphavongs-projects --project-name caglive2

echo "Deployment complete! Your site should be available at:"
echo "https://caglive2.vercel.app"