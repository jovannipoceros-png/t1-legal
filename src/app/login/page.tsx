export default function Login() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F2447 0%, #1B3A6B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-block', background: '#E8321A', padding: '8px 20px', borderRadius: '8px', marginBottom: '16px' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: '28px' }}>T1</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>T1 Legal</h1>
          <p style={{ color: '#B0C4DE', fontSize: '14px', margin: 0 }}>Ingresa tu correo para ver tus solicitudes</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#B0C4DE', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Correo electrónico</label>
            <input type="email" placeholder="tu@empresa.com" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <button style={{ width: '100%', padding: '14px', background: '#E8321A', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', marginBottom: '16px' }}>
            Entrar →
          </button>
          <div style={{ textAlign: 'center' }}>
            <a href="/solicitar" style={{ color: '#B0C4DE', fontSize: '13px', textDecoration: 'none' }}>¿Primera vez? Haz una solicitud aquí</a>
          </div>
        </div>
      </div>
    </div>
  )
}
