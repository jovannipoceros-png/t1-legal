export default function Dashboard() {
  const modulos = [
    '📊 Inicio', '📋 Solicitudes', '📅 Agenda', '✏️ Editor',
    '🌐 Traductor', '🤖 Análisis IA', '⚖️ Negociación',
    '📁 Expediente', '📚 Inventario', '📈 Reportes',
    '📡 Monitor', '⚖️ Biblioteca', '🥋 Entrenamiento',
    '⚡ Sistema', '👥 Usuarios'
  ]
  const kpis = [
    { label: 'Total Solicitudes', value: '0', color: '#0F2447' },
    { label: 'Pendientes', value: '0', color: '#F59E0B' },
    { label: 'Urgentes', value: '0', color: '#E8321A' },
    { label: 'Cerradas', value: '0', color: '#0D5C36' },
  ]
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: '240px', background: '#0F2447', padding: '24px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid #1B3A6B' }}>
          <span style={{ background: '#E8321A', color: 'white', fontWeight: 900, fontSize: '20px', padding: '4px 12px', borderRadius: '4px' }}>T1</span>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '16px', marginLeft: '8px' }}>Legal</span>
        </div>
        {modulos.map((item, i) => (
          <div key={i} style={{ padding: '12px 24px', color: i === 0 ? 'white' : '#B0C4DE', cursor: 'pointer', background: i === 0 ? '#1B3A6B' : 'transparent', fontSize: '14px' }}>
            {item}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, background: '#F5F6F7', padding: '32px' }}>
        <h1 style={{ color: '#0F2447', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Dashboard</h1>
        <p style={{ color: '#888', margin: '0 0 32px' }}>Bienvenido, Jovanni</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {kpis.map((kpi, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <p style={{ color: '#888', fontSize: '13px', margin: '0 0 8px' }}>{kpi.label}</p>
              <p style={{ color: kpi.color, fontSize: '32px', fontWeight: 700, margin: 0 }}>{kpi.value}</p>
            </div>
          ))}
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ color: '#0F2447', fontSize: '16px', fontWeight: 700, margin: '0 0 16px' }}>Solicitudes recientes</h2>
          <p style={{ color: '#888', textAlign: 'center', padding: '32px 0' }}>No hay solicitudes aun</p>
        </div>
      </div>
    </div>
  )
}
