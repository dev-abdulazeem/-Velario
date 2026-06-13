import { useEffect, useState, useMemo } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import api from '../../api/axios'
import AdminLayout from '../../components/admin/AdminLayout'

// ─── Helpers ─────────────────────────────────────────────────────

const formatNaira = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '₦0'
  return '₦' + parseFloat(num).toLocaleString('en-NG', { maximumFractionDigits: 0 })
}

const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0'
  return parseInt(num).toLocaleString()
}

const getChangeType = (val) => {
  if (!val || val === 0) return 'neutral'
  return val > 0 ? 'up' : 'down'
}

const getChangeIcon = (type) => {
  if (type === 'up') return <ArrowUpRight size={14} />
  if (type === 'down') return <ArrowDownRight size={14} />
  return <Minus size={14} />
}

const getChangeColor = (type) => {
  if (type === 'up') return 'text-emerald-400 bg-emerald-500/10'
  if (type === 'down') return 'text-rose-400 bg-rose-500/10'
  return 'text-white/30 bg-white/5'
}

// ─── Components ─────────────────────────────────────────────────

const KpiCard = ({ label, value, icon: Icon, colorClass, change, changeLabel, isLoading }) => (
  <div className="bg-[#111118] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={20} className="text-white" />
      </div>
      {change !== undefined && change !== null && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getChangeColor(getChangeType(change))}`}>
          {getChangeIcon(getChangeType(change))}
          {changeLabel || `${change > 0 ? '+' : ''}${change}%`}
        </div>
      )}
    </div>
    <p className="text-white/30 text-xs uppercase tracking-widest mb-2">{label}</p>
    <p className="text-white text-2xl font-bold tracking-tight">
      {isLoading ? <span className="inline-block w-20 h-6 bg-white/5 rounded animate-pulse" /> : value}
    </p>
  </div>
)

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-white font-semibold text-lg">{title}</h3>
      {subtitle && <p className="text-white/30 text-xs mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
)

const EmptyState = ({ message = 'No data available', icon: Icon = AlertCircle }) => (
  <div className="flex flex-col items-center justify-center py-16 text-white/20">
    <Icon size={32} className="mb-3 opacity-40" />
    <p className="text-sm">{message}</p>
  </div>
)

const BarChart = ({ data, labelKey, valueKey, color = 'from-[#D4AF37] to-[#E8C547]', maxBarHeight = 160 }) => {
  if (!data || data.length === 0) return <EmptyState />

  const values = data.map(d => parseFloat(d[valueKey]) || 0)
  const max = Math.max(...values, 1)

  return (
    <div className="flex items-end gap-2 h-[200px]">
      {data.map((item, i) => {
        const val = parseFloat(item[valueKey]) || 0
        const height = max > 0 ? (val / max) * maxBarHeight : 0
        const label = item[labelKey]

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group min-w-0">
            <div className="relative w-full flex justify-center">
              <div 
                className={`w-full max-w-[40px] bg-gradient-to-t ${color} rounded-t-lg transition-all duration-500 opacity-70 group-hover:opacity-100`}
                style={{ height: `${Math.max(height, 4)}px` }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a24] text-white text-xs px-2 py-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {formatNaira(val)}
              </div>
            </div>
            <span className="text-white/20 text-[10px] truncate w-full text-center">
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const ProgressList = ({ data, labelKey, valueKey, subLabelKey, totalValue }) => {
  if (!data || data.length === 0) return <EmptyState />

  const max = Math.max(...data.map(d => parseFloat(d[valueKey]) || 0), 1)

  return (
    <div className="space-y-4">
      {data.map((item, i) => {
        const val = parseFloat(item[valueKey]) || 0
        const pct = max > 0 ? (val / max) * 100 : 0
        const label = item[labelKey]
        const subLabel = subLabelKey ? item[subLabelKey] : null

        return (
          <div key={i} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium capitalize">{label}</span>
                {subLabel && (
                  <span className="text-white/25 text-xs bg-white/5 px-2 py-0.5 rounded-full">
                    {subLabel}
                  </span>
                )}
              </div>
              <span className="text-[#D4AF37] text-sm font-semibold">
                {totalValue ? formatNaira(val) : formatNumber(val)}
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E8C547] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

const ProductGrid = ({ products }) => {
  if (!products || products.length === 0) return <EmptyState message="No product sales data" icon={Package} />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {products.map((product, i) => (
        <div 
          key={i} 
          className="bg-black/20 rounded-xl p-5 border border-white/5 hover:border-[#D4AF37]/20 transition-all group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center border border-[#D4AF37]/10">
              <span className="text-[#D4AF37] text-xs font-bold">#{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{product.name || 'Unknown'}</p>
              <p className="text-white/30 text-xs capitalize">{product.category || 'Uncategorized'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2.5 rounded-lg bg-white/[0.03]">
              <p className="text-[#D4AF37] text-sm font-bold">{formatNumber(product.total_quantity)}</p>
              <p className="text-white/20 text-[10px] uppercase tracking-wider mt-1">Sold</p>
            </div>
            <div className="text-center p-2.5 rounded-lg bg-white/[0.03]">
              <p className="text-white text-sm font-bold">{formatNumber(product.times_sold)}</p>
              <p className="text-white/20 text-[10px] uppercase tracking-wider mt-1">Orders</p>
            </div>
            <div className="text-center p-2.5 rounded-lg bg-white/[0.03]">
              <p className="text-emerald-400 text-sm font-bold">{formatNaira(product.revenue)}</p>
              <p className="text-white/20 text-[10px] uppercase tracking-wider mt-1">Revenue</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [days, setDays] = useState(30)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get(`/admin/analytics?days=${days}`)
      setData(res.data)
    } catch (err) {
      console.error('Analytics error:', err.message)
      setError(err.response?.data?.message || err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [days])

  const dailySales = data?.dailySales || data?.daily_sales || []
  const categorySales = data?.categorySales || data?.category_sales || data?.categories || []
  const topProducts = data?.topProducts || data?.top_products || data?.products || []
  const monthlyStats = data?.monthlyStats || data?.monthly || []

  const totals = useMemo(() => {
    const revenue = dailySales.reduce((sum, d) => sum + (parseFloat(d.revenue || d.amount || d.total || 0)), 0)
    const orders = dailySales.reduce((sum, d) => sum + (parseInt(d.orders || d.order_count || d.count || 0)), 0)
    const items = dailySales.reduce((sum, d) => sum + (parseInt(d.items || d.items_sold || d.quantity || 0)), 0)
    
    return {
      revenue,
      orders,
      items,
      avgOrder: orders > 0 ? revenue / orders : 0
    }
  }, [dailySales])

  if (loading && !data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold mb-1">Analytics</h1>
          <p className="text-white/30 text-sm">Store performance overview</p>
        </div>
        
        <div className="flex items-center gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                days === d
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-[#111118] text-white/40 border border-white/5 hover:text-white hover:border-white/15'
              }`}
            >
              {d} Days
            </button>
          ))}
          <button 
            onClick={fetchData}
            className="p-2 rounded-xl bg-[#111118] border border-white/5 text-white/30 hover:text-white hover:border-white/15 transition-all"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 mb-8 flex items-center gap-3">
          <AlertCircle size={20} className="text-rose-400 shrink-0" />
          <div>
            <p className="text-rose-400 text-sm font-medium">Failed to load data</p>
            <p className="text-rose-400/60 text-xs mt-0.5">{error}</p>
          </div>
          <button 
            onClick={fetchData}
            className="ml-auto px-4 py-2 rounded-lg bg-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/30 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard 
          label="Total Revenue" 
          value={formatNaira(totals.revenue)} 
          icon={DollarSign} 
          colorClass="bg-emerald-500/20"
          change={data?.revenueChange || data?.revenue_change}
          isLoading={loading}
        />
        <KpiCard 
          label="Total Orders" 
          value={formatNumber(totals.orders)} 
          icon={ShoppingBag} 
          colorClass="bg-blue-500/20"
          change={data?.ordersChange || data?.orders_change}
          isLoading={loading}
        />
        <KpiCard 
          label="Items Sold" 
          value={formatNumber(totals.items)} 
          icon={Package} 
          colorClass="bg-purple-500/20"
          change={data?.itemsChange || data?.items_change}
          isLoading={loading}
        />
        <KpiCard 
          label="Avg Order Value" 
          value={formatNaira(totals.avgOrder)} 
          icon={Users} 
          colorClass="bg-orange-500/20"
          change={data?.avgChange || data?.avg_change}
          isLoading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#111118] rounded-2xl border border-white/5 p-6">
          <SectionHeader 
            title="Daily Sales" 
            subtitle={`Last ${days} days`} 
            action={<Calendar size={16} className="text-white/20" />}
          />
          <BarChart 
            data={dailySales} 
            labelKey="date" 
            valueKey="revenue"
            maxBarHeight={140}
          />
        </div>

        <div className="bg-[#111118] rounded-2xl border border-white/5 p-6">
          <SectionHeader 
            title="Sales by Category" 
            subtitle="Revenue distribution"
          />
          <ProgressList 
            data={categorySales} 
            labelKey="category" 
            valueKey="revenue" 
            subLabelKey="items_sold"
            totalValue={true}
          />
        </div>
      </div>

      <div className="bg-[#111118] rounded-2xl border border-white/5 p-6 mb-6">
        <SectionHeader 
          title="Top Selling Products" 
          subtitle="Best performers by revenue"
          action={
            <span className="text-white/20 text-xs bg-white/5 px-3 py-1 rounded-full">
              {topProducts.length} products
            </span>
          }
        />
        <ProductGrid products={topProducts} />
      </div>

      {monthlyStats.length > 0 && (
        <div className="bg-[#111118] rounded-2xl border border-white/5 p-6">
          <SectionHeader 
            title="Monthly Overview" 
            subtitle="Revenue trend by month"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {monthlyStats.map((month, i) => (
              <div key={i} className="bg-black/20 rounded-xl p-4 border border-white/5 text-center">
                <p className="text-white/30 text-xs mb-2 uppercase">{month.month || month.period || `M${i+1}`}</p>
                <p className="text-white font-bold text-lg">{formatNaira(month.revenue || month.amount || 0)}</p>
                <p className="text-white/20 text-xs mt-1">{formatNumber(month.orders || month.count || 0)} orders</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}