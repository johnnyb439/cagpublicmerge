'use client'

import { useState, useMemo } from 'react'
import { 
  Bookmark, Search, Filter, Download, Upload, Trash2, 
  Edit2, Plus, X, Grid, List, FolderOpen, Tag,
  Calendar, Clock, Star, Heart, Briefcase, Building,
  FileText, User, ExternalLink, Copy, Share2
} from 'lucide-react'
import { useBookmarks } from '@/components/bookmarks/BookmarkProvider'
import BookmarkButton from '@/components/bookmarks/BookmarkButton'

export default function BookmarksPage() {
  const {
    bookmarks,
    collections,
    removeBookmark,
    updateBookmark,
    createCollection,
    updateCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    getCollectionBookmarks,
    searchBookmarks,
    exportBookmarks,
    importBookmarks
  } = useBookmarks()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCollection, setSelectedCollection] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateCollection, setShowCreateCollection] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<string | null>(null)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'type'>('recent')

  // Filter and sort bookmarks
  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks

    // Apply search
    if (searchQuery) {
      filtered = searchBookmarks(searchQuery)
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(b => b.type === selectedType)
    }

    // Apply collection filter
    if (selectedCollection !== 'all') {
      const collectionBookmarks = getCollectionBookmarks(selectedCollection)
      filtered = filtered.filter(b => collectionBookmarks.includes(b))
    }

    // Sort
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'type':
        filtered.sort((a, b) => a.type.localeCompare(b.type))
        break
      case 'recent':
      default:
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }

    return filtered
  }, [bookmarks, searchQuery, selectedType, selectedCollection, sortBy, searchBookmarks, getCollectionBookmarks])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job': return <Briefcase size={16} />
      case 'company': return <Building size={16} />
      case 'article': return <FileText size={16} />
      case 'profile': return <User size={16} />
      default: return <Bookmark size={16} />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job': return 'text-blue-500'
      case 'company': return 'text-purple-500'
      case 'article': return 'text-green-500'
      case 'profile': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  const handleExport = () => {
    const data = exportBookmarks()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        importBookmarks(event.target?.result as string)
        alert('Bookmarks imported successfully!')
      } catch (error) {
        alert('Failed to import bookmarks. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      createCollection({
        name: newCollectionName,
        description: newCollectionDescription,
        bookmarks: [],
        isPublic: false
      })
      setNewCollectionName('')
      setNewCollectionDescription('')
      setShowCreateCollection(false)
    }
  }

  const handleShare = (bookmark: any) => {
    const shareUrl = `${window.location.origin}${bookmark.url || `/bookmarks/${bookmark.id}`}`
    navigator.clipboard.writeText(shareUrl)
    alert('Link copied to clipboard!')
  }

  const bookmarkStats = {
    total: bookmarks.length,
    jobs: bookmarks.filter(b => b.type === 'job').length,
    companies: bookmarks.filter(b => b.type === 'company').length,
    articles: bookmarks.filter(b => b.type === 'article').length,
    profiles: bookmarks.filter(b => b.type === 'profile').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-dynamic-green to-dynamic-blue bg-clip-text text-transparent mb-4">
            My Bookmarks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your saved jobs, companies, articles, and more
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-command-black rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{bookmarkStats.total}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              </div>
              <Bookmark className="text-gray-400" size={24} />
            </div>
          </div>
          <div className="bg-white dark:bg-command-black rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{bookmarkStats.jobs}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Jobs</p>
              </div>
              <Briefcase className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white dark:bg-command-black rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{bookmarkStats.companies}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Companies</p>
              </div>
              <Building className="text-purple-500" size={24} />
            </div>
          </div>
          <div className="bg-white dark:bg-command-black rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{bookmarkStats.articles}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Articles</p>
              </div>
              <FileText className="text-green-500" size={24} />
            </div>
          </div>
          <div className="bg-white dark:bg-command-black rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{collections.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Collections</p>
              </div>
              <FolderOpen className="text-orange-500" size={24} />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-command-black rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
              />
            </div>

            {/* Filters and Actions */}
            <div className="flex items-center gap-2">
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="job">Jobs</option>
                <option value="company">Companies</option>
                <option value="article">Articles</option>
                <option value="profile">Profiles</option>
                <option value="resource">Resources</option>
              </select>

              {/* Collection Filter */}
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <option value="all">All Collections</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <option value="recent">Recent</option>
                <option value="alphabetical">A-Z</option>
                <option value="type">Type</option>
              </select>

              {/* View Mode */}
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-dynamic-green text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-dynamic-green text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
              >
                <List size={20} />
              </button>

              {/* Actions */}
              <button
                onClick={() => setShowCreateCollection(true)}
                className="p-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green"
                title="Create Collection"
              >
                <Plus size={20} />
              </button>
              <button
                onClick={handleExport}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Export Bookmarks"
              >
                <Download size={20} />
              </button>
              <label className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                <Upload size={20} />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Bookmarks Grid/List */}
        {filteredBookmarks.length === 0 ? (
          <div className="bg-white dark:bg-command-black rounded-lg shadow p-12 text-center">
            <Bookmark className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No bookmarks found</p>
            <p className="text-sm text-gray-500 mt-2">Start bookmarking items to see them here</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white dark:bg-command-black rounded-lg shadow hover:shadow-lg transition-shadow p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={getTypeColor(bookmark.type)}>
                      {getTypeIcon(bookmark.type)}
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {bookmark.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleShare(bookmark)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      title="Share"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={() => setEditingBookmark(bookmark.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2">{bookmark.title}</h3>
                
                {bookmark.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {bookmark.description}
                  </p>
                )}

                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {bookmark.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Clock size={14} />
                    <span>{new Date(bookmark.createdAt).toLocaleDateString()}</span>
                  </div>
                  {bookmark.url && (
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-dynamic-green hover:underline"
                    >
                      <span>View</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Collection Modal */}
        {showCreateCollection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-command-black rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Create Collection</h2>
                <button
                  onClick={() => setShowCreateCollection(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    placeholder="My Collection"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description (optional)</label>
                  <textarea
                    value={newCollectionDescription}
                    onChange={(e) => setNewCollectionDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    rows={3}
                    placeholder="A collection of..."
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowCreateCollection(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCollection}
                    className="px-4 py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}