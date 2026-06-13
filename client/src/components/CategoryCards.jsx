import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const categories = [
  {
    name: 'MEN',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
    link: '/shop?category=Men',
  },
  {
    name: 'WOMEN',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
    link: '/shop?category=Women',
  },
  {
    name: 'NEW ARRIVALS',
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80',
    link: '/shop?sort=newest',
  },
]

export default function CategoryCards() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <Link
              key={i}
              to={cat.link}
              className="group relative h-[400px] overflow-hidden rounded-lg bg-velario-off-white"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-velario-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-px bg-velario-gold" />
                  <span className="text-velario-gold text-xs tracking-[0.2em]">SHOP NOW</span>
                </div>
                <h3 className="text-white text-2xl font-bold tracking-wider mb-4">{cat.name}</h3>
                <div className="flex items-center gap-2 text-white/60 group-hover:text-velario-gold transition-colors">
                  <span className="text-xs tracking-wider">EXPLORE</span>
                  <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}