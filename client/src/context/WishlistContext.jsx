import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const WishlistContext = createContext()

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function WishlistProvider({ children }) {
  const { user, token } = useAuth()
  const [wishlist, setWishlist] = useState([])
  const [wishlistIds, setWishlistIds] = useState(new Set())
  const [loading, setLoading] = useState(false)

  console.log('🔧 WishlistContext mounted')
  console.log('👤 User:', user?.id, 'Token exists:', !!token)

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const fetchWishlist = useCallback(async () => {
    console.log('📡 fetchWishlist called. User:', user?.id, 'Token:', !!token)
    if (!user || !token) {
      console.log('❌ No user or token, skipping fetch')
      setWishlist([])
      setWishlistIds(new Set())
      return
    }
    setLoading(true)
    try {
      const url = `${API_URL}/wishlist`
      console.log('🌐 Fetching:', url)
      const res = await fetch(url, { headers })
      console.log('📥 Response status:', res.status)
      const data = await res.json()
      console.log('📦 Response data:', data)
      if (!res.ok) throw new Error(data.error || `Failed: ${res.status}`)
      setWishlist(data)
      setWishlistIds(new Set(data.map(p => p.id)))
    } catch (err) {
      console.error('💥 Wishlist fetch error:', err.message)
    } finally {
      setLoading(false)
    }
  }, [user, token])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const addToWishlist = async (productId) => {
    console.log('❤️ addToWishlist called. Product:', productId, 'User:', user?.id)
    if (!user) {
      console.log('❌ No user, cannot add')
      return false
    }
    try {
      const url = `${API_URL}/wishlist`
      console.log('🌐 POST to:', url, 'Body:', { productId })
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId })
      })
      console.log('📥 POST status:', res.status)
      const data = await res.json()
      console.log('📦 POST response:', data)
      if (res.ok) {
        setWishlistIds(prev => new Set([...prev, productId]))
        await fetchWishlist()
        return true
      }
    } catch (err) {
      console.error('💥 Add wishlist error:', err)
    }
    return false
  }

  const removeFromWishlist = async (productId) => {
    console.log('💔 removeFromWishlist called. Product:', productId)
    if (!user) return false
    try {
      const url = `${API_URL}/wishlist/${productId}`
      console.log('🌐 DELETE to:', url)
      const res = await fetch(url, {
        method: 'DELETE',
        headers
      })
      console.log('📥 DELETE status:', res.status)
      if (res.ok) {
        setWishlistIds(prev => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
        await fetchWishlist()
        return true
      }
    } catch (err) {
      console.error('💥 Remove wishlist error:', err)
    }
    return false
  }

  const toggleWishlist = async (productId) => {
    console.log('🔄 toggleWishlist. Product:', productId, 'Currently in wishlist:', wishlistIds.has(productId))
    if (wishlistIds.has(productId)) {
      return removeFromWishlist(productId)
    } else {
      return addToWishlist(productId)
    }
  }

  const isInWishlist = (productId) => wishlistIds.has(productId)

  return (
    <WishlistContext.Provider value={{
      wishlist,
      wishlistIds,
      wishlistCount: wishlist.length,
      loading,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      refreshWishlist: fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider')
  return ctx
}