'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, Brain, CheckCircle, AlertCircle, 
  Clock, Target, Zap, TrendingUp, Download, RefreshCw,
  Lightbulb, Star, Users, Award, ExternalLink
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface ResumeAnalysisResult {
  overallRating: number;
  priority: 'high' | 'medium' | 'low';
  estimatedImprovementTime: string;
  atsScore: {
    overall: number;
    breakdown: {
      keywords: number;
      formatting: number;
      skills: number;
      experience: number;
      education: number;
    };
    recommendations: string[];
  };
  grammarCheck: {
    errors: Array<{
      type: string;
      message: string;
      severity: 'error' | 'warning' | 'suggestion';
    }>;
    overallScore: number;
    wordCount: number;
    readabilityScore: number;
  };
  actionItems: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    impact: number;
  }>;
  keywordAnalysis: {
    missing: string[];
    present: string[];
    suggestions: string[];
    density: Record<string, number>;
  };
  contentAnalysis: {
    sections: Array<{
      name: string;
      present: boolean;
      quality: number;
      suggestions: string[];
    }>;
    achievements: {
      count: number;
      hasQuantifiableResults: boolean;
      suggestions: string[];
    };
    skills: {
      technical: string[];
      soft: string[];
      missing: string[];
      suggestions: string[];
    };
  };
}

export default function AIResumeReviewer() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'quick' | 'comprehensive'>('comprehensive');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      setError('Please provide resume content');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/resume-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: resumeText,
          jobDescription: jobDescription || undefined,
          analysisType,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysisResult(data.data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-green-600';
    if (rating >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <Brain className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Resume Reviewer
          </h1>
        </motion.div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Get instant, AI-powered feedback on your resume with personalized suggestions 
          to improve your chances of landing cleared IT positions.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Resume Upload/Input */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Resume Content
          </h2>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">
              {isDragActive 
                ? 'Drop your resume here...' 
                : 'Drag & drop your resume or click to browse'
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports .txt, .pdf, .doc, .docx files
            </p>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Or paste your resume text here..."
            className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Job Description (Optional) */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Job Description (Optional)
          </h2>
          
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description you're targeting for better analysis..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Analysis Type:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setAnalysisType('quick')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  analysisType === 'quick'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-1" />
                Quick
              </button>
              <button
                onClick={() => setAnalysisType('comprehensive')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  analysisType === 'comprehensive'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Brain className="w-4 h-4 inline mr-1" />
                Comprehensive
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <div className="text-center">
        <button
          onClick={analyzeResume}
          disabled={!resumeText.trim() || isAnalyzing}
          className="bg-primary text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors flex items-center gap-2 mx-auto"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              Analyze Resume
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Analysis Results */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Overall Score */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Overall Analysis</h2>
                <div className="flex items-center gap-2">
                  <div className={`text-3xl font-bold ${getRatingColor(analysisResult.overallRating)}`}>
                    {analysisResult.overallRating}/100
                  </div>
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border ${getPriorityColor(analysisResult.priority)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Priority Level</span>
                  </div>
                  <p className="capitalize">{analysisResult.priority}</p>
                </div>

                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-600">Improvement Time</span>
                  </div>
                  <p className="text-blue-700">{analysisResult.estimatedImprovementTime}</p>
                </div>

                <div className="p-4 rounded-lg border border-purple-200 bg-purple-50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-600">ATS Score</span>
                  </div>
                  <p className="text-purple-700">{analysisResult.atsScore.overall}/100</p>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Recommended Actions
              </h3>
              <div className="space-y-3">
                {analysisResult.actionItems.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getPriorityColor(item.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium uppercase tracking-wide">
                            {item.category}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-white/50">
                            Impact: {item.impact}/10
                          </span>
                        </div>
                        <p className="font-medium">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(item.impact, 5) }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current text-yellow-500" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* ATS Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">ATS Analysis</h3>
                <div className="space-y-3">
                  {Object.entries(analysisResult.atsScore.breakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getRatingColor(value)} bg-current`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getRatingColor(value)}`}>
                          {value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Keywords Analysis</h3>
                {analysisResult.keywordAnalysis.missing.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-red-600 mb-2">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywordAnalysis.missing.slice(0, 10).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {analysisResult.keywordAnalysis.present.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">Present Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywordAnalysis.present.slice(0, 10).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Download/Share Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Next Steps</h3>
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="w-4 h-4" />
                  Share with Mentor
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Award className="w-4 h-4" />
                  Book Coaching Session
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}