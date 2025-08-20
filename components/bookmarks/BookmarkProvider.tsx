'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

export interface Bookmark {
  id: string
  type: 'job' | 'company' | 'article' | 'resource' | 'profile'
  entityId: string
  title: string
  description?: string
  url?: string
  thumbnail?: string
  tags?: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

interface BookmarkCollection {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  bookmarks: string[] // bookmark IDs
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

interface BookmarkContextType {
  bookmarks: Bookmark[]
  collections: BookmarkCollection[]
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => string
  removeBookmark: (id: string) => void
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void
  isBookmarked: (entityId: string, type: Bookmark['type']) => boolean
  toggleBookmark: (entityId: string, type: Bookmark['type'], data?: Partial<Bookmark>) => void
  getBookmarksByType: (type: Bookmark['type']) => Bookmark[]
  getBookmark: (id: string) => Bookmark | undefined
  createCollection: (collection: Omit<BookmarkCollection, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateCollection: (id: string, updates: Partial<BookmarkCollection>) => void
  deleteCollection: (id: string) => void
  addToCollection: (bookmarkId: string, collectionId: string) => void
  removeFromCollection: (bookmarkId: string, collectionId: string) => void
  getCollectionBookmarks: (collectionId: string) => Bookmark[]
  searchBookmarks: (query: string) => Bookmark[]
  exportBookmarks: () => string
  importBookmarks: (data: string) => void
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined)

export function useBookmarks() {
  const context = useContext(BookmarkContext)
  if (!context) {
    throw new Error('useBookmarks must be used within BookmarkProvider')
  }
  return context
}

interface BookmarkProviderProps {
  children: ReactNode
}

export function BookmarkProvider({ children }: BookmarkProviderProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [collections, setCollections] = useState<BookmarkCollection[]>([])

  // Load bookmarks and collections from localStorage on mount
  useEffect(() => {
    const storedBookmarks = localStorage.getItem('cag-bookmarks')
    const storedCollections = localStorage.getItem('cag-bookmark-collections')
    
    if (storedBookmarks) {
      try {
        const parsed = JSON.parse(storedBookmarks)
        setBookmarks(parsed.map((b: any) => ({
          ...b,
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt)
        })))
      } catch (error) {
        console.error('Failed to load bookmarks:', error)
      }
    }
    
    if (storedCollections) {
      try {
        const parsed = JSON.parse(storedCollections)
        setCollections(parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt)
        })))
      } catch (error) {
        console.error('Failed to load collections:', error)
      }
    } else {
      // Create default collections
      const defaultCollections: BookmarkCollection[] = [
        {
          id: 'favorites',
          name: 'Favorites',
          description: 'Your favorite items',
          color: '#FFD700',
          icon: 'star',
          bookmarks: [],
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'read-later',
          name: 'Read Later',
          description: 'Items to read later',
          color: '#4169E1',
          icon: 'clock',
          bookmarks: [],
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      setCollections(defaultCollections)
    }
  }, [])

  // Save bookmarks whenever they change
  useEffect(() => {
    if (bookmarks.length > 0) {
      localStorage.setItem('cag-bookmarks', JSON.stringify(bookmarks))
    }
  }, [bookmarks])

