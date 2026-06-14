import { useEffect, useState, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import api from '../api/axios'

const PARTICLES = [
  { left: 45, top: 12, size: 2, delay: 0, duration: 12 },
  { left: 62, top: 28, size: 1, delay: 2, duration: 15 },
  { left: 78, top: 8, size: 2, delay: 4, duration: 18 },
  { left: 55, top: 45, size: 1, delay: 1, duration: 14 },
  { left: 88, top: 35, size: 2, delay: 6, duration: 16 },
  { left: 42, top: 62, size: 1, delay: 3, duration: 20 },
  { left: 70, top: 55, size: 2, delay: 5, duration: 13 },
  { left: 82, top: 72, size: 1, delay: 7, duration: 17 },
]

const FALLBACK_PRODUCT = {
  id: 'featured-fallback',
  name: 'Velario Elite Runner',
  price: 299,
  originalPrice: 399,
  images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80'],
}

export default function FeaturedSection() {
  const [product, setProduct] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const sectionRef = useRef(null)
  const imageRef = useRef(null)

  const displayProduct = product || FALLBACK_PRODUCT

  useEffect(() => {
    api.get('/products/featured')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setProduct(res.data[0])
        }
      })
      .catch(err => {
        console.error('Featured product error:', err.message)
      })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || window.innerWidth < 1024) return
    
    const handleMove = (e) => {
      if (!imageRef.current) return
      const rect = imageRef.current.getBoundingClientRect()
      setMousePos({
        x: (e.clientX - rect.left - rect.width / 2) / rect.width,
        y: (e.clientY - rect.top - rect.height / 2) / rect.height,
      })
    }
    
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [isVisible])

  const priceDisplay = useMemo(() => {
    const price = displayProduct.price ?? 299
    const originalPrice = displayProduct.originalPrice
    const hasDiscount = originalPrice && originalPrice > price
    
    return (
      <div className="flex items-baseline gap-3">
        <span className="text-[#B8941F] text-2xl sm:text-3xl font-bold tracking-tight">
          ${typeof price === 'number' ? price.toFixed(2) : price}
        </span>
        {hasDiscount && (
          <span className="text-black/20 text-sm line-through">
            ${typeof originalPrice === 'number' ? originalPrice.toFixed(2) : originalPrice}
          </span>
        )}
      </div>
    )
  }, [displayProduct])

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 sm:py-32 lg:py-40 bg-[#FAFAFA] overflow-hidden"
    >
      {/* Ambient glow */}
      <div 
        className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none hidden lg:block"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: `translate(0, -50%) translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
          transition: 'transform 1.5s ease-out',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#D4AF37]"
            style={{
              width: p.size + 'px',
              height: p.size + 'px',
              left: p.left + '%',
              top: p.top + '%',
              opacity: 0.06,
              animation: `float ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            {/* Label */}
            <div 
              className="flex items-center gap-3 mb-5 sm:mb-7"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div className="w-8 sm:w-12 h-[1px] bg-[#D4AF37]" />
              <span className="text-[#B8941F] text-[10px] sm:text-xs tracking-[0.35em] font-semibold uppercase">
                Featured Collection
              </span>
            </div>

            {/* Title Line 1 */}
            <div className="overflow-hidden mb-1">
              <h2 
                className="text-[#1a1a1a] font-black leading-[0.9] tracking-tight"
                style={{
                  fontSize: 'clamp(36px, 7vw, 72px)',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(110%)',
                  transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: '80ms',
                }}
              >
                ENGINEERED
              </h2>
            </div>

            {/* Title Line 2 — SOLID GOLD, no gradient hack */}
            <div className="overflow-hidden mb-5 sm:mb-7">
              <h2 
                className="text-[#B8941F] font-black leading-[0.9] tracking-tight"
                style={{
                  fontSize: 'clamp(36px, 7vw, 72px)',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(110%)',
                  transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: '180ms',
                }}
              >
                FOR EXCELLENCE
              </h2>
            </div>

            {/* Description */}
            <p 
              className="text-black/50 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-md"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: '300ms',
              }}
            >
              Every pair is crafted with precision, built for comfort and made to stand out. 
              Experience the perfect blend of style and performance.
            </p>

            {/* Price & Badge */}
            <div 
              className="flex items-center gap-5 mb-6 sm:mb-8"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: '400ms',
              }}
            >
              {priceDisplay}
              <div className="w-px h-5 bg-black/10" />
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#B8941F]" strokeWidth={1.5} />
                <span className="text-black/30 text-xs tracking-wider uppercase">Premium</span>
              </div>
            </div>

            {/* CTAs */}
            <div 
              className="flex flex-col sm:flex-row items-start gap-3 sm:gap-5"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: '500ms',
              }}
            >
              <Link
                to={`/product/${displayProduct.id}`}
                className="group inline-flex items-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 bg-[#1a1a1a] hover:bg-black text-white text-[11px] sm:text-xs font-black tracking-[0.2em] rounded-xl no-underline transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                DISCOVER NOW
                <span className="w-4 h-[1px] bg-white/30 group-hover:w-7 group-hover:bg-white/50 transition-all duration-500" />
              </Link>
              
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-black/30 hover:text-black/60 text-[11px] sm:text-xs tracking-[0.15em] uppercase font-medium no-underline transition-all duration-500 py-3.5 sm:py-4 group"
              >
                <span className="w-4 h-[1px] bg-black/20 group-hover:w-7 group-hover:bg-[#B8941F]/40 transition-all duration-500" />
                View All
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative flex items-center justify-center">
            {/* Concentric rings */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1)' : 'scale(0.85)',
                transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: '250ms',
              }}
            >
              <div className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] lg:w-[440px] lg:h-[440px] border border-[#D4AF37]/[0.1] rounded-full" />
              <div className="absolute w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] lg:w-[340px] lg:h-[340px] border border-[#D4AF37]/[0.06] rounded-full" />
              <div className="absolute w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] lg:w-[240px] lg:h-[240px] border border-[#D4AF37]/[0.04] rounded-full" />
            </div>

            {/* Product image */}
            <div 
              ref={imageRef}
              className="relative z-10"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: '150ms',
              }}
            >
              <img
                src={displayProduct.images?.[0] || 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80'}
                alt={displayProduct.name || 'Featured product'}
                className="w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[380px] mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                style={{
                  transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px) rotate(${mousePos.x * 1.5}deg)`,
                  transition: 'transform 0.5s ease-out',
                }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'
                }}
              />
              
              {/* NEW badge */}
              <div 
                className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 bg-[#D4AF37] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] font-black tracking-wider uppercase shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'scale(1)' : 'scale(0)',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: '500ms',
                }}
              >
                NEW
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-black/[0.06]" />

      <style>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          5% { opacity: 0.06; }
          95% { opacity: 0.06; }
          100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
        }
      `}</style>
    </section>
  )
}