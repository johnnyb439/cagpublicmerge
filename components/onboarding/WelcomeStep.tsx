'use client';

import { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Briefcase, Building2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WelcomeStep() {
  const { setUserType, nextStep, userType } = useOnboarding();
  const [selectedType, setSelectedType] = useState<'job_seeker' | 'employer' | null>(userType);

  const handleContinue = () => {
    if (selectedType) {
      setUserType(selectedType);
      nextStep();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Cleared Advisory Group
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Let's get your account set up. First, tell us who you are:
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => setSelectedType('job_seeker')}
          className={`
            relative p-6 rounded-lg border-2 transition-all duration-300
            ${selectedType === 'job_seeker'
              ? 'border-primary bg-primary/5 dark:bg-primary/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }
          `}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-4
              ${selectedType === 'job_seeker'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }
            `}>
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              I'm a Job Seeker
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Looking for cleared positions and career opportunities
            </p>
          </div>
          {selectedType === 'job_seeker' && (
            <div className="absolute top-4 right-4">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </button>

        <button
          onClick={() => setSelectedType('employer')}
          className={`
            relative p-6 rounded-lg border-2 transition-all duration-300
            ${selectedType === 'employer'
              ? 'border-primary bg-primary/5 dark:bg-primary/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }
          `}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-4
              ${selectedType === 'employer'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }
            `}>
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              I'm an Employer
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Looking to hire cleared professionals for my organization
            </p>
          </div>
          {selectedType === 'employer' && (
            <div className="absolute top-4 right-4">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </button>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selectedType}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300
            ${selectedType
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}