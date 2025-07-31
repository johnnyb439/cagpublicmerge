'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export default function AnimatedNumber({
  value,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = ''
}: AnimatedNumberProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => {
    return decimals > 0 
      ? latest.toFixed(decimals)
      : Math.round(latest).toLocaleString()
  })

  useEffect(() => {
    const animation = animate(count, value, { 
      duration,
      ease: "easeOut"
    })

    return animation.stop
  }, [value, duration, count])

  return (
    <motion.span className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </motion.span>
  )
}

// Progress bar with animation
interface AnimatedProgressProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  color?: string
  className?: string
}

export function AnimatedProgress({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'bg-gradient-to-r from-dynamic-blue to-emerald-green',
  className = ''
}: AnimatedProgressProps) {
  const percentage = (value / max) * 100

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">{label}</span>
          {showPercentage && (
            <AnimatedNumber 
              value={percentage} 
              suffix="%" 
              className="text-sm font-medium"
            />
          )}
        </div>
      )}
      <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`absolute top-0 left-0 h-full ${color} rounded-full`}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </motion.div>
      </div>
    </div>
  )
}

// Circular progress
export function CircularProgress({ 
  value, 
  size = 100, 
  strokeWidth = 8,
  color = '#10B981' 
}: { 
  value: number
  size?: number
  strokeWidth?: number
  color?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const progressOffset = ((100 - value) / 100) * circumference
    setOffset(progressOffset)
  }, [value, circumference])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatedNumber
          value={value}
          suffix="%"
          className="text-2xl font-bold"
        />
      </div>
    </div>
  )
}