import { Truck, Clock, Package, Globe } from 'lucide-react'

export default function Shipping() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F0F0F', paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>Shipping Information</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginBottom: '48px' }}>
          Everything you need to know about delivery times, costs, and tracking.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '48px' }}>
          {[
            { icon: Truck, title: 'Standard Delivery', desc: '1-3 days in Lagos, 3-7 days nationwide', color: '#D4AF37' },
            { icon: Clock, title: 'Express Delivery', desc: 'Same-day in Lagos (orders before 12pm)', color: '#10b981' },
            { icon: Package, title: 'Free Shipping', desc: 'On all orders over ₦50,000', color: '#3b82f6' },
            { icon: Globe, title: 'International', desc: '10-15 business days worldwide', color: '#8b5cf6' },
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: '#1A1A1A', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <item.icon size={24} color={item.color} style={{ marginBottom: '12px' }} />
              <h3 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{item.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Shipping Rates</h2>
          <div style={{ backgroundColor: '#1A1A1A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            {[
              { location: 'Lagos (Standard)', cost: '₦2,500', time: '1-3 business days' },
              { location: 'Lagos (Express)', cost: '₦5,000', time: 'Same day' },
              { location: 'Other States (South-West)', cost: '₦3,500', time: '2-5 business days' },
              { location: 'Other States (Nationwide)', cost: '₦4,500', time: '3-7 business days' },
              { location: 'International', cost: '₦15,000+', time: '10-15 business days' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ color: '#FFFFFF', fontSize: '14px' }}>{row.location}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#D4AF37', fontSize: '14px', fontWeight: 600 }}>{row.cost}</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{row.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Order Tracking</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.8 }}>
            Once your order ships, you will receive an email and SMS with your tracking number. 
            You can also track your order by logging into your account and visiting the Orders page.
          </p>
        </div>
      </div>
    </div>
  )
}