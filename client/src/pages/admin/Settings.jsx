import { useEffect, useState } from 'react'
import { Store, DollarSign, Truck, Percent, Save, Check } from 'lucide-react'
import api from '../../api/axios'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings')
        setSettings(res.data)
      } catch (err) {
        console.error('Settings fetch error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 500)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold mb-1">Settings</h2>
          <p className="text-white/40 text-sm">Manage your store configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#0a0a0f] rounded-xl font-bold text-sm hover:bg-[#E8C547] transition-colors disabled:opacity-50"
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Info */}
        <div className="bg-[#111118] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
              <Store size={20} className="text-[#D4AF37]" />
            </div>
            <h3 className="text-white font-bold">Store Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Store Name</label>
              <input 
                type="text" 
                defaultValue={settings?.storeName || 'Velario'}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Currency</label>
              <select 
                defaultValue={settings?.currency || 'NGN'}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="NGN">₦ NGN (Naira)</option>
                <option value="USD">$ USD (Dollar)</option>
                <option value="EUR">€ EUR (Euro)</option>
                <option value="GBP">£ GBP (Pound)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-[#111118] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Percent size={20} className="text-green-400" />
            </div>
            <h3 className="text-white font-bold">Pricing & Tax</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Tax Rate (%)</label>
              <input 
                type="number" 
                defaultValue={settings?.taxRate || 8}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Free Shipping Threshold (₦)</label>
              <input 
                type="number" 
                defaultValue={settings?.shippingFreeThreshold || 100}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Store Stats */}
        <div className="bg-[#111118] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <DollarSign size={20} className="text-blue-400" />
            </div>
            <h3 className="text-white font-bold">Store Statistics</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-1">Total Products</p>
              <p className="text-white text-xl font-bold">{settings?.totalProducts || 0}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-1">Total Orders</p>
              <p className="text-white text-xl font-bold">{settings?.totalOrders || 0}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-4 col-span-2">
              <p className="text-white/40 text-xs mb-1">Total Revenue</p>
              <p className="text-[#D4AF37] text-xl font-bold">₦{(settings?.totalRevenue || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-[#111118] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Truck size={20} className="text-purple-400" />
            </div>
            <h3 className="text-white font-bold">Shipping Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
              <div>
                <p className="text-white text-sm font-medium">Free Shipping</p>
                <p className="text-white/40 text-xs">Orders above threshold</p>
              </div>
              <div className="w-12 h-6 bg-[#D4AF37] rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
              <div>
                <p className="text-white text-sm font-medium">Express Delivery</p>
                <p className="text-white/40 text-xs">1-2 business days</p>
              </div>
              <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white/50 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}