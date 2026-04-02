export default function NuevaSolicitud() {
  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif', maxWidth: '800px' }}>
      <h1 style={{ color: '#0F2447', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Nueva Solicitud</h1>
      <p style={{ color: '#888', margin: '0 0 32px' }}>Completa los datos del contrato</p>
      <div style={{ background: 'white', borderRadius: '12px', padding: '32px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#0F2447', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>Empresa</label>
          <input placeholder="Nombre de la empresa" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E0E2E6', fontSize: '14px' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#0F2447', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>RFC</label>
          <input placeholder="RFC de la contraparte" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E0E2E6', fontSize: '14px' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#0F2447', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>Empresa T1</label>
          <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E0E2E6', fontSize: '14px' }}>
            <option>T1.com</option>
            <option>Claro Pagos</option>
          </select>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#0F2447', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>Prioridad</label>
          <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E0E2E6', fontSize: '14px' }}>
            <option>Normal</option>
            <option>Urgente</option>
          </select>
        </div>
        <button style={{ background: '#E8321A', color: 'white', padding: '12px 32px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '16px', cursor: 'pointer', width: '100%' }}>
          Crear Solicitud
        </button>
      </div>
    </div>
  )
}
