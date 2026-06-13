import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  // Get user-specific cart key
  const getCartKey = () => {
    const user = JSON.parse(localStorage.getItem('velario_user') || 'null')
    return user ? `velario_cart_${user.id}` : 'velario_cart_guest'
  }

  const [cart, setCart] = useState(() => {
    const key = getCartKey()
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : []
  })

  // Listen for user changes (login/logout) and switch cart
  useEffect(() => {
    const handleStorage = () => {
      const key = getCartKey()
      const saved = localStorage.getItem(key)
      setCart(saved ? JSON.parse(saved) : [])
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Save cart when it changes
  useEffect(() => {
    const key = getCartKey()
    localStorage.setItem(key, JSON.stringify(cart))
  }, [cart])

  const addToCart = (product, size, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id && item.size === size)
      if (existing) {
        return prev.map(item =>
          item.productId === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        size,
        quantity,
      }]
    })
  }

  const removeFromCart = (productId, size) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.size === size)))
  }

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size)
      return
    }
    setCart(prev => prev.map(item =>
      item.productId === productId && item.size === size
        ? { ...item, quantity }
        : item
    ))
  }

  const clearCart = () => {
    setCart([])
    const key = getCartKey()
    localStorage.removeItem(key)
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)