'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'select' | 'radio' | 'checkbox';
    required?: boolean;
    options?: { value: string; label: string }[];
    placeholder?: string;
  }[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Help us personalize your experience',
    fields: [
      { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'John' },
      { name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Doe' },
      { name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '(555) 123-4567' },
      { name: 'location', label: 'Location', type: 'text', required: true, placeholder: 'Washington, DC' },
    ]
  },
  {
    id: 'clearance',
    title: 'Security Clearance',
    description: 'Your clearance helps us match you with the right opportunities',
    fields: [
      {
        name: 'clearanceLevel',
        label: 'Clearance Level',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Select your clearance level' },
          { value: 'secret', label: 'Secret' },
          { value: 'top_secret', label: 'Top Secret' },
          { value: 'ts_sci', label: 'TS/SCI' },
          { value: 'public_trust', label: 'Public Trust' },
          { value: 'none', label: 'No Clearance' },
        ]
      },
      {
        name: 'clearanceStatus',
        label: 'Clearance Status',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Select status' },
          { value: 'active', label: 'Active' },
          { value: 'current', label: 'Current' },
          { value: 'expired', label: 'Expired' },
          { value: 'in_process', label: 'In Process' },
        ]
      }
    ]
  },
  {
    id: 'preferences',
    title: 'Job Preferences',
    description: 'Tell us what you\'re looking for',
    fields: [
      {
        name: 'jobType',
        label: 'Preferred Job Type',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Select job type' },
          { value: 'full_time', label: 'Full Time' },
          { value: 'contract', label: 'Contract' },
          { value: 'contract_to_hire', label: 'Contract to Hire' },
          { value: 'part_time', label: 'Part Time' },
        ]
      },
      {
        name: 'remotePreference',
        label: 'Work Location',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Select preference' },
          { value: 'onsite', label: 'On-site' },
          { value: 'remote', label: 'Remote' },
          { value: 'hybrid', label: 'Hybrid' },
          { value: 'flexible', label: 'Flexible' },
        ]
      },
      {
        name: 'salaryRange',
        label: 'Expected Salary Range',
        type: 'select',
        options: [
          { value: '', label: 'Select range' },
          { value: '0-80k', label: '$0 - $80,000' },
          { value: '80k-120k', label: '$80,000 - $120,000' },
          { value: '120k-160k', label: '$120,000 - $160,000' },
          { value: '160k+', label: '$160,000+' },
        ]
      }
    ]
  }
];

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const validateStep = () => {
    const newErrors: any = {};
    const stepFields = currentStepData.fields;

    stepFields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (isLastStep) {
        onComplete(formData);
      } else {
        setCurrentStep(prev => prev + 1);
        setErrors({});
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 
              ${errors[field.name] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:ring-2 focus:ring-primary focus:border-transparent`}
          >
            {field.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 
              ${errors[field.name] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:ring-2 focus:ring-primary focus:border-transparent`}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome to CAG!
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                {ONBOARDING_STEPS.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex-1 h-2 mx-1 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {currentStepData.description}
              </p>

              <div className="space-y-4">
                {currentStepData.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderField(field)}
                    {errors[field.name] && (
                      <p className="mt-1 text-sm text-red-500">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                  ${currentStep === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark"
              >
                {isLastStep ? (
                  <>
                    Complete
                    <Check className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}