import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

const categories = [
  {
    name: 'MEN',
    subtitle: 'Precision Crafted',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    link: '/shop?category=Men',
  },
  {
    name: 'WOMEN',
    subtitle: 'Elegance Redefined',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
    link: '/shop?category=Women',
  },
  {
    name: 'NEW ARRIVALS',
    subtitle: 'Latest Drops',
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80',
    link: '/shop?sort=newest',
  },
]

export default function CategoryCards() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 bg-[#FAFAFA] overflow-hidden">
      {/* Subtle top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-black/[0.04]" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div 
          className="flex items-center gap-3 mb-12 sm:mb-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="w-8 sm:w-12 h-[1px] bg-[#B8941F]" />
          <span className="text-[#B8941F] text-[10px] sm:text-xs tracking-[0.35em] font-semibold uppercase">
            Shop by Category
          </span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {categories.map((cat, i) => (
            <Link
              key={i}
              to={cat.link}
              className="group relative h-[420px] sm:h-[480px] lg:h-[540px] overflow-hidden rounded-2xl block no-underline shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] transition-shadow duration-700"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                transition: `all 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${150 + i * 100}ms`,
              }}
            >
              {/* Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-110"
                style={{ objectPosition: 'center 30%' }}
                loading={i === 0 ? 'eager' : 'lazy'}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'
                }}
              />

              {/* Gradient Overlay — lighter for white theme */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

              {/* Hover warm overlay */}
              <div className="absolute inset-0 bg-[#B8941F]/0 group-hover:bg-[#B8941F]/[0.05] transition-all duration-700" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-8 lg:p-10">
                {/* Label */}
                <div className="flex items-center gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <span className="text-[#D4AF37] text-[10px] tracking-[0.3em] font-medium uppercase">
                    {cat.subtitle}
                  </span>
                  <div className="w-6 h-[1px] bg-[#D4AF37]/50" />
                </div>

                {/* Title */}
                <h3 className="text-white text-2xl sm:text-3xl font-black tracking-tight mb-5 group-hover:translate-y-[-4px] transition-transform duration-500">
                  {cat.name}
                </h3>

                {/* CTA */}
                <div className="flex items-center gap-3 text-white/50 group-hover:text-[#D4AF37] transition-all duration-500">
                  <span className="text-[11px] tracking-[0.2em] font-semibold uppercase">
                    Explore Collection
                  </span>
                  <div className="w-8 h-8 rounded-full border border-white/15 group-hover:border-[#D4AF37]/40 flex items-center justify-center transition-all duration-500 group-hover:bg-[#D4AF37]/10">
                    <ArrowUpRight size={14} strokeWidth={2} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </div>
                </div>
              </div>

              {/* Corner accent */}
              <div className="absolute top-6 right-6 w-10 h-10 border border-white/8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:border-[#D4AF37]/25">
                <ArrowUpRight size={16} className="text-[#D4AF37]" strokeWidth={1.5} />
              </div>

              {/* Bottom line accent */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/40 transition-all duration-700" />
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-black/[0.04]" />
    </section>
  )
}