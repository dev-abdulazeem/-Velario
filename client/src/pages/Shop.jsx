import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Filter, ChevronDown } from 'lucide-react'
import api from '../api/axios'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortOpen, setSortOpen] = useState(false)

  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || ''

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get(`/products?${searchParams}`),
          api.get('/products/categories'),
        ])
        setProducts(productsRes.data)
        const cats = Array.isArray(categoriesRes.data) ? categoriesRes.data.map(c => 
          typeof c === 'string' ? c : c.name
        ) : []
        setCategories(cats)
      } catch (err) {
        console.error('Shop fetch error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [searchParams])

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  const isActive = (catName) => category.toLowerCase() === catName.toLowerCase()

  return (
    <div className="min-h-screen bg-velario-black pt-20">
      {/* Header */}
      <div className="bg-velario-gray border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-black text-white mb-2">
            {category ? category.toUpperCase() : 'ALL'} <span className="text-velario-gold">PRODUCTS</span>
          </h1>
          <p className="text-white/40 text-sm">{products.length} products found</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="sticky top-20 z-40 bg-velario-black/95 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          
          {/* Category Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => updateFilter('category', '')}
              className={`px-5 py-2.5 text-xs tracking-widest font-semibold rounded-full border whitespace-nowrap transition-all ${
                !category 
                  ? 'bg-gradient-gold text-velario-black border-velario-gold' 
                  : 'text-white/50 border-white/10 hover:border-velario-gold hover:text-velario-gold'
              }`}
            >
              ALL
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => updateFilter('category', cat)}
                className={`px-5 py-2.5 text-xs tracking-widest font-semibold rounded-full border whitespace-nowrap transition-all ${
                  isActive(cat) 
                    ? 'bg-gradient-gold text-velario-black border-velario-gold' 
                    : 'text-white/50 border-white/10 hover:border-velario-gold hover:text-velario-gold'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/50 text-xs tracking-widest hover:border-white/20 transition-all"
            >
              <Filter size={14} />
              SORT BY
              <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {sortOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-velario-gray border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl">
                {[
                  { label: 'Newest', value: 'newest' },
                  { label: 'Price: Low to High', value: 'price_asc' },
                  { label: 'Price: High to Low', value: 'price_desc' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => { updateFilter('sort', option.value); setSortOpen(false) }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      sort === option.value 
                        ? 'bg-velario-gold/10 text-velario-gold' 
                        : 'text-white/60 hover:bg-white/5'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white/5 rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">No products found</p>
            <p className="text-white/20 text-sm mt-2">
              {category ? `No products in "${category}" category` : 'Try a different search or filter'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="block bg-velario-gray rounded-2xl overflow-hidden border border-white/5 hover:border-velario-gold/30 hover:-translate-y-1 transition-all group"
              >
                <div className="relative aspect-square overflow-hidden bg-velario-black">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-6 py-3 bg-gradient-gold text-velario-black text-xs font-bold tracking-widest rounded-lg">
                      VIEW DETAILS
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-white/30 text-[10px] tracking-widest uppercase mb-1">{product.category}</p>
                  <h3 className="text-white text-sm font-semibold mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-velario-gold font-bold">₦{product.price?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}