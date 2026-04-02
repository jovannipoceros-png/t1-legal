export default function Solicitar() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F2447', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '32px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '580px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ background: '#E8321A', color: 'white', fontWeight: 900, fontSize: '20px', padding: '4px 14px', borderRadius: '6px' }}>T1</span>
          <h1 style={{ color: '#0F2447', fontSize: '22px', fontWeight: 700, margin: '16px 0 4px' }}>Nueva Solicitud Legal</h1>
          <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>El area legal recibira tu solicitud y te contactara</p>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#0F2447', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Nombre completo *</label>
          <input placeholder="Ej. Juan Garcia" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #E0E2E6', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#0F2447', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Correo electronico *</label>
          <input placeholder="tu@t1.com" type="email" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #E0E2E6', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#0F2447', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Area *</label>
            <select style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #E0E2E6', fontSize: '14px', boxSizing: 'border-box' }}>
              <option value="">Selecciona...</option>
              <option>Comercial</option>
              <option>Finanzas</option>
              <option>Tecnologia</option>
              <option>Operaciones</option>
              <option>Recursos Humanos</option>
git add . && git commit -m "feat: formulario solicitar" && git push origin main
