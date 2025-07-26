'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, TrendingUp, Info, DollarSign, MapPin, Briefcase, Shield, Award } from 'lucide-react'

interface SalaryCalculatorProps {
  onClose: () => void
}

interface SalaryData {
  role: string
  clearance: string
  location: string
  experience: string
  certifications: string[]
  baseSalary: number
  clearanceBonus: number
  locationMultiplier: number
  experienceBonus: number
  certificationBonus: number
  totalSalary: number
}

const roles = [
  { value: 'network-admin', label: 'Network Administrator', base: 75000 },
  { value: 'sys-admin', label: 'Systems Administrator', base: 80000 },
  { value: 'cyber-analyst', label: 'Cybersecurity Analyst', base: 95000 },
  { value: 'cloud-engineer', label: 'Cloud Engineer', base: 110000 },
  { value: 'devops', label: 'DevOps Engineer', base: 115000 },
  { value: 'data-engineer', label: 'Data Engineer', base: 105000 },
  { value: 'security-engineer', label: 'Security Engineer', base: 115000 },
  { value: 'solutions-architect', label: 'Solutions Architect', base: 130000 },
  { value: 'project-manager', label: 'IT Project Manager', base: 110000 },
  { value: 'program-manager', label: 'Program Manager', base: 125000 }
]

const clearanceLevels = [
  { value: 'none', label: 'No Clearance', bonus: 0 },
  { value: 'public-trust', label: 'Public Trust', bonus: 5000 },
  { value: 'secret', label: 'Secret', bonus: 10000 },
  { value: 'ts', label: 'Top Secret', bonus: 20000 },
  { value: 'ts-sci', label: 'TS/SCI', bonus: 30000 },
  { value: 'ts-sci-poly', label: 'TS/SCI w/ Poly', bonus: 40000 }
]

const locations = [
  { value: 'dc-metro', label: 'DC Metro Area', multiplier: 1.20 },
  { value: 'maryland', label: 'Maryland (Non-Metro)', multiplier: 1.10 },
  { value: 'virginia', label: 'Virginia (Non-Metro)', multiplier: 1.10 },
  { value: 'colorado', label: 'Colorado', multiplier: 1.05 },
  { value: 'california', label: 'California', multiplier: 1.25 },
  { value: 'texas', label: 'Texas', multiplier: 0.95 },
  { value: 'florida', label: 'Florida', multiplier: 0.90 },
  { value: 'remote', label: 'Remote', multiplier: 1.00 },
  { value: 'other', label: 'Other', multiplier: 0.95 }
]

const experienceLevels = [
  { value: 'entry', label: '0-2 years', bonus: 0 },
  { value: 'mid', label: '3-5 years', bonus: 15000 },
  { value: 'senior', label: '6-10 years', bonus: 30000 },
  { value: 'lead', label: '10-15 years', bonus: 45000 },
  { value: 'principal', label: '15+ years', bonus: 60000 }
]

const certificationsList = [
  { value: 'security-plus', label: 'Security+', bonus: 3000 },
  { value: 'network-plus', label: 'Network+', bonus: 2000 },
  { value: 'cissp', label: 'CISSP', bonus: 8000 },
  { value: 'ccna', label: 'CCNA', bonus: 3000 },
  { value: 'ccnp', label: 'CCNP', bonus: 5000 },
  { value: 'aws-sa', label: 'AWS Solutions Architect', bonus: 6000 },
  { value: 'aws-security', label: 'AWS Security', bonus: 5000 },
  { value: 'azure-admin', label: 'Azure Administrator', bonus: 5000 },
  { value: 'pmp', label: 'PMP', bonus: 6000 },
  { value: 'ceh', label: 'CEH', bonus: 4000 },
  { value: 'linux-plus', label: 'Linux+', bonus: 3000 },
  { value: 'casp', label: 'CASP+', bonus: 5000 }
]

