'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface DynamicBadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'clearance'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  gradient?: boolean
  className?: string
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  success: 'bg-emerald-green/10 text-emerald-green border-emerald-green/20',
  warning: 'bg-opportunity-orange/10 text-opportunity-orange border-opportunity-orange/20',
  danger: 'bg-patriot-red/10 text-patriot-red border-patriot-red/20',
  info: 'bg-dynamic-blue/10 text-dynamic-blue border-dynamic-blue/20',
  clearance: 'bg-gradient-to-r from-navy-blue/10 to-cyber-cyan/10 text-navy-blue border-navy-blue/20'
}

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
}

export default function DynamicBadge({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  gradient = false,
  className = ''
}: DynamicBadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`
        inline-flex items-center font-medium rounded-full border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${gradient ? 'gradient-border-animated' : ''}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {pulse && (
        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current" />
      )}
      <span className="relative">{children}</span>
    </motion.span>
  )
}

// Specialized clearance badge
export function ClearanceBadge({ level }: { level: string }) {
  const levelColors = {
    'PUBLIC': 'from-gray-400 to-gray-600',
    'SECRET': 'from-emerald-green to-forest-green',
    'TS': 'from-dynamic-blue to-navy-blue',
    'TS/SCI': 'from-navy-blue to-cyber-cyan'
  }

  const gradient = levelColors[level as keyof typeof levelColors] || levelColors.PUBLIC

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className="relative inline-flex items-center"
    >
      <div className={`
        absolute inset-0 bg-gradient-to-r ${gradient} 
        rounded-full blur-sm opacity-50 animate-pulse
      `} />
      <div className={`
        relative px-4 py-2 bg-gradient-to-r ${gradient}
        text-white font-bold text-sm rounded-full
        shadow-lg border border-white/20
      `}>
        {level}
      </div>
    </motion.div>
  )
}

// New job indicator
export function NewBadge() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-opportunity-orange rounded-full animate-ping" />
      <div className="relative px-2 py-1 bg-opportunity-orange text-white text-xs font-bold rounded-full">
        NEW
      </div>
    </motion.div>
  )
}