export default function SizeGuide() {
  const sizes = [
    { us: '6', uk: '5.5', eu: '39', cm: '24.5' },
    { us: '7', uk: '6.5', eu: '40', cm: '25.5' },
    { us: '8', uk: '7.5', eu: '41', cm: '26.5' },
    { us: '9', uk: '8.5', eu: '42', cm: '27.5' },
    { us: '10', uk: '9.5', eu: '43', cm: '28.5' },
    { us: '11', uk: '10.5', eu: '44', cm: '29.5' },
    { us: '12', uk: '11.5', eu: '45', cm: '30.5' },
    { us: '13', uk: '12.5', eu: '46', cm: '31.5' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F0F0F', paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>Size Guide</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginBottom: '48px' }}>
          Find your perfect fit with our comprehensive size chart.
        </p>

        <div style={{ backgroundColor: '#1A1A1A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: '48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <span style={{ color: '#D4AF37', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em' }}>US</span>
            <span style={{ color: '#D4AF37', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em' }}>UK</span>
            <span style={{ color: '#D4AF37', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em' }}>EU</span>
            <span style={{ color: '#D4AF37', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em' }}>CM</span>
          </div>
          {sizes.map((size, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '14px 24px', borderBottom: i < sizes.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
              <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>{size.us}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{size.uk}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{size.eu}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{size.cm}</span>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#1A1A1A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px' }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>How to Measure</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.7, marginBottom: '16px' }}>
            Place your foot on a flat surface with your heel against a wall. 
            Measure from the wall to the tip of your longest toe in centimeters. 
            Use the CM column above to find your size.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
            Tip: If you are between sizes, we recommend sizing up for comfort.
          </p>
        </div>
      </div>
    </div>
  )
}