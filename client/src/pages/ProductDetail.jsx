import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, ShoppingBag, Heart, Share2, Truck, Shield, RotateCcw, ChevronRight } from 'lucide-react'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`)
        const data = res.data
        
        if (typeof data.sizes === 'string') {
          try {
            data.sizes = JSON.parse(data.sizes)
          } catch {
            data.sizes = data.sizes.split(',').map(s => s.trim()).filter(s => s)
          }
        }
        
        setProduct(data)
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0])
      } catch (err) {
        console.error('Product fetch error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!selectedSize || selectedSize === '[' || selectedSize === '') {
      alert('Please select a valid size')
      return
    }
    if (!product) return
    addToCart(product, selectedSize, quantity)
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-velario-black">
        <div className="w-12 h-12 border-2 border-velario-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-velario-black">
        <p className="text-white/40">Product not found</p>
      </div>
    )
  }

  const images = product.images?.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80']

  const inWishlist = isInWishlist(product.id)

  return (
    <div className="pt-20 min-h-screen bg-velario-black animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-velario-gray rounded-2xl overflow-hidden relative">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.stock_quantity < 10 && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded">
                  LOW STOCK
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activeImage ? 'border-velario-gold' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-velario-gold text-xs tracking-[0.2em]">{product.category.toUpperCase()}</span>
              <ChevronRight size={14} className="text-white/20" />
              <span className="text-white/40 text-xs">{product.name}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={16} className="text-velario-gold fill-velario-gold" />
                ))}
              </div>
              <span className="text-white/40 text-sm">4.9 (247 reviews)</span>
            </div>

            <p className="text-3xl font-bold text-velario-gold mb-8">₦{product.price.toLocaleString()}</p>

            <p className="text-white/60 text-sm leading-relaxed mb-8">{product.description}</p>

            {/* Size Selector */}
            <div className="mb-8">
              <label className="text-white text-xs tracking-wider font-medium mb-3 block">SELECT SIZE</label>
              <div className="flex flex-wrap gap-3">
                {(product.sizes || ['40', '41', '42', '43', '44', '45']).map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 rounded-lg border text-sm font-medium transition-all ${
                      selectedSize === size
                        ? 'bg-velario-gold text-velario-black border-velario-gold'
                        : 'bg-transparent text-white border-white/20 hover:border-velario-gold'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="text-white text-xs tracking-wider font-medium mb-3 block">QUANTITY</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-lg border border-white/20 text-white hover:border-velario-gold transition-colors"
                >
                  -
                </button>
                <span className="text-white text-lg font-bold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-lg border border-white/20 text-white hover:border-velario-gold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-gold text-velario-black text-sm font-bold tracking-wider rounded-lg hover:shadow-xl hover:shadow-velario-gold/30 transition-all"
              >
                <ShoppingBag size={18} />
                ADD TO CART
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-14 h-14 rounded-lg border flex items-center justify-center transition-colors ${
                  inWishlist
                    ? 'bg-velario-gold text-velario-black border-velario-gold'
                    : 'border-white/20 text-white hover:text-velario-gold hover:border-velario-gold'
                }`}
              >
                <Heart size={18} fill={inWishlist ? '#0F0F0F' : 'none'} />
              </button>
              <button className="w-14 h-14 rounded-lg border border-white/20 flex items-center justify-center text-white hover:text-velario-gold hover:border-velario-gold transition-colors">
                <Share2 size={18} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5">
              {[
                { icon: Truck, label: 'Free Shipping', desc: 'Orders over ₦100,000' },
                { icon: Shield, label: '2 Year Warranty', desc: 'Full coverage' },
                { icon: RotateCcw, label: '30 Day Returns', desc: 'Easy returns' },
              ].map((feature, i) => (
                <div key={i} className="text-center">
                  <feature.icon size={20} className="text-velario-gold mx-auto mb-2" />
                  <p className="text-white text-xs font-medium">{feature.label}</p>
                  <p className="text-white/40 text-[10px]">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}