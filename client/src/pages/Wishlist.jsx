import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useState, useEffect, useRef } from 'react'

const getProductImage = (product) => {
  if (!product) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0]
  }
  if (typeof product.images === 'string' && product.images.length > 0) {
    return product.images
  }
  if (product.image_url) {
    return product.image_url
  }
  return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'
}

// Safe price formatter
const formatPrice = (price) => {
  const num = Number(price || 0)
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

export default function Wishlist() {
  const { wishlist, removeFromWishlist, loading } = useWishlist()
  const { addToCart } = useCart()
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.05 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#B8941F] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm tracking-wider">Loading...</p>
        </div>
      </div>
    )
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 flex items-center justify-center">
        <div 
          className="text-center px-6"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-8">
            <Heart size={32} className="text-white/15" strokeWidth={1} />
          </div>
          <h2 className="text-white text-2xl sm:text-3xl font-black tracking-tight mb-3">
            Your Wishlist is Empty
          </h2>
          <p className="text-white/40 text-sm sm:text-base mb-10 max-w-sm mx-auto leading-relaxed">
            Save items you love and they'll appear here for quick access.
          </p>
          <Link 
            to="/shop" 
            className="group inline-flex items-center gap-3 px-10 py-4 bg-[#B8941F] hover:bg-[#c9a42f] text-[#0a0a0a] text-[11px] font-black tracking-[0.2em] rounded-xl no-underline transition-all duration-500 hover:shadow-[0_10px_40px_rgba(184,148,31,0.25)] hover:-translate-y-0.5"
          >
            BROWSE PRODUCTS
            <span className="w-4 h-[1px] bg-[#0a0a0a]/30 group-hover:w-7 group-hover:bg-[#0a0a0a]/50 transition-all duration-500" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div ref={sectionRef} className="min-h-screen bg-[#0a0a0a] pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div 
          className="flex items-center gap-3 mb-4"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="w-8 sm:w-12 h-[1px] bg-[#B8941F]" />
          <span className="text-[#B8941F] text-[10px] sm:text-xs tracking-[0.35em] font-semibold uppercase">
            Saved Items
          </span>
        </div>
        
        <h1 
          className="text-white font-black tracking-tight mb-12 sm:mb-16"
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: '100ms',
          }}
        >
          MY WISHLIST
        </h1>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {wishlist.map((product, i) => {
            const imageUrl = getProductImage(product)
            const price = formatPrice(product.price)
            
            return (
              <div 
                key={product.id} 
                className="group relative bg-[#141414] rounded-2xl overflow-hidden border border-white/[0.04] hover:border-[#B8941F]/20 transition-all duration-700"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${150 + i * 80}ms`,
                }}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                  <img 
                    src={imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    loading={i < 4 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'
                    }}
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-[#1a1a1a]/90 backdrop-blur-sm flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>

                  {/* Quick add — appears on hover */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 py-2.5 bg-[#B8941F] backdrop-blur-sm rounded-xl text-[#0a0a0a] text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#c9a42f] transition-all duration-300 shadow-[0_2px_8px_rgba(184,148,31,0.3)]"
                    >
                      <ShoppingBag size={13} strokeWidth={1.5} />
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 sm:p-5">
                  <p className="text-white/30 text-[10px] tracking-[0.15em] uppercase font-medium mb-1">
                    {product.category || 'Footwear'}
                  </p>
                  <Link 
                    to={`/product/${product.id}`} 
                    className="text-white text-sm font-medium block mb-2.5 line-clamp-1 hover:text-[#B8941F] transition-colors duration-300 no-underline"
                  >
                    {product.name}
                  </Link>
                  <p className="text-[#B8941F] font-bold text-base tracking-tight">
                    ${price}
                  </p>
                </div>

                {/* Bottom gold accent */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B8941F]/0 group-hover:bg-[#B8941F]/60 transition-all duration-500" />
              </div>
            )
          })}
        </div>

        {/* Continue shopping */}
        <div 
          className="flex justify-center mt-14 sm:mt-20"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: '600ms',
          }}
        >
          <Link
            to="/shop"
            className="group inline-flex items-center gap-3 px-10 py-4 bg-[#B8941F] hover:bg-[#c9a42f] text-[#0a0a0a] text-[11px] font-black tracking-[0.2em] rounded-xl no-underline transition-all duration-500 hover:shadow-[0_10px_40px_rgba(184,148,31,0.25)] hover:-translate-y-0.5"
          >
            CONTINUE SHOPPING
            <span className="w-4 h-[1px] bg-[#0a0a0a]/30 group-hover:w-7 group-hover:bg-[#0a0a0a]/50 transition-all duration-500" />
          </Link>
        </div>
      </div>
    </div>
  )
}