import { RefreshCw, Shield, Clock, CheckCircle } from 'lucide-react'

export default function Returns() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F0F0F', paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>Returns & Exchanges</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginBottom: '48px' }}>
          Hassle-free returns within 30 days. No questions asked.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '48px' }}>
          {[
            { icon: Clock, title: '30-Day Window', desc: 'Return any item within 30 days of delivery', color: '#D4AF37' },
            { icon: Shield, title: 'Full Refund', desc: 'Original payment method refunded in full', color: '#10b981' },
            { icon: RefreshCw, title: 'Easy Exchanges', desc: 'Swap for a different size or color', color: '#3b82f6' },
            { icon: CheckCircle, title: 'Free Return Shipping', desc: 'We cover the cost for defective items', color: '#8b5cf6' },
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: '#1A1A1A', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <item.icon size={24} color={item.color} style={{ marginBottom: '12px' }} />
              <h3 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{item.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Return Policy</h2>
          <div style={{ backgroundColor: '#1A1A1A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'Items must be unworn, unwashed, and in original condition',
                'Original tags and packaging must be intact',
                'Sale items are final sale and cannot be returned',
                'Custom or personalized orders cannot be returned',
                'Proof of purchase (order number or receipt) is required',
              ].map((rule, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D4AF37', marginTop: '8px', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6 }}>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>How to Return</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { step: '1', title: 'Initiate Return', desc: 'Log into your account, go to Orders, and click "Return Item"' },
              { step: '2', title: 'Pack Your Item', desc: 'Place the item in its original packaging with tags attached' },
              { step: '3', title: 'Ship It Back', desc: 'Use the prepaid label or drop off at our Lagos location' },
              { step: '4', title: 'Get Refunded', desc: 'Refunds are processed within 5-7 business days' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', backgroundColor: '#1A1A1A', padding: '20px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>
                  {item.step}
                </div>
                <div>
                  <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{item.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}