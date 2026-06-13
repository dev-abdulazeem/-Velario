import { useEffect, useState, useRef } from 'react'
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react'
import api from '../../api/axios'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [previewImages, setPreviewImages] = useState([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    sizes: '',
    stockQuantity: '',
    isFeatured: false,
  })
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const CATEGORIES = ['Men', 'Women']

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data)
    } catch (err) {
      console.error('Fetch products error:', err.message)
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    setImages(files)
    const previews = files.map(file => URL.createObjectURL(file))
    setPreviewImages(previews)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description || '')
    formData.append('price', form.price)
    formData.append('category', form.category)
    formData.append('sizes', JSON.stringify(
      form.sizes.split(',').map(s => s.trim()).filter(s => s)
    ))
    formData.append('stockQuantity', form.stockQuantity)
    formData.append('isFeatured', form.isFeatured ? 'true' : 'false')

    if (editingProduct && editingProduct.images) {
      const existingImages = Array.isArray(editingProduct.images) 
        ? editingProduct.images 
        : (typeof editingProduct.images === 'string' ? JSON.parse(editingProduct.images) : [])
      formData.append('images', JSON.stringify(existingImages))
    }

    if (images.length > 0) {
      formData.append('replace_images', 'true')
      images.forEach((img) => {
        formData.append('images', img)
      })
    }

    try {
      let res
      
      if (editingProduct) {
        res = await api.put(`/admin/products/${editingProduct.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        res = await api.post('/admin/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      console.log('Save success:', res.data)
      setShowModal(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (err) {
      console.error('Save error:', err.message)
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save product'
      alert(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/admin/products/${id}`)
      fetchProducts()
    } catch (err) {
      console.error('Delete error:', err.message)
      alert(err.response?.data?.message || 'Failed to delete product')
    }
  }

  const startEdit = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      sizes: Array.isArray(product.sizes)
        ? product.sizes.join(', ')
        : (typeof product.sizes === 'string'
            ? (() => {
                try {
                  const parsed = JSON.parse(product.sizes)
                  return Array.isArray(parsed) ? parsed.join(', ') : product.sizes
                } catch {
                  return product.sizes
                }
              })()
            : ''),
      stockQuantity: product.stock_quantity || '',
      isFeatured: product.is_featured || false,
    })

    let productImages = []
    if (product.images) {
      if (Array.isArray(product.images)) {
        productImages = product.images
      } else if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images)
          productImages = Array.isArray(parsed) ? parsed : [parsed]
        } catch {
          productImages = [product.images]
        }
      }
    }

    setPreviewImages(productImages)
    setImages([])
    setShowModal(true)
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      category: '',
      sizes: '',
      stockQuantity: '',
      isFeatured: false,
    })
    setImages([])
    setPreviewImages([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const goldGradient = 'linear-gradient(135deg, #D4AF37, #E8C547)'
  const darkBg = '#1A1A1A'
  const blackBg = '#0F0F0F'

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: blackBg,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '8px',
  }

  return (
    <AdminLayout>
      <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: blackBg }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '48px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 800, color: '#FFFFFF' }}>
                MANAGE <span style={{
                  background: goldGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>PRODUCTS</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '4px' }}>
                {products.length} products
              </p>
            </div>
            <button
              onClick={() => { setEditingProduct(null); resetForm(); setShowModal(true) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: goldGradient,
                color: blackBg,
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Plus size={16} />
              ADD PRODUCT
            </button>
          </div>

          <div style={{ backgroundColor: darkBg, borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['PRODUCT', 'CATEGORY', 'PRICE', 'STOCK', 'FEATURED', 'ACTIONS'].map((h, i) => (
                      <th key={i} style={{
                        textAlign: i === 5 ? 'right' : 'left',
                        padding: '16px 24px',
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '11px',
                        fontWeight: 500,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{
                        padding: '48px 24px',
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.3)'
                      }}>
                        No products yet.
                      </td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img
                              src={product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=50&q=80'}
                              alt={product.name}
                              style={{
                                width: '48px',
                                height: '48px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                backgroundColor: darkBg
                              }}
                              onError={e => {
                                e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=50&q=80'
                              }}
                            />
                            <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}>
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td style={{
                          padding: '16px 24px',
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: '14px',
                          whiteSpace: 'nowrap'
                        }}>
                          {product.category}
                        </td>
                        <td style={{
                          padding: '16px 24px',
                          color: '#D4AF37',
                          fontWeight: 700,
                          fontSize: '14px',
                          whiteSpace: 'nowrap'
                        }}>
                          ₦{product.price}
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '14px',
                            color: (product.stock_quantity || 0) < 10 ? '#ef4444' : 'rgba(255,255,255,0.6)',
                          }}>
                            {product.stock_quantity || 0}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          {product.is_featured && (
                            <span style={{
                              padding: '4px 10px',
                              backgroundColor: 'rgba(212,175,55,0.1)',
                              color: '#D4AF37',
                              fontSize: '10px',
                              fontWeight: 700,
                              borderRadius: '4px',
                            }}>
                              YES
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '8px'
                          }}>
                            <button
                              onClick={() => startEdit(product)}
                              style={{
                                padding: '8px',
                                color: 'rgba(255,255,255,0.4)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              style={{
                                padding: '8px',
                                color: 'rgba(255,255,255,0.4)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(15,15,15,0.95)',
          }}>
            <div style={{
              backgroundColor: darkBg,
              borderRadius: '16px',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                position: 'sticky',
                top: 0,
                backgroundColor: darkBg,
                zIndex: 10,
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                  {editingProduct ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px',
                    color: 'rgba(255,255,255,0.4)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <label style={labelStyle}>NAME *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Product name"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>PRICE (₦) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      placeholder="9999.99"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>CATEGORY *</label>
                    <select
                      required
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="" style={{ backgroundColor: blackBg, color: 'rgba(255,255,255,0.5)' }}>
                        Select category
                      </option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} style={{ backgroundColor: blackBg, color: '#FFFFFF' }}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>STOCK *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.stockQuantity}
                      onChange={e => setForm({ ...form, stockQuantity: e.target.value })}
                      placeholder="100"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>SIZES</label>
                  <input
                    type="text"
                    value={form.sizes}
                    onChange={e => setForm({ ...form, sizes: e.target.value })}
                    placeholder="40, 41, 42, 43, 44, 45"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>DESCRIPTION</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your product..."
                    style={{ ...inputStyle, resize: 'none' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    IMAGES {editingProduct && '(Upload new to replace)'}
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />

                  <div
                    onClick={triggerFileInput}
                    style={{
                      border: '2px dashed rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      padding: '40px 24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: blackBg,
                    }}
                  >
                    <Upload size={32} style={{
                      color: 'rgba(255,255,255,0.3)',
                      margin: '0 auto 16px',
                      display: 'block'
                    }} />
                    <p style={{ color: '#D4AF37', fontSize: '14px', fontWeight: 500 }}>
                      Click to upload images
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                      JPG, PNG, WEBP up to 5MB each
                    </p>
                  </div>

                  {images.length > 0 && (
                    <p style={{
                      color: '#D4AF37',
                      fontSize: '13px',
                      marginTop: '12px',
                      fontWeight: 500
                    }}>
                      {images.length} new file(s) selected
                    </p>
                  )}

                  {previewImages.length > 0 && (
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      marginTop: '16px',
                      flexWrap: 'wrap'
                    }}>
                      {previewImages.map((src, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img
                            src={src}
                            alt={`Preview ${i + 1}`}
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                          />
                          {editingProduct && (
                            <span style={{
                              position: 'absolute',
                              top: '-4px',
                              right: '-4px',
                              backgroundColor: images.length > 0 ? '#D4AF37' : '#3b82f6',
                              color: '#0F0F0F',
                              fontSize: '9px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}>
                              {images.length > 0 ? 'NEW' : 'SAVED'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '12px 16px',
                  backgroundColor: blackBg,
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: '#D4AF37',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: '#FFFFFF', fontSize: '14px' }}>
                    Feature this product on homepage carousel
                  </span>
                </label>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '12px 24px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.6)',
                      background: 'none',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      cursor: 'pointer',
                    }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '12px 24px',
                      background: goldGradient,
                      color: blackBg,
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    {loading ? 'SAVING...' : (editingProduct ? 'UPDATE PRODUCT' : 'CREATE PRODUCT')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}