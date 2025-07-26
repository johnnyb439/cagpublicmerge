'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, Briefcase, User, Phone, Mail, 
  MapPin, DollarSign, MessageSquare, Tag, Send,
  CheckCircle, AlertCircle, X, Plus
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import ProtectedForm from '@/components/security/ProtectedForm';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  clearanceRequired: string;
  salary?: string;
}

interface ApplicationFormProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (applicationId: string) => void;
}

interface FormData {
  jobTitle: string;
  company: string;
  location: string;
  clearanceRequired: string;
  salary: string;
  notes: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  resumeVersion: string;
  coverLetter: boolean;
  referral: string;
  tags: string[];
  isFavorite: boolean;
}

export default function ApplicationForm({ job, isOpen, onClose, onSuccess }: ApplicationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    jobTitle: job.title,
    company: job.company,
    location: job.location,
    clearanceRequired: job.clearanceRequired,
    salary: job.salary || '',
    notes: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    resumeVersion: 'Latest',
    coverLetter: false,
    referral: '',
    tags: [],
    isFavorite: false
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [newTag, setNewTag] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setResumeFile(file);
      setFormData(prev => ({ ...prev, resumeVersion: file.name }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, newTag.trim()] 
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (submittedFormData: FormData, recaptchaToken: string) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Extract form data
      const applicationData = {
        jobId: job.id,
        jobTitle: submittedFormData.get('jobTitle') as string,
        company: submittedFormData.get('company') as string,
        location: submittedFormData.get('location') as string,
        clearanceRequired: submittedFormData.get('clearanceRequired') as string,
        salary: submittedFormData.get('salary') as string,
        notes: submittedFormData.get('notes') as string,
        contactPerson: submittedFormData.get('contactPerson') as string,
        contactEmail: submittedFormData.get('contactEmail') as string,
        contactPhone: submittedFormData.get('contactPhone') as string,
        resumeVersion: resumeFile?.name || 'Latest',
        coverLetter: submittedFormData.get('coverLetter') === 'on',
        referral: submittedFormData.get('referral') as string,
        tags: formData.tags, // Keep using state for tags
        isFavorite: submittedFormData.get('isFavorite') === 'on',
        resumeFile: resumeFile ? {
          name: resumeFile.name,
          size: resumeFile.size,
          type: resumeFile.type,
          content: await fileToBase64(resumeFile)
        } : undefined,
        recaptchaToken
      };

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit application');
      }

      setSubmitStatus('success');
      
      // Call success callback after a brief delay
      setTimeout(() => {
        onSuccess?.(result.data.id);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Application submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit application');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Apply to {job.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {job.company} • {job.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <ProtectedForm 
            onSubmit={handleSubmit} 
            action="job_application"
            className="space-y-6"
            showRecaptchaBadge={false}
          >
            {/* Job Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  defaultValue={formData.jobTitle}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  defaultValue={formData.company}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue={formData.location}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clearance Required
                </label>
                <select
                  name="clearanceRequired"
                  defaultValue={formData.clearanceRequired}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select clearance level</option>
                  <option value="Public Trust">Public Trust</option>
                  <option value="SECRET">SECRET</option>
                  <option value="TOP SECRET">TOP SECRET</option>
                  <option value="TS/SCI">TS/SCI</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salary Range (Optional)
              </label>
              <input
                type="text"
                name="salary"
                defaultValue={formData.salary}
                placeholder="e.g., $80,000 - $120,000"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resume
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  {resumeFile ? (
                    <span className="text-green-600">
                      ✓ {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  ) : isDragActive ? (
                    'Drop your resume here...'
                  ) : (
                    'Drag & drop your resume or click to browse'
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports PDF, DOC, DOCX files (max 5MB)
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Person (Optional)
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  defaultValue={formData.contactPerson}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Email (Optional)
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  defaultValue={formData.contactEmail}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  defaultValue={formData.contactPhone}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                defaultValue={formData.notes}
                rows={4}
                placeholder="Additional notes about this application..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-primary/60 hover:text-primary"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="coverLetter"
                  defaultChecked={formData.coverLetter}
                  className="mr-2 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Cover letter included
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isFavorite"
                  defaultChecked={formData.isFavorite}
                  className="mr-2 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Mark as favorite
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Referral Source (Optional)
              </label>
              <input
                type="text"
                name="referral"
                defaultValue={formData.referral}
                placeholder="e.g., LinkedIn, referral from John Doe, job fair"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Error Display */}
            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700">{errorMessage}</p>
              </motion.div>
            )}

            {/* Success Display */}
            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-700">
                  Application submitted successfully! Confirmation email sent.
                </p>
              </motion.div>
            )}
          </ProtectedForm>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Application Submitted</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}