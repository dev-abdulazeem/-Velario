export default function About() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F0F0F', paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
          About Velario
        </h1>
        <p style={{ color: '#D4AF37', fontSize: '14px', marginBottom: '48px' }}>Movement With Style</p>

        <div style={{ marginBottom: '64px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Our Mission</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.8 }}>
            Velario was born from a simple belief: footwear should empower every step you take. 
            We craft premium shoes that blend Nigerian craftsmanship with modern design, 
            creating pieces that don't just look good — they feel right.
          </p>
        </div>

        <div id="story" style={{ marginBottom: '64px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Our Story</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.8, marginBottom: '16px' }}>
            Founded in Lagos, Velario started as a small workshop with a big dream: to put 
            African footwear on the global map. What began with a single artisan and a handful 
            of designs has grown into a brand trusted by thousands across Nigeria.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.8 }}>
            Every pair of Velario shoes is handcrafted using locally sourced materials, 
            supporting our community while delivering world-class quality to your doorstep.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {[
            { number: '10K+', label: 'Happy Customers' },
            { number: '50+', label: 'Unique Designs' },
            { number: '100%', label: 'Handcrafted' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '32px 16px', backgroundColor: '#1A1A1A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#D4AF37', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>{stat.number}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}