export default function SalaryCalculator({ onClose }: SalaryCalculatorProps) {
  const [role, setRole] = useState('network-admin')
  const [clearance, setClearance] = useState('secret')
  const [location, setLocation] = useState('dc-metro')
  const [experience, setExperience] = useState('mid')
  const [certifications, setCertifications] = useState<string[]>([])

  const calculateSalary = (): SalaryData => {
    const selectedRole = roles.find(r => r.value === role)!
    const selectedClearance = clearanceLevels.find(c => c.value === clearance)!
    const selectedLocation = locations.find(l => l.value === location)!
    const selectedExperience = experienceLevels.find(e => e.value === experience)!
    
    const baseSalary = selectedRole.base
    const clearanceBonus = selectedClearance.bonus
    const experienceBonus = selectedExperience.bonus
    const certificationBonus = certifications.reduce((total, cert) => {
      const certification = certificationsList.find(c => c.value === cert)
      return total + (certification?.bonus || 0)
    }, 0)
    
    const subtotal = baseSalary + clearanceBonus + experienceBonus + certificationBonus
    const totalSalary = Math.round(subtotal * selectedLocation.multiplier)
    
    return {
      role: selectedRole.label,
      clearance: selectedClearance.label,
      location: selectedLocation.label,
      experience: selectedExperience.label,
      certifications,
      baseSalary,
      clearanceBonus,
      locationMultiplier: selectedLocation.multiplier,
      experienceBonus,
      certificationBonus,
      totalSalary
    }
  }

  const salaryData = calculateSalary()

  const handleCertificationToggle = (cert: string) => {
    setCertifications(prev => 
      prev.includes(cert) 
        ? prev.filter(c => c !== cert)
        : [...prev, cert]
    )
  }

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
        className="bg-white dark:bg-command-black rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-montserrat font-bold">Cleared IT Salary Calculator</h3>
            <p className="text-gray-600 dark:text-gray-400">Estimate your market value based on current industry data</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Briefcase size={16} className="inline mr-1" />
                Job Role
              </label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                {roles.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Clearance Level */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Shield size={16} className="inline mr-1" />
                Security Clearance
              </label>
              <select 
                value={clearance} 
                onChange={(e) => setClearance(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                {clearanceLevels.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <MapPin size={16} className="inline mr-1" />
                Location
              </label>
              <select 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                {locations.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <TrendingUp size={16} className="inline mr-1" />
                Experience Level
              </label>
              <select 
                value={experience} 
                onChange={(e) => setExperience(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                {experienceLevels.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Award size={16} className="inline mr-1" />
                Certifications
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                {certificationsList.map(cert => (
                  <label key={cert.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={certifications.includes(cert.value)}
                      onChange={() => handleCertificationToggle(cert.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{cert.label}</span>
                    <span className="ml-auto text-xs text-gray-500">+${cert.bonus.toLocaleString()}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h4 className="font-semibold mb-4 text-lg">Salary Breakdown</h4>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Base Salary ({salaryData.role})</span>
                <span className="font-medium">${salaryData.baseSalary.toLocaleString()}</span>
              </div>
              
              {salaryData.clearanceBonus > 0 && (
                <div className="flex justify-between text-dynamic-green">
                  <span>Clearance Premium ({salaryData.clearance})</span>
                  <span className="font-medium">+${salaryData.clearanceBonus.toLocaleString()}</span>
                </div>
              )}
              
              {salaryData.experienceBonus > 0 && (
                <div className="flex justify-between text-dynamic-blue">
                  <span>Experience Bonus ({salaryData.experience})</span>
                  <span className="font-medium">+${salaryData.experienceBonus.toLocaleString()}</span>
                </div>
              )}
              
              {salaryData.certificationBonus > 0 && (
                <div className="flex justify-between text-emerald-green">
                  <span>Certification Bonuses</span>
                  <span className="font-medium">+${salaryData.certificationBonus.toLocaleString()}</span>
                </div>
              )}
              
              {salaryData.locationMultiplier !== 1 && (
                <div className="flex justify-between text-sky-blue">
                  <span>Location Adjustment ({salaryData.location})</span>
                  <span className="font-medium">×{salaryData.locationMultiplier}</span>
                </div>
              )}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>Estimated Total Salary</span>
                  <span className="text-dynamic-green">${salaryData.totalSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Salary Range */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
              <h5 className="font-medium mb-2">Expected Salary Range</h5>
              <div className="flex items-center justify-between text-sm">
                <span>Low (-15%)</span>
                <span>Average</span>
                <span>High (+15%)</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>${Math.round(salaryData.totalSalary * 0.85).toLocaleString()}</span>
                <span className="text-dynamic-green">${salaryData.totalSalary.toLocaleString()}</span>
                <span>${Math.round(salaryData.totalSalary * 1.15).toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mt-2 relative">
                <motion.div 
                  className="h-full bg-gradient-to-r from-sky-blue to-dynamic-green rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1 }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-dynamic-green rounded-full"></div>
              </div>
            </div>

            {/* Market Insights */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="text-yellow-600 dark:text-yellow-400 mr-2 mt-1" size={16} />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Market Insights</p>
                  <ul className="text-yellow-700 dark:text-yellow-400 space-y-1">
                    <li>• Salaries in the cleared space are typically 10-30% higher than commercial</li>
                    <li>• TS/SCI with Poly holders command the highest premiums</li>
                    <li>• Remote positions may offer lower base but better work-life balance</li>
                    <li>• Consider total compensation including benefits and bonuses</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <strong>Disclaimer:</strong> These estimates are based on industry averages and may vary based on specific company, contract requirements, and individual qualifications. Use this as a starting point for salary negotiations.
          </p>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Data updated: January 2025
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors"
            >
              Close Calculator
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}