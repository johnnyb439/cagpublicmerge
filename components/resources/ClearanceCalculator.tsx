'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface ClearanceCalculatorProps {
  onClose: () => void
}

export default function ClearanceCalculator({ onClose }: ClearanceCalculatorProps) {
  const [clearanceType, setClearanceType] = useState('secret')
  const [hasInterim, setHasInterim] = useState(false)
  const [hasPriorInvestigation, setHasPriorInvestigation] = useState(false)
  const [complexity, setComplexity] = useState('standard')

  const calculateTimeline = () => {
    let baseTime = clearanceType === 'secret' ? 3 : 9 // months
    
    if (hasPriorInvestigation) baseTime *= 0.7
    if (complexity === 'complex') baseTime *= 1.5
    
    const interimTime = hasInterim ? 0.5 : 0
    
    return {
      interim: interimTime,
      total: Math.round(baseTime * 10) / 10
    }
  }

  const timeline = calculateTimeline()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-command-black rounded-2xl max-w-lg w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-montserrat font-bold">Clearance Timeline Calculator</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Clearance Level</label>
            <select 
              value={clearanceType} 
              onChange={(e) => setClearanceType(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="secret">Secret</option>
              <option value="topsecret">Top Secret</option>
              <option value="tssci">TS/SCI</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <input
                type="checkbox"
                checked={hasInterim}
                onChange={(e) => setHasInterim(e.target.checked)}
                className="mr-2"
              />
              Interim clearance requested
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <input
                type="checkbox"
                checked={hasPriorInvestigation}
                onChange={(e) => setHasPriorInvestigation(e.target.checked)}
                className="mr-2"
              />
              Prior investigation within 5 years
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Case Complexity</label>
            <select 
              value={complexity} 
              onChange={(e) => setComplexity(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="standard">Standard (no foreign contacts/travel)</option>
              <option value="complex">Complex (foreign contacts/extensive travel)</option>
            </select>
          </div>

          <div className="bg-emerald-green/10 rounded-lg p-6">
            <h4 className="font-semibold mb-4">Estimated Timeline</h4>
            {hasInterim && (
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span>Interim Clearance</span>
                  <span className="font-semibold">{timeline.interim * 4} - {timeline.interim * 6} weeks</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-sky-blue"
                    initial={{ width: 0 }}
                    animate={{ width: '15%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
            <div>
              <div className="flex justify-between mb-1">
                <span>Full Clearance</span>
                <span className="font-semibold">{Math.round(timeline.total * 0.8)} - {Math.round(timeline.total * 1.2)} months</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-dynamic-green"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Note: These are estimates based on current processing times. Actual timelines may vary based on investigation workload and individual circumstances.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}