  // Save collections whenever they change
  useEffect(() => {
    if (collections.length > 0) {
      localStorage.setItem('cag-bookmark-collections', JSON.stringify(collections))
    }
  }, [collections])

  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setBookmarks(prev => [...prev, newBookmark])
    return newBookmark.id
  }, [])

  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id))
    // Also remove from all collections
    setCollections(prev => prev.map(c => ({
      ...c,
      bookmarks: c.bookmarks.filter(bId => bId !== id)
    })))
  }, [])

  const updateBookmark = useCallback((id: string, updates: Partial<Bookmark>) => {
    setBookmarks(prev => prev.map(b => 
      b.id === id ? { ...b, ...updates, updatedAt: new Date() } : b
    ))
  }, [])

  const isBookmarked = useCallback((entityId: string, type: Bookmark['type']) => {
    return bookmarks.some(b => b.entityId === entityId && b.type === type)
  }, [bookmarks])

  const toggleBookmark = useCallback((
    entityId: string, 
    type: Bookmark['type'], 
    data?: Partial<Bookmark>
  ) => {
    const existing = bookmarks.find(b => b.entityId === entityId && b.type === type)
    
    if (existing) {
      removeBookmark(existing.id)
    } else {
      addBookmark({
        type,
        entityId,
        title: data?.title || `${type} ${entityId}`,
        description: data?.description,
        url: data?.url,
        thumbnail: data?.thumbnail,
        tags: data?.tags,
        notes: data?.notes,
        metadata: data?.metadata
      })
    }
  }, [bookmarks, addBookmark, removeBookmark])

  const getBookmarksByType = useCallback((type: Bookmark['type']) => {
    return bookmarks.filter(b => b.type === type)
  }, [bookmarks])

  const getBookmark = useCallback((id: string) => {
    return bookmarks.find(b => b.id === id)
  }, [bookmarks])

  const createCollection = useCallback((collection: Omit<BookmarkCollection, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCollection: BookmarkCollection = {
      ...collection,
      id: `collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setCollections(prev => [...prev, newCollection])
    return newCollection.id
  }, [])

  const updateCollection = useCallback((id: string, updates: Partial<BookmarkCollection>) => {
    setCollections(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
    ))
  }, [])

  const deleteCollection = useCallback((id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id))
  }, [])

  const addToCollection = useCallback((bookmarkId: string, collectionId: string) => {
    setCollections(prev => prev.map(c => 
      c.id === collectionId && !c.bookmarks.includes(bookmarkId)
        ? { ...c, bookmarks: [...c.bookmarks, bookmarkId], updatedAt: new Date() }
        : c
    ))
  }, [])

  const removeFromCollection = useCallback((bookmarkId: string, collectionId: string) => {
    setCollections(prev => prev.map(c => 
      c.id === collectionId
        ? { ...c, bookmarks: c.bookmarks.filter(id => id !== bookmarkId), updatedAt: new Date() }
        : c
    ))
  }, [])

  const getCollectionBookmarks = useCallback((collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId)
    if (!collection) return []
    return bookmarks.filter(b => collection.bookmarks.includes(b.id))
  }, [bookmarks, collections])

  const searchBookmarks = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return bookmarks.filter(b => 
      b.title.toLowerCase().includes(lowerQuery) ||
      b.description?.toLowerCase().includes(lowerQuery) ||
      b.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      b.notes?.toLowerCase().includes(lowerQuery)
    )
  }, [bookmarks])

  const exportBookmarks = useCallback(() => {
    const data = {
      bookmarks,
      collections,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }
    return JSON.stringify(data, null, 2)
  }, [bookmarks, collections])

  const importBookmarks = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data)
      
      if (parsed.bookmarks) {
        const importedBookmarks = parsed.bookmarks.map((b: any) => ({
          ...b,
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt)
        }))
        setBookmarks(prev => [...prev, ...importedBookmarks])
      }
      
      if (parsed.collections) {
        const importedCollections = parsed.collections.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt)
        }))
        setCollections(prev => [...prev, ...importedCollections])
      }
    } catch (error) {
      console.error('Failed to import bookmarks:', error)
      throw new Error('Invalid bookmark data format')
    }
  }, [])

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        collections,
        addBookmark,
        removeBookmark,
        updateBookmark,
        isBookmarked,
        toggleBookmark,
        getBookmarksByType,
        getBookmark,
        createCollection,
        updateCollection,
        deleteCollection,
        addToCollection,
        removeFromCollection,
        getCollectionBookmarks,
        searchBookmarks,
        exportBookmarks,
        importBookmarks
      }}
    >
      {children}
    </BookmarkContext.Provider>
  )
}