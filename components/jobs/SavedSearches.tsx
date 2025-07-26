'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Search, Trash2, Bell, BellOff, Edit2, Check, X } from 'lucide-react'
import { JobFilters } from './AdvancedFilters'
import { secureStorage } from '@/lib/security/secureStorage'

export interface SavedSearch {
  id: string
  name: string
  filters: JobFilters
  alertsEnabled: boolean
  createdAt: string
  lastUsed?: string
  matchCount?: number
}

interface SavedSearchesProps {
  currentFilters: JobFilters
  onLoadSearch: (filters: JobFilters) => void
}

export default function SavedSearches({ currentFilters, onLoadSearch }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  useEffect(() => {
    loadSavedSearches()
  }, [])

  const loadSavedSearches = async () => {
    try {
      const searches = await secureStorage.getItem('savedJobSearches') || []
      setSavedSearches(searches)
    } catch (error) {
      console.error('Error loading saved searches:', error)
    }
  }

  const saveCurrentSearch = async () => {
    if (!searchName.trim()) return

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      filters: currentFilters,
      alertsEnabled: false,
      createdAt: new Date().toISOString()
    }

    try {
      const updatedSearches = [...savedSearches, newSearch]
      await secureStorage.setItem('savedJobSearches', updatedSearches, true)
      setSavedSearches(updatedSearches)
      setSearchName('')
      setShowSaveForm(false)
    } catch (error) {
      console.error('Error saving search:', error)
    }
  }

  const deleteSearch = async (id: string) => {
    try {
      const updatedSearches = savedSearches.filter(s => s.id !== id)
      await secureStorage.setItem('savedJobSearches', updatedSearches, true)
      setSavedSearches(updatedSearches)
    } catch (error) {
      console.error('Error deleting search:', error)
    }
  }

  const toggleAlerts = async (id: string) => {
    try {
      const updatedSearches = savedSearches.map(s =>
        s.id === id ? { ...s, alertsEnabled: !s.alertsEnabled } : s
      )
      await secureStorage.setItem('savedJobSearches', updatedSearches, true)
      setSavedSearches(updatedSearches)
    } catch (error) {
      console.error('Error toggling alerts:', error)
    }
  }

  const updateSearchName = async (id: string) => {
    if (!editingName.trim()) return

    try {
      const updatedSearches = savedSearches.map(s =>
        s.id === id ? { ...s, name: editingName } : s
      )
      await secureStorage.setItem('savedJobSearches', updatedSearches, true)
      setSavedSearches(updatedSearches)
      setEditingId(null)
      setEditingName('')
    } catch (error) {
      console.error('Error updating search name:', error)
    }
  }

  const loadSearch = (search: SavedSearch) => {
    onLoadSearch(search.filters)
    // Update last used
    const updatedSearches = savedSearches.map(s =>
      s.id === search.id ? { ...s, lastUsed: new Date().toISOString() } : s
    )
    secureStorage.setItem('savedJobSearches', updatedSearches, true)
    setSavedSearches(updatedSearches)
  }

  return (
    <div className="glass-card rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Saved Searches</h3>
        <button
          onClick={() => setShowSaveForm(!showSaveForm)}
          className="px-4 py-2 bg-sky-blue text-white rounded-lg hover:bg-sky-blue/90 transition-colors flex items-center gap-2"
        >
          <Save size={16} />
          Save Current Search
        </button>
      </div>

      {/* Save Form */}
      <AnimatePresence>
        {showSaveForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name your search..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveCurrentSearch()}
                className="flex-1 px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-sky-blue"
              />
              <button
                onClick={saveCurrentSearch}
                className="px-4 py-2 bg-neon-green text-black rounded-lg hover:bg-neon-green/90 transition-colors"
              >
                <Check size={20} />
              </button>
              <button
                onClick={() => {
                  setShowSaveForm(false)
                  setSearchName('')
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Searches List */}
      <div className="space-y-2">
        {savedSearches.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No saved searches yet</p>
        ) : (
          savedSearches.map((search) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex-1">
                {editingId === search.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && updateSearchName(search.id)}
                      className="px-2 py-1 bg-gray-900 text-white rounded border border-gray-600 focus:outline-none focus:border-sky-blue"
                    />
                    <button
                      onClick={() => updateSearchName(search.id)}
                      className="text-neon-green hover:text-neon-green/80"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditingName('')
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Search size={16} className="text-gray-400" />
                    <div>
                      <p className="text-white font-medium">{search.name}</p>
                      <p className="text-xs text-gray-400">
                        Created {new Date(search.createdAt).toLocaleDateString()}
                        {search.lastUsed && ` • Last used ${new Date(search.lastUsed).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadSearch(search)}
                  className="px-3 py-1 text-sm bg-sky-blue text-white rounded hover:bg-sky-blue/90 transition-colors"
                >
                  Load
                </button>
                <button
                  onClick={() => toggleAlerts(search.id)}
                  className={`p-2 rounded transition-colors ${
                    search.alertsEnabled
                      ? 'text-neon-green hover:text-neon-green/80'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title={search.alertsEnabled ? 'Alerts enabled' : 'Alerts disabled'}
                >
                  {search.alertsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                </button>
                <button
                  onClick={() => {
                    setEditingId(search.id)
                    setEditingName(search.name)
                  }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => deleteSearch(search.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Alert Information */}
      {savedSearches.some(s => s.alertsEnabled) && (
        <div className="mt-4 p-3 bg-neon-green/20 border border-neon-green/50 rounded-lg">
          <p className="text-sm text-neon-green">
            ✓ Email alerts are enabled for {savedSearches.filter(s => s.alertsEnabled).length} saved searches
          </p>
        </div>
      )}
    </div>
  )
}