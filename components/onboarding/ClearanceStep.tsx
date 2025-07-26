'use client';

import { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowRight, ArrowLeft, Shield, Calendar, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const clearanceLevels = [
  { value: 'secret', label: 'Secret', description: 'Valid for 10 years' },
  { value: 'top_secret', label: 'Top Secret', description: 'Valid for 5 years' },
  { value: 'ts_sci', label: 'TS/SCI', description: 'Top Secret with SCI eligibility' },
  { value: 'public_trust', label: 'Public Trust', description: 'Position of trust clearance' },
  { value: 'none', label: 'No Clearance', description: 'Willing to obtain clearance' },
];

const clearanceStatuses = [
  { value: 'active', label: 'Active', description: 'Currently active and in use' },
  { value: 'current', label: 'Current', description: 'Valid but not currently in use' },
  { value: 'expired', label: 'Expired', description: 'Needs reinvestigation' },
  { value: 'in_process', label: 'In Process', description: 'Currently being investigated' },
];

export default function ClearanceStep() {
  const { nextStep, previousStep, updateProfileData, profileData } = useOnboarding();
  const [formData, setFormData] = useState({
    clearanceLevel: profileData.clearanceLevel || '',
    clearanceStatus: profileData.clearanceStatus || '',
    clearanceDate: profileData.clearanceDate || '',
    polygraphType: profileData.polygraphType || '',
    polygraphDate: profileData.polygraphDate || '',
    willingToObtain: profileData.willingToObtain || false,
  });

  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.clearanceLevel) {
      newErrors.clearanceLevel = 'Please select your clearance level';
    }
    
    if (formData.clearanceLevel !== 'none' && !formData.clearanceStatus) {
      newErrors.clearanceStatus = 'Please select your clearance status';
    }
    
    if (formData.clearanceLevel !== 'none' && formData.clearanceStatus === 'active' && !formData.clearanceDate) {
      newErrors.clearanceDate = 'Please provide the date your clearance was granted';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateProfileData(formData);
      nextStep();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Security Clearance Information
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your clearance information helps us match you with appropriate opportunities
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Clearance Level *
          </label>
          <div className="space-y-3">
            {clearanceLevels.map((level) => (
              <label
                key={level.value}
                className={`
                  flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${formData.clearanceLevel === level.value
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <input
                  type="radio"
                  name="clearanceLevel"
                  value={level.value}
                  checked={formData.clearanceLevel === level.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className={`
                    w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                    ${formData.clearanceLevel === level.value
                      ? 'border-primary'
                      : 'border-gray-400'
                    }
                  `}>
                    {formData.clearanceLevel === level.value && (
                      <div className="w-3 h-3 bg-primary rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {level.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {level.description}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.clearanceLevel && (
            <p className="mt-2 text-sm text-red-500">{errors.clearanceLevel}</p>
          )}
        </div>

        {formData.clearanceLevel && formData.clearanceLevel !== 'none' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Clearance Status *
              </label>
              <select
                name="clearanceStatus"
                value={formData.clearanceStatus}
                onChange={handleChange}
                className={`
                  w-full px-4 py-2 border rounded-lg
                  ${errors.clearanceStatus ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-primary focus:border-transparent
                `}
              >
                <option value="">Select status</option>
                {clearanceStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label} - {status.description}
                  </option>
                ))}
              </select>
              {errors.clearanceStatus && (
                <p className="mt-1 text-sm text-red-500">{errors.clearanceStatus}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Clearance Grant Date {formData.clearanceStatus === 'active' && '*'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="clearanceDate"
                  value={formData.clearanceDate}
                  onChange={handleChange}
                  className={`
                    w-full pl-10 pr-4 py-2 border rounded-lg
                    ${errors.clearanceDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-primary focus:border-transparent
                  `}
                />
              </div>
              {errors.clearanceDate && (
                <p className="mt-1 text-sm text-red-500">{errors.clearanceDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Polygraph Type (if applicable)
              </label>
              <select
                name="polygraphType"
                value={formData.polygraphType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">No polygraph</option>
                <option value="ci">Counterintelligence (CI)</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="full_scope">Full Scope</option>
              </select>
            </div>
          </>
        )}

        {formData.clearanceLevel === 'none' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="willingToObtain"
                    checked={formData.willingToObtain}
                    onChange={handleChange}
                    className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I am willing to obtain a security clearance if required
                  </span>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Many positions offer sponsorship for clearance processing
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={previousStep}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 
              rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
              transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg 
              font-medium hover:bg-primary-dark transition-colors"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}