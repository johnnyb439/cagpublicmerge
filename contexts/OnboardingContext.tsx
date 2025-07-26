'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  required: boolean;
  completed: boolean;
}

interface OnboardingContextType {
  currentStep: number;
  steps: OnboardingStep[];
  userType: 'job_seeker' | 'employer' | null;
  profileData: any;
  isLoading: boolean;
  progress: number;
  setUserType: (type: 'job_seeker' | 'employer') => void;
  updateProfileData: (data: any) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  completeStep: (stepId: string) => void;
  saveProgress: () => Promise<void>;
  resumeOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

const JOB_SEEKER_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Let\'s get you started on your cleared career journey',
    component: 'WelcomeStep',
    required: true,
    completed: false,
  },
  {
    id: 'basic_info',
    title: 'Basic Information',
    description: 'Tell us about yourself',
    component: 'BasicInfoStep',
    required: true,
    completed: false,
  },
  {
    id: 'clearance',
    title: 'Security Clearance',
    description: 'Verify your clearance level',
    component: 'ClearanceStep',
    required: true,
    completed: false,
  },
  {
    id: 'experience',
    title: 'Work Experience',
    description: 'Add your professional experience',
    component: 'ExperienceStep',
    required: true,
    completed: false,
  },
  {
    id: 'skills',
    title: 'Skills Assessment',
    description: 'Highlight your technical skills',
    component: 'SkillsStep',
    required: true,
    completed: false,
  },
  {
    id: 'preferences',
    title: 'Job Preferences',
    description: 'Set your job search preferences',
    component: 'PreferencesStep',
    required: false,
    completed: false,
  },
  {
    id: 'resume',
    title: 'Resume Upload',
    description: 'Upload your resume for better matches',
    component: 'ResumeStep',
    required: false,
    completed: false,
  },
  {
    id: 'complete',
    title: 'All Set!',
    description: 'Your profile is ready',
    component: 'CompleteStep',
    required: true,
    completed: false,
  },
];

const EMPLOYER_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Let\'s set up your employer account',
    component: 'WelcomeStep',
    required: true,
    completed: false,
  },
  {
    id: 'company_info',
    title: 'Company Information',
    description: 'Tell us about your organization',
    component: 'CompanyInfoStep',
    required: true,
    completed: false,
  },
  {
    id: 'verification',
    title: 'Verification',
    description: 'Verify your organization',
    component: 'VerificationStep',
    required: true,
    completed: false,
  },
  {
    id: 'hiring_needs',
    title: 'Hiring Needs',
    description: 'What positions are you looking to fill?',
    component: 'HiringNeedsStep',
    required: true,
    completed: false,
  },
  {
    id: 'complete',
    title: 'Ready to Hire!',
    description: 'Start finding cleared talent',
    component: 'CompleteStep',
    required: true,
    completed: false,
  },
];

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const supabase = useSupabase();
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<'job_seeker' | 'employer' | null>(null);
  const [profileData, setProfileData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);

  useEffect(() => {
    if (userType === 'job_seeker') {
      setSteps([...JOB_SEEKER_STEPS]);
    } else if (userType === 'employer') {
      setSteps([...EMPLOYER_STEPS]);
    }
  }, [userType]);

  useEffect(() => {
    loadOnboardingState();
  }, [session]);

  const loadOnboardingState = async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (data && !data.completed) {
        setUserType(data.user_type);
        setCurrentStep(data.current_step);
        setProfileData(data.profile_data || {});
        
        const savedSteps = data.user_type === 'job_seeker' ? [...JOB_SEEKER_STEPS] : [...EMPLOYER_STEPS];
        const completedSteps = data.completed_steps || [];
        
        const updatedSteps = savedSteps.map(step => ({
          ...step,
          completed: completedSteps.includes(step.id)
        }));
        
        setSteps(updatedSteps);
      }
    } catch (error) {
      console.error('Error loading onboarding state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async () => {
    if (!session?.user || !userType) return;

    const completedSteps = steps.filter(step => step.completed).map(step => step.id);

    try {
      await supabase
        .from('user_onboarding')
        .upsert({
          user_id: session.user.id,
          user_type: userType,
          current_step: currentStep,
          completed_steps: completedSteps,
          profile_data: profileData,
          completed: currentStep === steps.length - 1,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  };

  const updateProfileData = (data: any) => {
    setProfileData((prev: any) => ({ ...prev, ...data }));
  };

  const completeStep = (stepId: string) => {
    setSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      completeStep(steps[currentStep].id);
      setCurrentStep(prev => prev + 1);
      saveProgress();
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipStep = () => {
    if (!steps[currentStep]?.required && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      saveProgress();
    }
  };

  const completeOnboarding = async () => {
    if (!session?.user) return;

    try {
      await supabase
        .from('user_onboarding')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('user_id', session.user.id);

      await supabase
        .from('users')
        .update({ 
          onboarding_completed: true,
          ...profileData 
        })
        .eq('id', session.user.id);

      router.push(userType === 'employer' ? '/employer/dashboard' : '/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const resumeOnboarding = () => {
    router.push('/onboarding');
  };

  const resetOnboarding = async () => {
    if (!session?.user) return;

    try {
      await supabase
        .from('user_onboarding')
        .delete()
        .eq('user_id', session.user.id);

      setCurrentStep(0);
      setUserType(null);
      setProfileData({});
      setSteps([]);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  const progress = steps.length > 0 
    ? Math.round((steps.filter(step => step.completed).length / steps.length) * 100)
    : 0;

  const value: OnboardingContextType = {
    currentStep,
    steps,
    userType,
    profileData,
    isLoading,
    progress,
    setUserType,
    updateProfileData,
    nextStep,
    previousStep,
    skipStep,
    completeStep,
    saveProgress,
    resumeOnboarding,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};