import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, Search, Loader2 } from 'lucide-react'
import { useSearch } from '../context/SearchContext'

export default function SearchOverlay() {
  const { isOpen, closeSearch, query, setQuery, results, loading, searchProducts } = useSearch()
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      searchProducts(query)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, searchProducts])

  if (!isOpen) return null

  // Helper to get the first image from array or fallback
  const getImage = (product) => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0]
    }
    if (product.image_url) {
      return product.image_url
    }
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: 'rgba(15, 15, 15, 0.98)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '120px',
    }}>
      <button
        onClick={closeSearch}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          padding: '8px',
        }}
      >
        <X size={28} />
      </button>

      <div style={{ width: '100%', maxWidth: '700px', padding: '0 24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '2px solid rgba(212,175,55,0.3)',
          paddingBottom: '16px',
        }}>
          <Search size={24} color="#D4AF37" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: '24px',
              fontWeight: 300,
              letterSpacing: '0.05em',
            }}
          />
          {loading && <Loader2 size={20} color="#D4AF37" style={{ animation: 'spin 1s linear infinite' }} />}
        </div>

        {results.length > 0 && (
          <div style={{
            marginTop: '32px',
            display: 'grid',
            gap: '16px',
            maxHeight: '60vh',
            overflowY: 'auto',
          }}>
            {results.map(product => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                onClick={closeSearch}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                }}
              >
                <img
                  src={getImage(product)}
                  alt={product.name}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'
                  }}
                />
                <div>
                  <p style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 500 }}>{product.name}</p>
                  <p style={{ color: '#D4AF37', fontSize: '14px', marginTop: '4px' }}>
                    ₦{Number(product.price).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '48px', fontSize: '16px' }}>
            No products found for "{query}"
          </p>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}