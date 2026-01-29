import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import type { Note } from '../../types/note'

interface SearchBarProps {
  onResults: (notes: Note[]) => void
  placeholder?: string
}

export default function SearchBar({ onResults, placeholder = 'Search notes...' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.trim().length === 0) {
      onResults([])
      return
    }

    const performSearch = async () => {
      setIsSearching(true)
      try {
        const response = await window.api.search.query(debouncedQuery)
        if (response.success && response.data) {
          onResults(response.data)
        }
      } catch (err) {
        console.error('Search error:', err)
        onResults([])
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedQuery]) // 移除 onResults 依赖

  const handleClear = () => {
    setQuery('')
    onResults([])
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-10 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {isSearching && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
        </div>
      )}
    </div>
  )
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
