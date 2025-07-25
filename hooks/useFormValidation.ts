import { useState, useCallback } from 'react'

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  message?: string
}

interface ValidationRules {
  [field: string]: ValidationRule
}

interface ValidationErrors {
  [field: string]: string | null
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = useCallback((name: string, value: any): string | null => {
    const fieldRules = rules[name]
    if (!fieldRules) return null

    if (fieldRules.required && !value) {
      return fieldRules.message || 'This field is required'
    }

    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      return fieldRules.message || `Minimum length is ${fieldRules.minLength}`
    }

    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      return fieldRules.message || `Maximum length is ${fieldRules.maxLength}`
    }

    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      return fieldRules.message || 'Invalid format'
    }

    if (fieldRules.custom) {
      return fieldRules.custom(value)
    }

    return null
  }, [rules])

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [touched, validateField])

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, values[name])
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [values, validateField])

  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors = {}
    let isValid = true

    Object.keys(rules).forEach(name => {
      const error = validateField(name, values[name])
      if (error) {
        newErrors[name] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched(Object.keys(rules).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    
    return isValid
  }, [rules, values, validateField])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.values(errors).every(error => !error)
  }
}