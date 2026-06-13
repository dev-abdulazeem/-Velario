import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    { q: 'How do I place an order?', a: 'Browse our shop, add items to your cart, and proceed to checkout. You can pay securely with your card or bank transfer.' },
    { q: 'What payment methods do you accept?', a: 'We accept card payments (Visa, Mastercard, Verve) and bank transfers. All transactions are secured with SSL encryption.' },
    { q: 'How long does delivery take?', a: 'Delivery within Lagos takes 1-3 business days. Other states in Nigeria take 3-7 business days. International shipping takes 10-15 business days.' },
    { q: 'Can I return or exchange my order?', a: 'Yes! We offer 30-day hassle-free returns. Items must be unworn with original tags attached. Exchanges are subject to availability.' },
    { q: 'How do I find my shoe size?', a: 'Check our Size Guide page for detailed measurements. If you are between sizes, we recommend sizing up for comfort.' },
    { q: 'Do you offer wholesale or bulk orders?', a: 'Yes, we offer wholesale pricing for orders of 20+ pairs. Contact us via the Contact page for bulk inquiries.' },
    { q: 'How do I track my order?', a: 'Once your order ships, you will receive a tracking number via email and SMS. You can also track your order in your account dashboard.' },
    { q: 'Are Velario shoes true to size?', a: 'Our shoes generally run true to size. However, some styles may fit differently. Refer to the Size Guide on each product page for specifics.' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F0F0F', paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>FAQs</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginBottom: '48px' }}>
          Frequently asked questions about orders, shipping, returns, and more.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#1A1A1A',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 600 }}>{faq.q}</span>
                <ChevronDown
                  size={18}
                  color="#D4AF37"
                  style={{
                    transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                    flexShrink: 0,
                    marginLeft: '16px',
                  }}
                />
              </button>
              {openIndex === i && (
                <div style={{ padding: '0 24px 20px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.7 }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}