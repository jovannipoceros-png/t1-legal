export default function Dashboard() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Sidebar */}
      <div style={{ width: '240px', background: '#0F2447', padding: '24px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid #1B3A6B' }}>
          <span style={{ background: '#E8321A', color: 'white', fontWeight: 900, fontSize: '20px', padding: '4px 12px', borderRadius: '4px' }}>T1</span>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '16px', marginLeft: '8px' }}>Legal</span>
        </div>
        {[
          '📊 Inicio', '📋 Solicitudes', '📅 Agenda', '✏️ Editor',
          '🌐 Traductor', '🤖 Análisis IA', '⚖️ Negociación',
          '📁 Expediente', '📚 Inventario', '📈 Reportes',
          '📡 Monitor', '⚖️ Biblioteca', '🥋 Entrenamiento',
          '⚡ Sistema', '👥 Usuarios'
        ].map((item, i) => (
          <div key={i} style={{
            padding: '12px 24px', color: i === 0 ? 'white' : '#B0C4DE',
            cursor: 'pointer', background: i === 0 ? '#1B3A6B' : 'transparent',
            fontSize: '14px',
          }}>
            {item}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: '#F5F6F7', padding: '32px' }}>
        <h1 style={{ color: '#0F2447', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Dashboard</h1>
        <p style={{ color: '#888', margin: '0 0 32px' }}