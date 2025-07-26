'use client';

import { CheckCircle, Circle } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
  userType: 'job_seeker' | 'employer' | null;
}

export default function OnboardingProgress({ 
  currentStep, 
  totalSteps, 
  progress,
  userType 
}: OnboardingProgressProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {userType === 'employer' ? 'Employer' : 'Job Seeker'} Setup
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{progress}%</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">Complete</p>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="relative flex justify-between">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${index < currentStep 
                      ? 'bg-primary text-white' 
                      : index === currentStep
                      ? 'bg-primary text-white ring-4 ring-primary/20'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }
                    transition-all duration-300
                  `}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}