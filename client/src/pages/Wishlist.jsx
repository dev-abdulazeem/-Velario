import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'

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

export default function Wishlist() {
  const { wishlist, removeFromWishlist, loading } = useWishlist()
  const { addToCart } = useCart()

  if (loading) {
    return (
      <div className="min-h-screen bg-velario-black flex items-center justify-center">
        <p className="text-velario-gold">Loading...</p>
      </div>
    )
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-velario-black pt-28 text-center">
        <Heart size={48} className="text-white/20 mx-auto mb-6" />
        <h2 className="text-white text-2xl mb-3">Your Wishlist is Empty</h2>
        <p className="text-white/50 mb-8">Save items you love for later</p>
        <Link to="/shop" className="inline-block px-8 py-3.5 bg-gradient-gold text-velario-black font-bold tracking-widest rounded-lg">
          BROWSE PRODUCTS
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-velario-black pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-white text-3xl font-light tracking-widest mb-12">
          MY WISHLIST
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map(product => {
            const imageUrl = getProductImage(product)
            return (
              <div key={product.id} className="bg-white/[0.03] rounded-2xl overflow-hidden border border-white/5">
                <div className="relative aspect-square">
                  <img 
                    src={imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'
                    }}
                  />
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-velario-black/80 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-white/50 text-[11px] tracking-[0.2em] mb-2">
                    {product.category?.toUpperCase()}
                  </p>
                  <Link to={`/product/${product.id}`} className="text-white text-base font-medium block mb-3 hover:text-velario-gold transition-colors">
                    {product.name}
                  </Link>
                  <p className="text-velario-gold text-lg font-semibold mb-4">
                    ₦{Number(product.price).toLocaleString()}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full py-3 bg-gradient-gold text-velario-black text-xs font-bold tracking-widest rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                  >
                    <ShoppingBag size={16} />
                    ADD TO CART
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}