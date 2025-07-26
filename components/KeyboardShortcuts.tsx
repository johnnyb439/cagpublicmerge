'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Command } from 'lucide-react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)
  const shortcuts = useKeyboardShortcuts()

  useEffect(() => {
    const handleShowShortcuts = () => setIsOpen(true)
    const handleCloseModals = () => setIsOpen(false)

    window.addEventListener('showKeyboardShortcuts', handleShowShortcuts)
    window.addEventListener('closeAllModals', handleCloseModals)

    return () => {
      window.removeEventListener('showKeyboardShortcuts', handleShowShortcuts)
      window.removeEventListener('closeAllModals', handleCloseModals)
    }
  }, [])

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  const formatKey = (shortcut: any) => {
    const keys = []
    if (shortcut.ctrl) keys.push(isMac ? '⌘' : 'Ctrl')
    if (shortcut.alt) keys.push(isMac ? '⌥' : 'Alt')
    if (shortcut.shift) keys.push(isMac ? '⇧' : 'Shift')
    keys.push(shortcut.key === ' ' ? 'Space' : shortcut.key)
    return keys
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-command-black rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Command className="w-6 h-6 text-dynamic-green" />
                  <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto">
                <div className="grid gap-4">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <div className="flex gap-1">
                        {formatKey(shortcut).map((key, i) => (
                          <kbd
                            key={i}
                            className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Press <kbd className="px-2 py-1 mx-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">?</kbd> 
                    at any time to show this help dialog.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}