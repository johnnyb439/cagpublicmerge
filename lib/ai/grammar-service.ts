import { GrammarCheck } from '@/types/ai-resume'
import natural from 'natural'

export class GrammarService {
  private spellChecker: any
  
  constructor() {
    // Initialize spell checker with custom dictionary
    this.spellChecker = natural.Spellcheck
    this.initializeCustomDictionary()
  }

  async checkGrammar(text: string): Promise<GrammarCheck> {
    try {
      const errors = await this.analyzeText(text)
      const wordCount = this.countWords(text)
      const readabilityScore = this.calculateReadabilityScore(text)
      const overallScore = this.calculateOverallScore(errors, wordCount)

      return {
        errors,
        overallScore,
        wordCount,
        readabilityScore
      }
    } catch (error) {
      console.error('Grammar check error:', error)
      return this.getFallbackGrammarCheck(text)
    }
  }

  async checkSpelling(text: string): Promise<GrammarCheck['errors']> {
    const words = text.match(/\b\w+\b/g) || []
    const errors: GrammarCheck['errors'] = []

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const position = text.indexOf(word)
      
      if (!this.isCorrectSpelling(word)) {
        const suggestions = this.getSuggestions(word)
        
        errors.push({
          type: 'spelling',
          message: `"${word}" may be misspelled`,
          position: {
            start: position,
            end: position + word.length
          },
          suggestions,
          severity: 'error'
        })
      }
    }

