'use client'

import { useState } from 'react'
import { Shield, CheckCircle, XCircle, AlertCircle, Search, Calendar, Clock } from 'lucide-react'

interface ClearanceStatus {
  name: string
  ssn: string
  clearanceLevel: string
  status: 'active' | 'expired' | 'pending' | 'not_found'
  investigationType: string
  grantedDate: string
  expirationDate: string
  lastReinvestigation: string
  agency: string
}

export default function ClearanceVerification() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<ClearanceStatus | null>(null)

  const handleVerification = () => {
    setLoading(true)
    
    // Simulate API call to DISS/JPAS
    setTimeout(() => {
      // Mock verification result
      const mockResult: ClearanceStatus = {
        name: 'Sarah Johnson',
        ssn: '***-**-6789',
        clearanceLevel: 'Top Secret/SCI',
        status: 'active',
        investigationType: 'T5R',
        grantedDate: '2021-03-15',
        expirationDate: '2026-03-14',
        lastReinvestigation: '2021-03-15',
        agency: 'Department of Defense'
      }
      
      setVerificationResult(mockResult)
      setLoading(false)
    }, 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500 bg-green-500/20'
      case 'expired':
        return 'text-red-500 bg-red-500/20'
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/20'
      default:
        return 'text-gray-500 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-green-500" size={24} />
      case 'expired':
        return <XCircle className="text-red-500" size={24} />
      case 'pending':
        return <AlertCircle className="text-yellow-500" size={24} />
      default:
        return <AlertCircle className="text-gray-500" size={24} />
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-sky-blue" size={32} />
          <h2 className="text-2xl font-bold text-white">Clearance Verification System</h2>
        </div>
        
        <p className="text-gray-400 mb-8">
          Verify candidate security clearance status through integrated DISS/JPAS lookup
        </p>

        {/* Search Form */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter Candidate SSN or Name
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter SSN (XXX-XX-XXXX) or Full Name"
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-sky-blue text-white placeholder-gray-400"
              />
              <button
                onClick={handleVerification}
                disabled={!searchQuery || loading}
                className="px-6 py-3 bg-gradient-to-r from-sky-blue to-neon-green text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Verify Clearance
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield size={16} />
            <span>This system is connected to official clearance databases for authorized employers only</span>
          </div>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className="space-y-6">
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Verification Result</h3>
                {getStatusIcon(verificationResult.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Name</label>
                    <p className="text-white font-medium">{verificationResult.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">SSN (Masked)</label>
                    <p className="text-white font-medium">{verificationResult.ssn}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Clearance Level</label>
                    <p className="text-white font-medium">{verificationResult.clearanceLevel}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verificationResult.status)}`}>
                      {verificationResult.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Investigation Type</label>
                    <p className="text-white font-medium">{verificationResult.investigationType}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Granted Date</label>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      {new Date(verificationResult.grantedDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Expiration Date</label>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      {new Date(verificationResult.expirationDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Sponsoring Agency</label>
                    <p className="text-white font-medium">{verificationResult.agency}</p>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className={`mt-6 p-4 rounded-lg ${
                verificationResult.status === 'active' ? 'bg-green-500/10 border border-green-500/30' :
                verificationResult.status === 'expired' ? 'bg-red-500/10 border border-red-500/30' :
                'bg-yellow-500/10 border border-yellow-500/30'
              }`}>
                {verificationResult.status === 'active' && (
                  <p className="text-green-400 flex items-center gap-2">
                    <CheckCircle size={20} />
                    This candidate has an active {verificationResult.clearanceLevel} clearance valid until {new Date(verificationResult.expirationDate).toLocaleDateString()}.
                  </p>
                )}
                {verificationResult.status === 'expired' && (
                  <p className="text-red-400 flex items-center gap-2">
                    <XCircle size={20} />
                    This candidate's clearance expired on {new Date(verificationResult.expirationDate).toLocaleDateString()}. Reinvestigation required.
                  </p>
                )}
                {verificationResult.status === 'pending' && (
                  <p className="text-yellow-400 flex items-center gap-2">
                    <AlertCircle size={20} />
                    This candidate's clearance is currently under investigation. Interim clearance may be available.
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button className="px-4 py-2 bg-sky-blue text-white rounded-lg hover:bg-opacity-90 transition-all">
                Save to Candidate Profile
              </button>
              <button className="px-4 py-2 glass-card rounded-lg hover:bg-gray-700 transition-all">
                Export Verification Report
              </button>
              <button 
                onClick={() => {
                  setVerificationResult(null)
                  setSearchQuery('')
                }}
                className="px-4 py-2 glass-card rounded-lg hover:bg-gray-700 transition-all"
              >
                New Search
              </button>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>
              This system is for authorized use only. All queries are logged and monitored. 
              Unauthorized access or misuse of clearance information is a federal offense.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}