import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | null
  touched?: boolean
  icon?: React.ReactNode
  success?: boolean
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, touched, icon, success, className, ...props }, ref) => {
    const showError = touched && error
    const showSuccess = touched && !error && success

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-3 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              'w-full py-3 border rounded-lg focus:outline-none transition-colors',
              icon ? 'pl-10 pr-10' : 'px-4',
              showError
                ? 'border-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/10'
                : showSuccess
                ? 'border-green-500 focus:border-green-500 bg-green-50 dark:bg-green-900/10'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-dynamic-green dark:focus:border-dynamic-green',
              'text-gray-900 dark:text-white',
              className
            )}
            {...props}
          />
          
          <AnimatePresence>
            {showError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
              </motion.div>
            )}
            
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <AnimatePresence>
          {showError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

export default FormInput