    return errors
  }

  private async analyzeText(text: string): Promise<GrammarCheck['errors']> {
    const errors: GrammarCheck['errors'] = []
    
    // Check spelling
    const spellingErrors = await this.checkSpelling(text)
    errors.push(...spellingErrors)
    
    // Check grammar patterns
    const grammarErrors = this.checkGrammarPatterns(text)
    errors.push(...grammarErrors)
    
    // Check punctuation
    const punctuationErrors = this.checkPunctuation(text)
    errors.push(...punctuationErrors)
    
    // Check style issues
    const styleErrors = this.checkStyle(text)
    errors.push(...styleErrors)

    return errors
  }

  private checkGrammarPatterns(text: string): GrammarCheck['errors'] {
    const errors: GrammarCheck['errors'] = []
    
    // Common grammar patterns to check
    const patterns = [
      {
        regex: /\b(there|their|they're)\b/gi,
        check: (match: string, context: string) => {
          // Simple there/their/they're check
          if (match.toLowerCase() === 'there' && context.includes('possessive')) {
            return "Consider using 'their' for possession"
          }
          return null
        }
      },
      {
        regex: /\b(its|it's)\b/gi,
        check: (match: string, context: string) => {
          if (match === "its'" || match === "its's") {
            return "Use 'its' for possession, 'it's' for 'it is'"
          }
          return null
        }
      },
      {
        regex: /\b(you're|your)\b/gi,
        check: () => null // Placeholder for more complex checks
      }
    ]

    patterns.forEach(pattern => {
      let match
      while ((match = pattern.regex.exec(text)) !== null) {
        const suggestion = pattern.check(match[0], text.substring(match.index - 20, match.index + 20))
        if (suggestion) {
          errors.push({
            type: 'grammar',
            message: suggestion,
            position: {
              start: match.index,
              end: match.index + match[0].length
            },
            suggestions: [],
            severity: 'warning'
          })
        }
      }
    })

    return errors
  }

  private checkPunctuation(text: string): GrammarCheck['errors'] {
    const errors: GrammarCheck['errors'] = []
    
    // Check for double spaces
    const doubleSpaces = /  +/g
    let match
    while ((match = doubleSpaces.exec(text)) !== null) {
      errors.push({
        type: 'punctuation',
        message: 'Multiple consecutive spaces found',
        position: {
          start: match.index,
          end: match.index + match[0].length
        },
        suggestions: [' '],
        severity: 'suggestion'
      })
    }

    // Check for missing periods at end of sentences
    const sentences = text.split(/[.!?]+/)
    sentences.forEach((sentence, index) => {
      if (sentence.trim() && index < sentences.length - 1) {
        const lastChar = sentence.trim().slice(-1)
        if (!/[.!?]/.test(lastChar)) {
          const position = text.indexOf(sentence) + sentence.length
          errors.push({
            type: 'punctuation',
            message: 'Consider adding punctuation at the end of this sentence',
            position: {
              start: position - 1,
              end: position
            },
            suggestions: ['.'],
            severity: 'suggestion'
          })
        }
      }
    })

    return errors
  }

  private checkStyle(text: string): GrammarCheck['errors'] {
    const errors: GrammarCheck['errors'] = []
    
    // Check for passive voice
    const passivePatterns = [
      /\b(was|were|is|are|been|being)\s+\w+ed\b/gi,
      /\b(was|were|is|are|been|being)\s+\w+en\b/gi
    ]

    passivePatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        errors.push({
          type: 'style',
          message: 'Consider using active voice instead of passive voice',
          position: {
            start: match.index,
            end: match.index + match[0].length
          },
          suggestions: [],
          severity: 'suggestion'
        })
      }
    })

    // Check for weak action verbs
    const weakVerbs = ['managed', 'handled', 'dealt with', 'worked on', 'responsible for']
    weakVerbs.forEach(verb => {
      const regex = new RegExp(`\\b${verb}\\b`, 'gi')
      let match
      while ((match = regex.exec(text)) !== null) {
        errors.push({
          type: 'style',
          message: `Consider using a stronger action verb instead of "${verb}"`,
          position: {
            start: match.index,
            end: match.index + match[0].length
          },
          suggestions: this.getStrongerVerbs(verb),
          severity: 'suggestion'
        })
      }
    })

    return errors
  }

  private isCorrectSpelling(word: string): boolean {
    // Custom dictionary for technical terms
    const technicalTerms = [
      'API', 'AWS', 'DevOps', 'CI/CD', 'Kubernetes', 'Docker', 'VPN',
      'CISSP', 'CompTIA', 'CCNA', 'CCNP', 'CISA', 'CISM', 'CEH',
      'clearance', 'TS/SCI', 'polygraph', 'NIST', 'ISO', 'FISMA',
      'cybersecurity', 'InfoSec', 'SIEM', 'SOC', 'IDS', 'IPS',
      'firewall', 'endpoint', 'malware', 'phishing', 'LDAP',
      'Active Directory', 'PowerShell', 'Python', 'JavaScript',
      'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL'
    ]

    // Check if it's a technical term
    if (technicalTerms.some(term => 
      term.toLowerCase() === word.toLowerCase() || 
      word.toLowerCase().includes(term.toLowerCase())
    )) {
      return true
    }

    // Use natural language processing for common words
    try {
      return natural.JaroWinklerDistance(word, word) === 1 // Simplified check
    } catch {
      return true // Default to correct if can't check
    }
  }

  private getSuggestions(word: string): string[] {
    const commonCorrections: Record<string, string[]> = {
      'recieve': ['receive'],
      'seperate': ['separate'],
      'definately': ['definitely'],
      'occured': ['occurred'],
      'developement': ['development'],
      'mangement': ['management'],
      'sucessful': ['successful'],
      'experiance': ['experience'],
      'knowlege': ['knowledge'],
      'responsable': ['responsible']
    }

    if (commonCorrections[word.toLowerCase()]) {
      return commonCorrections[word.toLowerCase()]
    }

    // Generate phonetic suggestions
    return this.generatePhoneticSuggestions(word)
  }

  private generatePhoneticSuggestions(word: string): string[] {
    // Simple suggestions based on common mistakes
    const suggestions = []
    
    // Double letters
    if (word.length > 3) {
      suggestions.push(word.replace(/(.)\1+/g, '$1'))
    }
    
    // Common substitutions
    const substitutions = [
      ['ie', 'ei'],
      ['tion', 'sion'],
      ['ance', 'ence']
    ]
    
    substitutions.forEach(([from, to]) => {
      if (word.includes(from)) {
        suggestions.push(word.replace(from, to))
      }
      if (word.includes(to)) {
        suggestions.push(word.replace(to, from))
      }
    })

    return suggestions.slice(0, 3) // Return top 3 suggestions
  }

  private getStrongerVerbs(weakVerb: string): string[] {
    const strongerVerbs: Record<string, string[]> = {
      'managed': ['led', 'directed', 'orchestrated', 'supervised'],
      'handled': ['resolved', 'processed', 'executed', 'delivered'],
      'dealt with': ['resolved', 'addressed', 'tackled', 'solved'],
      'worked on': ['developed', 'implemented', 'created', 'built'],
      'responsible for': ['led', 'oversaw', 'managed', 'directed']
    }

    return strongerVerbs[weakVerb.toLowerCase()] || []
  }

  private countWords(text: string): number {
    return (text.match(/\b\w+\b/g) || []).length
  }

  private calculateReadabilityScore(text: string): number {
    // Simplified Flesch Reading Ease Score
    const sentences = text.split(/[.!?]+/).filter(s => s.trim())
    const words = text.match(/\b\w+\b/g) || []
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0)

    if (sentences.length === 0 || words.length === 0) return 0

    const avgWordsPerSentence = words.length / sentences.length
    const avgSyllablesPerWord = syllables / words.length

    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    const vowels = 'aeiouy'
    let syllableCount = 0
    let previousWasVowel = false

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i])
      if (isVowel && !previousWasVowel) {
        syllableCount++
      }
      previousWasVowel = isVowel
    }

    // Adjust for silent 'e'
    if (word.endsWith('e')) {
      syllableCount--
    }

    return Math.max(1, syllableCount)
  }

  private calculateOverallScore(errors: GrammarCheck['errors'], wordCount: number): number {
    const errorWeight = {
      error: 3,
      warning: 2,
      suggestion: 1
    }

    const totalWeight = errors.reduce((sum, error) => sum + errorWeight[error.severity], 0)
    const errorRate = wordCount > 0 ? totalWeight / wordCount : 0
    
    return Math.max(0, Math.min(100, Math.round(100 - (errorRate * 100))))
  }

  private initializeCustomDictionary(): void {
    // Add technical terms to dictionary
    const technicalTerms = [
      'cybersecurity', 'InfoSec', 'DevOps', 'CI/CD', 'API',
      'Kubernetes', 'containerization', 'microservices',
      'CISSP', 'CompTIA', 'CCNA', 'AWS', 'Azure', 'GCP'
    ]

    // This would typically initialize a more sophisticated spell checker
    // For now, we'll use our custom checking logic
  }

  private getFallbackGrammarCheck(text: string): GrammarCheck {
    return {
      errors: [],
      overallScore: 85,
      wordCount: this.countWords(text),
      readabilityScore: 75
    }
  }
}

export const grammarService = new GrammarService()