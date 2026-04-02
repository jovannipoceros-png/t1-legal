export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0F2447',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        background: '#E8321A',
        padding: '8px 24px',
        borderRadius: '4px',
        marginBottom: '16px',
      }}>
        <span style={{ color: 'white', fontWeight: 900, fontSize: '32px' }}>T1</span>
      </div>
      <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 900, margin: '0 0 8px' }}>
        T1 Legal
      </h1>
      <p style={{ color: '#B0C4DE', fontSize: '16px', margin: '0 0 32px' }}>
        Sistema de Gestión Legal — T1 Pagos
      </p>
      <a href="/dashboard" style={{
        background: '#E8321A',
        color: 'white',
        padding: '12px 32px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: '16px',
      }}>
        Entrar al sistema
      </a>
    </main>
  )
}