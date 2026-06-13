import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Heart, Eye } from 'lucide-react'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function ProductGrid({ title = 'TRENDING NOW', limit = 8, category = '' }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
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

  if (loading) {
    return (
      <div className="py-20 bg-velario-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-velario-gray rounded-lg h-80 shimmer-bg animate-shimmer" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="py-20 bg-velario-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-velario-gold text-xs tracking-[0.3em] font-medium">COLLECTION</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">{title}</h2>
          <div className="w-16 h-px bg-velario-gold mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, i) => {
            const inWishlist = isInWishlist(product.id)
            return (
              <div
                key={product.id}
                className="group relative bg-velario-gray rounded-lg overflow-hidden hover-lift"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-velario-gray-light">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-velario-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Link
                      to={`/product/${product.id}`}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-velario-black hover:bg-velario-gold transition-colors"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() => {
                        const sizes = product.sizes || ['42']
                        addToCart(product, sizes[0])
                      }}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-velario-black hover:bg-velario-gold transition-colors"
                    >
                      <ShoppingBag size={16} />
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        inWishlist 
                          ? 'bg-velario-gold text-velario-black' 
                          : 'bg-white text-velario-black hover:bg-velario-gold'
                      }`}
                    >
                      <Heart size={16} fill={inWishlist ? '#0F0F0F' : 'none'} />
                    </button>
                  </div>

                  {product.is_featured && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-velario-gold text-velario-black text-[10px] font-bold tracking-wider rounded">
                      FEATURED
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-white/40 text-[10px] tracking-wider uppercase mb-1">{product.category}</p>
                  <h3 className="text-white text-sm font-medium mb-2 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-velario-gold font-bold text-lg">₦{product.price.toLocaleString()}</span>
                    {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                      <span className="text-red-400 text-[10px]">Low Stock</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}