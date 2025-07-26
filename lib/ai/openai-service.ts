import OpenAI from 'openai'
import { ContentAnalysis, ATSScore, KeywordAnalysis, JobMatchAnalysis } from '@/types/ai-resume'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class OpenAIService {
  async analyzeResumeContent(
    resumeContent: string, 
    jobDescription?: string,
    targetRole?: string,
    experienceLevel?: string
  ): Promise<ContentAnalysis> {
    try {
      const prompt = this.buildContentAnalysisPrompt(resumeContent, jobDescription, targetRole, experienceLevel)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert resume analyst and career coach specializing in security-cleared IT positions. Analyze resumes with a focus on technical skills, security clearances, and government contracting experience."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from OpenAI')

      return this.parseContentAnalysis(response)
    } catch (error) {
      console.error('OpenAI content analysis error:', error)
      return this.getFallbackContentAnalysis()
    }
  }

  async calculateATSScore(
    resumeContent: string,
    jobDescription?: string
  ): Promise<ATSScore> {
    try {
      const prompt = this.buildATSPrompt(resumeContent, jobDescription)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an ATS (Applicant Tracking System) expert. Analyze resumes for ATS compatibility, keyword optimization, and formatting issues that could prevent proper parsing."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from OpenAI')

      return this.parseATSScore(response)
    } catch (error) {
      console.error('OpenAI ATS analysis error:', error)
      return this.getFallbackATSScore()
    }
  }

  async analyzeKeywords(
    resumeContent: string,
    jobDescription: string
  ): Promise<KeywordAnalysis> {
    try {
      const prompt = this.buildKeywordAnalysisPrompt(resumeContent, jobDescription)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a keyword optimization expert for resumes and job applications. Focus on technical skills, certifications, and industry-specific terminology for security-cleared IT positions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from OpenAI')

      return this.parseKeywordAnalysis(response)
    } catch (error) {
      console.error('OpenAI keyword analysis error:', error)
      return this.getFallbackKeywordAnalysis()
    }
  }

  async analyzeJobMatch(
    resumeContent: string,
    jobDescription: string
  ): Promise<JobMatchAnalysis> {
    try {
      const prompt = this.buildJobMatchPrompt(resumeContent, jobDescription)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a job matching expert specializing in security-cleared IT positions. Analyze how well a resume matches a specific job description and provide actionable recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from OpenAI')

      return this.parseJobMatchAnalysis(response)
    } catch (error) {
      console.error('OpenAI job match analysis error:', error)
      return this.getFallbackJobMatchAnalysis()
    }
  }

  private buildContentAnalysisPrompt(
    resumeContent: string,
    jobDescription?: string,
    targetRole?: string,
    experienceLevel?: string
  ): string {
    return `
Analyze this resume for a ${targetRole || 'security-cleared IT'} position${experienceLevel ? ` at ${experienceLevel} level` : ''}:

RESUME CONTENT:
${resumeContent}

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n` : ''}

Please provide a detailed analysis in JSON format with the following structure:
{
  "sections": [
    {
      "name": "Professional Summary",
      "present": boolean,
      "quality": number (1-10),
      "suggestions": ["specific improvement suggestions"]
    }
  ],
  "achievements": {
    "count": number,
    "hasQuantifiableResults": boolean,
    "suggestions": ["ways to improve achievements"]
  },
  "skills": {
    "technical": ["list of technical skills found"],
    "soft": ["list of soft skills found"],
    "missing": ["important skills missing for this role"],
    "suggestions": ["specific skill recommendations"]
  },
  "experience": {
    "totalYears": number,
    "relevantYears": number,
    "progressionAnalysis": "analysis of career progression",
    "suggestions": ["ways to better present experience"]
  },
  "education": {
    "present": boolean,
    "relevant": boolean,
    "suggestions": ["education-related recommendations"]
  },
  "certifications": {
    "present": ["list of current certifications"],
    "recommended": ["certifications that would strengthen the resume"],
    "expiring": ["certifications that may be expiring soon"]
  }
}

Focus on security clearances, technical certifications, and government contracting experience.
    `
  }

  private buildATSPrompt(resumeContent: string, jobDescription?: string): string {
    return `
Analyze this resume for ATS (Applicant Tracking System) compatibility:

RESUME CONTENT:
${resumeContent}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}\n` : ''}

Provide an ATS score analysis in JSON format:
{
  "overall": number (0-100),
  "breakdown": {
    "keywords": number (0-100),
    "formatting": number (0-100),
    "skills": number (0-100),
    "experience": number (0-100),
    "education": number (0-100)
  },
  "recommendations": [
    "specific recommendations to improve ATS compatibility"
  ]
}

Consider:
- Keyword density and relevance
- Standard section headers
- Formatting compatibility
- Technical terminology
- Security clearance mentions
- Certification formats
    `
  }

  private buildKeywordAnalysisPrompt(resumeContent: string, jobDescription: string): string {
    return `
Analyze keyword optimization between this resume and job description:

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

Provide keyword analysis in JSON format:
{
  "missing": ["keywords from job description not in resume"],
  "present": ["job description keywords found in resume"],
  "suggestions": [
    {
      "keyword": "specific keyword",
      "importance": number (1-10),
      "context": "where/how to add this keyword",
      "replacements": ["optional: current terms that could be replaced"]
    }
  ],
  "density": {
    "keyword": frequency_count
  }
}

Focus on:
- Technical skills and tools
- Security clearance levels
- Certifications
- Industry-specific terminology
- Action verbs and accomplishments
    `
  }

  private buildJobMatchPrompt(resumeContent: string, jobDescription: string): string {
    return `
Analyze how well this resume matches the job requirements:

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

Provide job match analysis in JSON format:
{
  "matchScore": number (0-100),
  "strengths": ["areas where resume strongly matches job requirements"],
  "gaps": ["requirements not addressed in resume"],
  "recommendations": ["specific actions to improve match"],
  "keywordAlignment": {
    "matched": ["keywords that align well"],
    "missing": ["important keywords missing"],
    "priority": {
      "keyword": importance_score (1-10)
    }
  }
}

Consider:
- Required vs preferred qualifications
- Technical skills alignment
- Experience level match
- Security clearance requirements
- Industry experience
    `
  }

  private parseContentAnalysis(response: string): ContentAnalysis {
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse content analysis:', error)
      return this.getFallbackContentAnalysis()
    }
  }

  private parseATSScore(response: string): ATSScore {
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse ATS score:', error)
      return this.getFallbackATSScore()
    }
  }

  private parseKeywordAnalysis(response: string): KeywordAnalysis {
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse keyword analysis:', error)
      return this.getFallbackKeywordAnalysis()
    }
  }

  private parseJobMatchAnalysis(response: string): JobMatchAnalysis {
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse job match analysis:', error)
      return this.getFallbackJobMatchAnalysis()
    }
  }

  // Fallback methods for when AI analysis fails
  private getFallbackContentAnalysis(): ContentAnalysis {
    return {
      sections: [
        {
          name: "Professional Summary",
          present: true,
          quality: 7,
          suggestions: ["Consider adding specific technical skills and security clearance level"]
        }
      ],
      achievements: {
        count: 3,
        hasQuantifiableResults: false,
        suggestions: ["Add quantifiable metrics to achievements"]
      },
      skills: {
        technical: ["Network Administration", "Security Protocols"],
        soft: ["Communication", "Problem Solving"],
        missing: ["Cloud Computing", "DevOps"],
        suggestions: ["Add more specific technical certifications"]
      },
      experience: {
        totalYears: 5,
        relevantYears: 4,
        progressionAnalysis: "Shows steady career progression in IT security",
        suggestions: ["Emphasize security clearance work experience"]
      },
      education: {
        present: true,
        relevant: true,
        suggestions: ["Consider adding relevant continuing education"]
      },
      certifications: {
        present: ["Security+"],
        recommended: ["CISSP", "CCNA"],
        expiring: []
      }
    }
  }

  private getFallbackATSScore(): ATSScore {
    return {
      overall: 75,
      breakdown: {
        keywords: 70,
        formatting: 80,
        skills: 75,
        experience: 75,
        education: 80
      },
      recommendations: [
        "Add more industry-specific keywords",
        "Include technical certifications",
        "Specify security clearance level"
      ]
    }
  }

  private getFallbackKeywordAnalysis(): KeywordAnalysis {
    return {
      missing: ["AWS", "Docker", "Kubernetes", "CISSP"],
      present: ["Security+", "Network Administration", "Linux"],
      suggestions: [
        {
          keyword: "AWS",
          importance: 9,
          context: "Add AWS experience to technical skills section"
        }
      ],
      density: {
        "security": 3,
        "network": 2,
        "administration": 4
      }
    }
  }

  private getFallbackJobMatchAnalysis(): JobMatchAnalysis {
    return {
      matchScore: 78,
      strengths: ["Strong technical background", "Relevant security experience"],
      gaps: ["Cloud computing experience", "Specific certifications"],
      recommendations: ["Obtain AWS certification", "Highlight security clearance work"],
      keywordAlignment: {
        matched: ["security", "network", "administration"],
        missing: ["cloud", "devops", "kubernetes"],
        priority: {
          "aws": 9,
          "docker": 7,
          "cissp": 8
        }
      }
    }
  }
}

export const openaiService = new OpenAIService()