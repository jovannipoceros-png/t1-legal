export default function Dashboard() {
  const kpis = [
    { label: 'Total Solicitudes', value: '0', color: '#0F2447' },
    { label: 'Pendientes', value: '0', color: '#F59E0B' },
    { label: 'Urgentes', value: '0', color: '#E8321A' },
    { label: 'Cerradas', value: '0', color: '#0D5C36' },
  ]
  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#0F2447', fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>Dashboard</h1>
      <p style={{ color: '#888', margin: '0 0 32px' }}>Bienvenido, Jovanni</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ color: '#888', fontSize: '13px', margin: '0 0 8px' }}>{k.label}</p>
            <p style={{ color: k.color, fontSize: '32px', fontWeight: 700, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h2 style={{ color: '#0F2447', fontSize: '16px', fontWeight: 700, margin: '0 0 16px' }}>Solicitudes recientes</h2>
        <p style={{ color: '#888', textAlign: 'center', padding: '32px 0' }}>No hay solicitudes aun</p>
      </div>
    </div>
  )
}
