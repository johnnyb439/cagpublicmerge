# AI Mock Interview Setup Guide

## Overview
The mock interview tool now has full AI integration using OpenAI's GPT-3.5. The AI will:
- Analyze actual answer content, not just keywords
- Provide personalized feedback based on the specific role
- Score answers from 1-5
- Identify strengths and areas for improvement
- Give professional, constructive criticism

## Setup Instructions

### Step 1: Get an OpenAI API Key
1. Go to https://platform.openai.com/signup
2. Create an account or sign in
3. Go to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (it starts with "sk-")

### Step 2: Add API Key to Your Project
1. In your project folder, create a file named `.env.local` (not `.env.local.example`)
2. Add this line:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
3. Save the file

### Step 3: Restart Your Development Server
```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

## How It Works

### With API Key:
- Real AI analyzes answers considering:
  - Technical accuracy
  - Communication skills
  - Professionalism
  - Relevance to the role
  - Security clearance considerations

### Without API Key:
- Falls back to basic keyword matching
- Still functional but less intelligent

## Example Interactions

### Question: "How would you handle an angry user who can't access their email?"

**Good Answer**: "I would remain calm and professional, actively listen to understand their frustration, and assure them I'll help resolve the issue. I'd verify their identity, check system status, and troubleshoot step-by-step while keeping them informed."
- AI Response: "✅ Excellent approach! You demonstrated empathy, professionalism, and systematic troubleshooting. Consider also mentioning documentation of the issue for future reference."

**Poor Answer**: "I'd get mad at them for yelling at me"
- AI Response: "❌ This response lacks professionalism. In IT support, maintaining composure is crucial. Focus on de-escalation techniques and remember the user is frustrated with the situation, not you personally."

## Cost Considerations
- OpenAI charges ~$0.002 per interview question
- A typical 5-question interview costs ~$0.01
- Free trial includes $5 credit (500+ interviews)

## Security Note
- Never commit your `.env.local` file to Git
- The `.env.local` file is already in `.gitignore`
- Keep your API key confidential

## Troubleshooting

### "AI integration not configured" message
- Make sure `.env.local` exists (not `.env.local.example`)
- Verify your API key is correct
- Restart the development server

### AI responses are slow
- Normal - AI takes 2-4 seconds to analyze
- Shows "🤔 Analyzing your answer..." while processing

### Getting errors
- Check your OpenAI account has credits
- Verify API key is valid
- Check console for error messages

## Future Enhancements
The AI integration can be expanded to:
- Remember context across questions
- Provide role-specific technical questions
- Generate dynamic questions based on previous answers
- Create detailed interview reports
- Score overall interview performance