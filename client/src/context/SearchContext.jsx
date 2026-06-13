import { createContext, useContext, useState, useCallback } from 'react'

const SearchContext = createContext()

// API_URL should be http://localhost:5000/api (includes /api)
// So we only need /products/search, NOT /api/products/search
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function SearchProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const searchProducts = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      // FIXED: removed extra /api — was /api/api/products/search
      const res = await fetch(
        `${API_URL}/products/search?q=${encodeURIComponent(searchQuery)}`
      )
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Search failed: ${res.status}`)
      }
      const data = await res.json()
      setResults(data)
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const openSearch = () => setIsOpen(true)
  const closeSearch = () => {
    setIsOpen(false)
    setQuery('')
    setResults([])
  }

  return (
    <SearchContext.Provider value={{
      isOpen, openSearch, closeSearch,
      query, setQuery,
      results, loading,
      searchProducts
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be inside SearchProvider')
  return ctx
}