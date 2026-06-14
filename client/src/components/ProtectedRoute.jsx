import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Heart, Eye, ArrowUpRight } from 'lucide-react'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function ProductGrid({ title = 'TRENDING NOW', limit = 8, category = '' }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams()
        if (category) params.append('category', category)
        const res = await api.get(`/products?${params}`)
        setProducts(res.data.slice(0, limit))
      } catch (err) {
        console.error('Products fetch error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [category, limit])

  // Intersection observer for entrance animation
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
      <section className="py-24 sm:py-32 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-[#F0F0F0] rounded-2xl h-[380px] animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 bg-[#FAFAFA] overflow-hidden">
      {/* Subtle top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-black/[0.04]" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div 
          className="text-center mb-14 sm:mb-20"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-8 sm:w-12 h-[1px] bg-[#B8941F]" />
            <span className="text-[#B8941F] text-[10px] sm:text-xs tracking-[0.35em] font-semibold uppercase">
              Collection
            </span>
            <div className="w-8 sm:w-12 h-[1px] bg-[#B8941F]" />
          </div>
          <h2 
            className="text-[#1a1a1a] font-black tracking-tight"
            style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
          >
            {title}
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {products.map((product, i) => {
            const inWishlist = isInWishlist(product.id)
            const hasDiscount = product.originalPrice && product.originalPrice > product.price
            
            return (
              <div
                key={product.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-700"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${100 + i * 80}ms`,
                }}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-[#F5F5F5]">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    loading={i < 4 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'
                    }}
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-all duration-500" />

                  {/* Quick Actions — Slide up on hover */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <Link
                      to={`/product/${product.id}`}
                      className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#1a1a1a] hover:bg-[#B8941F] hover:text-white transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                    >
                      <Eye size={15} strokeWidth={1.5} />
                    </Link>
                    <button
                      onClick={() => {
                        const sizes = product.sizes || ['42']
                        addToCart(product, sizes[0])
                      }}
                      className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#1a1a1a] hover:bg-[#B8941F] hover:text-white transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                    >
                      <ShoppingBag size={15} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`w-10 h-10 rounded-xl backdrop-blur-sm flex items-center justify-center transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.08)] ${
                        inWishlist 
                          ? 'bg-[#B8941F] text-white' 
                          : 'bg-white/90 text-[#1a1a1a] hover:bg-[#B8941F] hover:text-white'
                      }`}
                    >
                      <Heart size={15} strokeWidth={1.5} fill={inWishlist ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.is_featured && (
                      <span className="px-2.5 py-1 bg-[#B8941F] text-white text-[9px] font-bold tracking-wider uppercase rounded-lg">
                        Featured
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="px-2.5 py-1 bg-[#1a1a1a] text-white text-[9px] font-bold tracking-wider uppercase rounded-lg">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </span>
                    )}
                    {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                      <span className="px-2.5 py-1 bg-red-500/90 text-white text-[9px] font-bold tracking-wider uppercase rounded-lg">
                        Low Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 sm:p-5">
                  <p className="text-black/30 text-[10px] tracking-[0.15em] uppercase font-medium mb-1">
                    {product.category}
                  </p>
                  <h3 className="text-[#1a1a1a] text-sm sm:text-base font-medium mb-2.5 line-clamp-1 group-hover:text-[#B8941F] transition-colors duration-300">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#1a1a1a] font-bold text-base sm:text-lg tracking-tight">
                      ${product.price?.toFixed(2) || '0.00'}
                    </span>
                    {hasDiscount && (
                      <span className="text-black/20 text-xs line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B8941F]/0 group-hover:bg-[#B8941F]/40 transition-all duration-500" />
              </div>
            )
          })}
        </div>

        {/* View All Button */}
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
            className="group inline-flex items-center gap-3 px-10 py-4 bg-[#1a1a1a] hover:bg-black text-white text-[11px] sm:text-xs font-black tracking-[0.2em] rounded-xl no-underline transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            VIEW ALL PRODUCTS
            <span className="w-4 h-[1px] bg-white/30 group-hover:w-7 group-hover:bg-white/50 transition-all duration-500" />
          </Link>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-black/[0.04]" />
    </section>
  )
}