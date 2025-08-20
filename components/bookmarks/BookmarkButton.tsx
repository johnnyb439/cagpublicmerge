'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck, Heart, Star } from 'lucide-react'
import { useBookmarks, type Bookmark as BookmarkType } from './BookmarkProvider'

interface BookmarkButtonProps {
  entityId: string
  type: BookmarkType['type']
  title: string
  description?: string
  url?: string
  thumbnail?: string
  variant?: 'bookmark' | 'heart' | 'star'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
  onBookmark?: () => void
  onUnbookmark?: () => void
}

export default function BookmarkButton({
  entityId,
  type,
  title,
  description,
  url,
  thumbnail,
  variant = 'bookmark',
  size = 'md',
  showLabel = false,
  className = '',
  onBookmark,
  onUnbookmark
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const [isAnimating, setIsAnimating] = useState(false)
  const bookmarked = isBookmarked(entityId, type)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsAnimating(true)
    toggleBookmark(entityId, type, {
      title,
      description,
      url,
      thumbnail
    })
    
    if (bookmarked) {
      onUnbookmark?.()
    } else {
      onBookmark?.()
    }
    
    setTimeout(() => setIsAnimating(false), 300)
  }

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  const getIcon = () => {
    const iconSize = iconSizes[size]
    
    switch (variant) {
      case 'heart':
        return bookmarked ? (
          <Heart className="text-red-500 fill-red-500" size={iconSize} />
        ) : (
          <Heart className="text-gray-500 hover:text-red-500" size={iconSize} />
        )
      case 'star':
        return bookmarked ? (
          <Star className="text-yellow-500 fill-yellow-500" size={iconSize} />
        ) : (
          <Star className="text-gray-500 hover:text-yellow-500" size={iconSize} />
        )
      default:
        return bookmarked ? (
          <BookmarkCheck className="text-dynamic-green fill-dynamic-green" size={iconSize} />
        ) : (
          <Bookmark className="text-gray-500 hover:text-dynamic-green" size={iconSize} />
        )
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        rounded-lg
        transition-all
        duration-200
        hover:bg-gray-100
        dark:hover:bg-gray-800
        ${isAnimating ? 'scale-125' : 'scale-100'}
        ${showLabel ? 'flex items-center space-x-2' : ''}
        ${className}
      `}
      title={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      aria-label={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      {getIcon()}
      {showLabel && (
        <span className="text-sm font-medium">
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </button>
  )
}