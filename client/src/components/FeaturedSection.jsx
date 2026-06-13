import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star } from 'lucide-react'
import api from '../api/axios'

export default function FeaturedSection() {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/products/featured')
      .then(res => {
        if (res.data.length > 0) setProduct(res.data[0])
      })
      .catch(err => console.error('Featured product error:', err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (!product) return null

  return (
    <section className="py-24 bg-velario-off-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-velario-gold" />
              <span className="text-velario-gold text-xs tracking-[0.3em] font-medium">FEATURED COLLECTION</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-velario-black leading-[0.95] mb-6">
              ENGINEERED<br />
              <span className="text-gradient-gold">FOR EXCELLENCE</span>
            </h2>
            
            <p className="text-velario-black/60 text-base leading-relaxed mb-8 max-w-md">
              Every pair is crafted with precision, built for comfort and made to stand out. 
              Experience the perfect blend of style and performance.
            </p>

            <div className="flex items-center gap-6 mb-8">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={16} className="text-velario-gold fill-velario-gold" />
              ))}
              <span className="text-velario-black/40 text-sm">4.9 (2,847 reviews)</span>
            </div>

            <Link
              to={`/product/${product.id}`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-velario-black text-white text-sm font-bold tracking-wider rounded hover:bg-velario-gold hover:text-velario-black transition-all group"
            >
              DISCOVER NOW
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative z-10">
              <img
                src={product.images?.[0] || 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80'}
                alt={product.name}
                className="w-full max-w-lg mx-auto animate-float"
              />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-velario-gold/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-velario-gold/10 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  )
}