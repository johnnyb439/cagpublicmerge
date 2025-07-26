import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Shortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  description: string
  action: () => void
}

export function useKeyboardShortcuts() {
  const router = useRouter()

  // Check if device is mobile/touch
  const isMobile = typeof window !== 'undefined' && 
    (window.innerWidth <= 768 || 
     'ontouchstart' in window || 
     navigator.maxTouchPoints > 0)

  const shortcuts: Shortcut[] = [
    {
      key: 'k',
      ctrl: true,
      description: 'Open search',
      action: () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement
        searchInput?.focus()
      }
    },
    {
      key: 'h',
      ctrl: true,
      description: 'Go to home',
      action: () => router.push('/')
    },
    {
      key: 'j',
      ctrl: true,
      description: 'Go to jobs',
      action: () => router.push('/jobs')
    },
    {
      key: 'd',
      ctrl: true,
      description: 'Go to dashboard',
      action: () => router.push('/dashboard')
    },
    {
      key: 'm',
      ctrl: true,
      description: 'Start mock interview',
      action: () => router.push('/mock-interview')
    },
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: () => {
        const event = new CustomEvent('showKeyboardShortcuts')
        window.dispatchEvent(event)
      }
    },
    {
      key: 'Escape',
      description: 'Close modals/dialogs',
      action: () => {
        const event = new CustomEvent('closeAllModals')
        window.dispatchEvent(event)
      }
    },
    {
      key: '/',
      description: 'Focus search',
      action: () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput && document.activeElement !== searchInput) {
          searchInput.focus()
          return
        }
      }
    }
  ]

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow Escape key to work in inputs
      if (event.key !== 'Escape') {
        return
      }
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey
      const altMatch = shortcut.alt ? event.altKey : !event.altKey
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
      
      return keyMatch && ctrlMatch && altMatch && shiftMatch
    })

    if (matchingShortcut) {
      event.preventDefault()
      matchingShortcut.action()
    }
  }, [router])

  useEffect(() => {
    // Don't add keyboard shortcuts on mobile devices
    if (isMobile) {
      return
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, isMobile])

  return isMobile ? [] : shortcuts
}