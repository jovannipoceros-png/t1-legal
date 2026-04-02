export default function Agenda() {
  const alertas = [
    { id: 'C-2026-001', empresa: 'Empresa A', tipo: 'Contrato de servicios', vence: 'Manana', prioridad: 'Alta', color: '#E8321A' },
    { id: 'C-2026-002', empresa: 'Empresa B', tipo: 'NDA', vence: 'En 3 dias', prioridad: 'Media', color: '#F59E0B' },
    { id: 'C-2026-003', empresa: 'Empresa C', tipo: 'Convenio', vence: 'En 5 dias', prioridad: 'Baja', color: '#0D5C36' },
  ]
  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#0F2447', fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>Agenda</h1>
      <p style={{ color: '#888', margin: '0 0 32px' }}>Pendientes por plazo interno</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Alta prioridad', value: '1', color: '#E8321A' },
          { label: 'Media prioridad', value: '1', color: '#F59E0B' },
          { label: 'Baja prioridad', value: '1', color: '#0D5C36' },
        ].map((k,i) => (
          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ color: '#888', fontSize: '13px', margin: '0 0 8px' }}>{k.label}</p>
            <p style={{ color: k.color, fontSize: '32px', fontWeight: 700, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>
      {alertas.map((a,i) => (
        <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '12px', borderLeft: `4px solid ${a.color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: '#0F2447', color: 'white', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{a.id}</span>
              <span style={{ background: a.color, color: 'white', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{a.prioridad}</span>
            </div>
            <p style={{ color: '#0F2447', fontWeight: 700, margin: '0 0 2px' }}>{a.empresa}</p>
            <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{a.tipo}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: a.color, fontWeight: 700, margin: '0 0 4px' }}>Vence: {a.vence}</p>
            <button style={{ background: '#E8321A', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Ver expediente</button>
          </div>
        </div>
      ))}
    </div>
  )
}
