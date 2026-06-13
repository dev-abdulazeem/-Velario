import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

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
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Track window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const goTo = useCallback((index) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrent(index)
    setTimeout(() => setIsAnimating(false), 800)
  }, [isAnimating])

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, goTo])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  // Touch swipe support
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe) next()
    if (isRightSwipe) prev()
  }

  return (
    <section 
      style={{ 
        position: 'relative', 
        height: isMobile ? '85vh' : '100vh', 
        minHeight: isMobile ? '500px' : '600px', 
        maxHeight: '900px', 
        overflow: 'hidden', 
        backgroundColor: '#0F0F0F',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transition: 'all 1s ease',
            opacity: index === current ? 1 : 0,
            transform: index === current ? 'scale(1)' : 'scale(1.05)',
            pointerEvents: index === current ? 'auto' : 'none',
          }}
        >
          {/* Background Image */}
          <div style={{ position: 'absolute', inset: 0 }}>
            <img
              src={slide.image}
              alt={slide.title}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                objectPosition: isMobile ? 'center center' : 'center',
              }}
            />
            {/* Mobile gradient - darker bottom for text readability */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: isMobile 
                ? 'linear-gradient(to top, #0F0F0F 0%, rgba(15,15,15,0.7) 40%, rgba(15,15,15,0.3) 100%)'
                : 'linear-gradient(to right, #0F0F0F 0%, rgba(15,15,15,0.85) 40%, rgba(15,15,15,0.4) 70%, transparent 100%)',
            }} />
            {/* Bottom fade for all */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #0F0F0F 0%, transparent 30%)',
            }} />
          </div>

          {/* Content */}
          <div style={{
            position: 'relative',
            height: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: isMobile ? '0 20px' : '0 48px',
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            paddingBottom: isMobile ? '120px' : '0',
          }}>
            <div style={{
              maxWidth: isMobile ? '100%' : '560px',
              width: '100%',
              transition: 'all 0.7s ease 0.3s',
              opacity: index === current ? 1 : 0,
              transform: index === current ? 'translateY(0)' : 'translateY(32px)',
            }}>
              {/* Brand Label */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: isMobile ? '16px' : '24px',
              }}>
                <div style={{ 
                  width: isMobile ? '32px' : '48px', 
                  height: '1px', 
                  backgroundColor: '#D4AF37',
                }} />
                <span style={{ 
                  color: '#D4AF37', 
                  fontSize: isMobile ? '10px' : '12px', 
                  letterSpacing: '0.3em', 
                  fontWeight: 500,
                }}>
                  VELARIO
                </span>
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: isMobile ? 'clamp(32px, 12vw, 48px)' : 'clamp(48px, 6vw, 72px)',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 0.95,
                marginBottom: '4px',
                letterSpacing: '-0.02em',
              }}>
                {slide.title}
              </h1>
              <h1 style={{
                fontSize: isMobile ? 'clamp(32px, 12vw, 48px)' : 'clamp(48px, 6vw, 72px)',
                fontWeight: 900,
                lineHeight: 0.95,
                marginBottom: isMobile ? '16px' : '24px',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #D4AF37, #E8C547)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {slide.titleGold}
              </h1>

              {/* Subtitle */}
              <p style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: isMobile ? '14px' : '15px',
                lineHeight: 1.7,
                marginBottom: isMobile ? '24px' : '32px',
                maxWidth: '420px',
              }}>
                {slide.subtitle}
              </p>

              {/* CTA Button */}
              <Link
                to={slide.link}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: isMobile ? '14px 24px' : '16px 32px',
                  background: 'linear-gradient(135deg, #D4AF37, #E8C547)',
                  color: '#0F0F0F',
                  fontSize: isMobile ? '12px' : '13px',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 20px rgba(212,175,55,0.2)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(212,175,55,0.4)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(212,175,55,0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {slide.cta}
                <ArrowRight size={isMobile ? 16 : 18} />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows - Hidden on mobile, visible on tablet+ */}
      <button
        onClick={prev}
        style={{
          position: 'absolute',
          left: isMobile ? '12px' : '32px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: isMobile ? '36px' : '48px',
          height: isMobile ? '36px' : '48px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(4px)',
          display: isMobile ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          transition: 'all 0.3s',
          zIndex: 10,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#D4AF37'
          e.currentTarget.style.borderColor = '#D4AF37'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
        }}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        style={{
          position: 'absolute',
          right: isMobile ? '12px' : '32px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: isMobile ? '36px' : '48px',
          height: isMobile ? '36px' : '48px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(4px)',
          display: isMobile ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          transition: 'all 0.3s',
          zIndex: 10,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#D4AF37'
          e.currentTarget.style.borderColor = '#D4AF37'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
        }}
      >
        <ChevronRight size={20} />
      </button>

      {/* Mobile swipe hint */}
      {isMobile && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
          opacity: 0.4,
        }}>
          <ChevronLeft size={14} color="#fff" />
          <span style={{ color: '#fff', fontSize: '11px', letterSpacing: '0.1em' }}>SWIPE</span>
          <ChevronRight size={14} color="#fff" />
        </div>
      )}

      {/* Slide Indicators */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? '24px' : '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '16px' : '24px',
        zIndex: 10,
      }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            <span style={{
              fontSize: isMobile ? '11px' : '12px',
              fontWeight: 700,
              color: index === current ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
              transition: 'color 0.3s',
              minWidth: '20px',
            }}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <div style={{
              height: '2px',
              borderRadius: '1px',
              transition: 'all 0.5s ease',
              width: index === current ? (isMobile ? '32px' : '48px') : (isMobile ? '16px' : '24px'),
              backgroundColor: index === current ? '#D4AF37' : 'rgba(255,255,255,0.2)',
            }} />
          </button>
        ))}
      </div>

      {/* Scroll Indicator - Desktop only */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          bottom: '32px',
          right: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
        }}>
          <span style={{ 
            color: 'rgba(255,255,255,0.3)', 
            fontSize: '10px', 
            letterSpacing: '0.2em', 
            writingMode: 'vertical-lr',
          }}>
            SCROLL
          </span>
          <div style={{
            width: '1px',
            height: '40px',
            background: 'linear-gradient(to bottom, #D4AF37, transparent)',
            animation: 'scrollPulse 2s ease-in-out infinite',
          }} />
        </div>
      )}

      {/* Side Social Icons - Desktop Only */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          right: '32px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          zIndex: 10,
        }}>
          {['IG', 'FB', 'TW'].map((social, i) => (
            <a
              key={i}
              href="#"
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '10px',
                letterSpacing: '0.15em',
                textDecoration: 'none',
                writingMode: 'vertical-lr',
                transition: 'color 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              {social}
            </a>
          ))}
          <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </div>
      )}

      {/* Keyframe animation */}
      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.5); }
          50% { opacity: 1; transform: scaleY(1); }
        }
      `}</style>
    </section>
  )
}