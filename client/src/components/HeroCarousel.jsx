import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=80',
    title: 'MOVEMENT',
    titleGold: 'WITH STYLE',
    subtitle: 'Footwear designed for those who move with purpose and style.',
    cta: 'SHOP COLLECTION',
    link: '/shop',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1920&q=80',
    title: 'ENGINEERED',
    titleGold: 'FOR EXCELLENCE',
    subtitle: 'Every pair is crafted with precision, built for comfort and made to stand out.',
    cta: 'DISCOVER NOW',
    link: '/shop?category=Men',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1920&q=80',
    title: 'ELEVATE',
    titleGold: 'YOUR GAME',
    subtitle: 'Premium performance footwear that pushes boundaries.',
    cta: 'EXPLORE',
    link: '/shop?category=Women',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1920&q=80',
    title: 'LIMITED',
    titleGold: 'EDITION',
    subtitle: 'Exclusive drops. Rare designs. Only for those who know.',
    cta: 'VIEW DROPS',
    link: '/shop?featured=true',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1920&q=80',
    title: 'STREET',
    titleGold: 'CULTURE',
    subtitle: 'Where urban energy meets luxury craftsmanship.',
    cta: 'SHOP STREET',
    link: '/shop?category=Men',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=1920&q=80',
    title: 'PURE',
    titleGold: 'LUXURY',
    subtitle: 'The finest materials. The boldest statement. Uncompromising quality.',
    cta: 'SHOP LUXURY',
    link: '/shop',
  },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [textVisible, setTextVisible] = useState(true)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [magnetic, setMagnetic] = useState({ x: 0, y: 0 })
  const [breath, setBreath] = useState(0)
  const intervalRef = useRef(null)
  const sectionRef = useRef(null)
  const contentRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 3D Tilt + Mouse tracking
  useEffect(() => {
    if (isMobile) return
    const handleMove = (e) => {
      const rect = sectionRef.current?.getBoundingClientRect()
      if (!rect) return
      
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      
      setMousePos({ x: x - 0.5, y: y - 0.5 })
      setTilt({
        x: (y - 0.5) * -8,
        y: (x - 0.5) * 8,
      })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [isMobile])

  // Breathing ambient glow
  useEffect(() => {
    let raf
    const animate = () => {
      setBreath(prev => prev + 0.015)
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Magnetic CTA effect
  const handleCtaMove = (e) => {
    if (isMobile || !ctaRef.current) return
    const rect = ctaRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setMagnetic({ x: x * 0.25, y: y * 0.25 })
  }

  const handleCtaLeave = () => {
    setMagnetic({ x: 0, y: 0 })
  }

  const goTo = useCallback((index) => {
    if (isAnimating || index === current) return
    setIsAnimating(true)
    setTextVisible(false)
    
    setTimeout(() => {
      setCurrent(index)
      setTimeout(() => {
        setTextVisible(true)
        setIsAnimating(false)
      }, 80)
    }, 600)
  }, [isAnimating, current])

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, goTo])

  // Auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(next, 7000)
    return () => clearInterval(intervalRef.current)
  }, [next])

  // Touch
  const [touchStart, setTouchStart] = useState(null)
  const minSwipe = 50

  const onTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX)
  const onTouchEnd = (e) => {
    if (!touchStart) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (diff > minSwipe) next()
    if (diff < -minSwipe) goTo((current - 1 + slides.length) % slides.length)
    setTouchStart(null)
  }

  // Keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') goTo((current - 1 + slides.length) % slides.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [next, current, goTo])

  const slide = slides[current]

  return (
    <section 
      ref={sectionRef}
      className="relative w-full bg-[#050505] overflow-hidden select-none"
      style={{ 
        height: '100vh', 
        minHeight: isMobile ? '600px' : '700px',
        perspective: isMobile ? 'none' : '1200px',
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ===== AMBIENT BREATHING GLOW ===== */}
      <div 
        className="absolute z-[3] pointer-events-none"
        style={{
          width: '1000px',
          height: '1000px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(212,175,55,${0.03 + Math.sin(breath) * 0.02}) 0%, transparent 65%)`,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${mousePos.x * 80}px, ${mousePos.y * 80}px) scale(${1 + Math.sin(breath * 0.7) * 0.15})`,
          filter: 'blur(120px)',
          transition: 'transform 2s ease-out',
        }}
      />

      {/* ===== FLOATING PARTICLES ===== */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: (Math.random() * 3 + 1) + 'px',
              height: (Math.random() * 3 + 1) + 'px',
              left: (Math.random() * 100) + '%',
              top: (Math.random() * 100) + '%',
              backgroundColor: i % 3 === 0 ? '#D4AF37' : '#fff',
              opacity: 0.06 + Math.sin(breath + i) * 0.04,
              animation: `float ${12 + Math.random() * 18}s linear infinite`,
              animationDelay: `${Math.random() * 12}s`,
              transform: `translate(${mousePos.x * (i % 5 === 0 ? 60 : 25)}px, ${mousePos.y * (i % 5 === 0 ? 60 : 25)}px)`,
              transition: 'transform 2s ease-out',
            }}
          />
        ))}
      </div>

      {/* ===== BACKGROUND IMAGES ===== */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0"
            style={{
              opacity: i === current ? 1 : 0,
              transform: i === current 
                ? `scale(1.02) translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)` 
                : 'scale(1.12)',
              zIndex: i === current ? 2 : 1,
              transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1), transform 2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover"
              style={{ objectPosition: isMobile ? 'center 25%' : 'center' }}
              loading={i === 0 ? 'eager' : 'lazy'}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1920&q=80'
              }}
            />
          </div>
        ))}

        {/* Gradients */}
        <div className="absolute inset-0 z-10" style={{
          background: isMobile
            ? 'linear-gradient(to top, #050505 0%, rgba(5,5,5,0.96) 15%, rgba(5,5,5,0.8) 38%, rgba(5,5,5,0.45) 65%, rgba(5,5,5,0.15) 100%)'
            : 'linear-gradient(to right, #050505 0%, rgba(5,5,5,0.98) 38%, rgba(5,5,5,0.9) 52%, rgba(5,5,5,0.6) 72%, rgba(5,5,5,0.2) 100%)'
        }} />
        <div className="absolute inset-0 z-10" style={{
          background: 'linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 28%)'
        }} />
        <div className="absolute inset-0 z-10" style={{
          background: 'radial-gradient(ellipse at 18% 50%, transparent 22%, rgba(5,5,5,0.7) 100%)'
        }} />
      </div>

      {/* ===== FILM GRAIN ===== */}
      <div 
        className="absolute inset-0 z-[15] pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* ===== CONTENT — 3D TILT ===== */}
      <div 
        ref={contentRef}
        className="relative z-20 h-full flex flex-col justify-end sm:justify-center px-6 sm:px-10 lg:px-16 pb-32 sm:pb-0"
        style={{
          transform: isMobile ? 'none' : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(20px)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.3s ease-out',
        }}
      >
        <div className="w-full" style={{ transform: isMobile ? 'none' : 'translateZ(40px)' }}>
          
          {/* Brand Label */}
          <div 
            className="flex items-center gap-3 mb-5 sm:mb-7"
            style={{
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? 'translateY(0) translateZ(60px)' : 'translateY(20px) translateZ(60px)',
              transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="w-8 sm:w-12 h-[1px] bg-[#D4AF37]" />
            <span className="text-[#D4AF37] text-[10px] sm:text-xs tracking-[0.4em] font-semibold uppercase">
              VELARIO
            </span>
          </div>

          {/* Title Line 1 */}
          <div className="overflow-hidden mb-0">
            <h1 
              className="text-white font-black leading-[0.9] tracking-tight"
              style={{
                fontSize: isMobile ? 'clamp(36px, 12vw, 56px)' : 'clamp(56px, 7vw, 100px)',
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? 'translateY(0) translateZ(80px)' : 'translateY(110%) translateZ(80px)',
                transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: textVisible ? '100ms' : '0ms',
              }}
            >
              {slide.title}
            </h1>
          </div>

          {/* Gold Title */}
          <div className="overflow-hidden mb-5 sm:mb-8">
            <h1 
              className="font-black leading-[0.9] tracking-tight"
              style={{
                fontSize: isMobile ? 'clamp(36px, 12vw, 56px)' : 'clamp(56px, 7vw, 100px)',
                background: 'linear-gradient(90deg, #D4AF37, #E8C547, #D4AF37, #C9A433)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: textVisible ? 'shimmer 5s ease infinite' : 'none',
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? 'translateY(0) translateZ(80px)' : 'translateY(110%) translateZ(80px)',
                transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: textVisible ? '220ms' : '0ms',
              }}
            >
              {slide.titleGold}
            </h1>
          </div>

          {/* Subtitle */}
          <p 
            className="text-white/50 text-sm sm:text-lg leading-relaxed mb-7 sm:mb-10 max-w-md sm:max-w-lg"
            style={{
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? 'translateY(0) translateZ(40px)' : 'translateY(20px) translateZ(40px)',
              transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: textVisible ? '380ms' : '0ms',
            }}
          >
            {slide.subtitle}
          </p>

          {/* CTAs — Magnetic Effect */}
          <div
            className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6"
            style={{
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? 'translateY(0) translateZ(60px)' : 'translateY(20px) translateZ(60px)',
              transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: textVisible ? '480ms' : '0ms',
            }}
          >
            <div
              ref={ctaRef}
              onMouseMove={handleCtaMove}
              onMouseLeave={handleCtaLeave}
              style={{
                transform: isMobile ? 'none' : `translate(${magnetic.x}px, ${magnetic.y}px)`,
                transition: 'transform 0.2s ease-out',
              }}
            >
              <Link
                to={slide.link}
                className="group inline-flex items-center gap-4 px-10 py-4 sm:px-12 sm:py-5 bg-[#D4AF37] hover:bg-[#c9a433] text-[#050505] text-[11px] sm:text-xs font-black tracking-[0.2em] rounded-xl no-underline transition-all duration-500 hover:shadow-[0_0_100px_rgba(212,175,55,0.35)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
              >
                {slide.cta}
                <span className="w-6 h-[1px] bg-[#050505]/30 group-hover:w-10 group-hover:bg-[#050505]/50 transition-all duration-500" />
              </Link>
            </div>
            
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-[11px] sm:text-xs tracking-[0.15em] uppercase font-medium no-underline transition-all duration-500 py-4 sm:py-5 group"
            >
              <span className="w-6 h-[1px] bg-white/20 group-hover:w-10 group-hover:bg-[#D4AF37]/40 transition-all duration-500" />
              View All
            </Link>
          </div>
        </div>
      </div>

      {/* ===== SCROLL INDICATOR ===== */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        style={{
          opacity: textVisible ? 1 : 0,
          transition: 'opacity 0.7s ease 0.6s',
        }}
      >
        <span className="text-white/20 text-[9px] tracking-[0.3em] uppercase font-medium">Scroll</span>
        <div className="w-[1px] h-10 bg-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-4 bg-[#D4AF37] animate-scrollDown" />
        </div>
      </div>

      {/* ===== BOTTOM BAR ===== */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 sm:px-10 lg:px-16 pb-6 sm:pb-8">
        <div className="flex items-end justify-between">
          <div className="overflow-hidden">
            <div
              className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              <p className="text-white/8 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-medium">
                {slide.title} {slide.titleGold}
              </p>
            </div>
          </div>

          {/* Slide bars */}
          <div className="hidden sm:flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="p-1 cursor-pointer bg-transparent border-none"
              >
                <div
                  className="transition-all duration-700 ease-out rounded-full"
                  style={{
                    width: i === current ? '24px' : '4px',
                    height: '3px',
                    backgroundColor: i === current ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.06)',
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== ANIMATIONS ===== */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          5% { opacity: 0.1; }
          95% { opacity: 0.1; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes scrollDown {
          0% { transform: translateY(-100%); opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(400%); opacity: 0; }
        }
      `}</style>
    </section>
  )
}