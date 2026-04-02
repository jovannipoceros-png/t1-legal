export default function Editor() {
  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#0F2447', fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>Editor de Contratos</h1>
      <p style={{ color: '#888', margin: '0 0 32px' }}>Redacta, edita y gestiona contratos</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Negrita','Cursiva','Subrayado','Alinear','Lista','Tabla'].map((t,i) => (
                <button key={i} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #E0E2E6', background: 'white', color: '#0F2447', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', minHeight: '500px' }}>
            <p style={{ color: '#0F2447', fontWeight: 700, textAlign: 'center', marginBottom: '8px', fontSize: '16px' }}>CONTRATO DE PRESTACION DE SERVICIOS</p>
            <p style={{ color: '#888', fontSize: '13px', lineHeight: '1.8' }}>
              Que celebran por una parte <strong>[NOMBRE CLIENTE]</strong>, en adelante "EL CLIENTE", 
              representado por <strong>[AP
mkdir -p src/app/dashboard/editor && cat > src/app/dashboard/editor/page.tsx << 'ENDOFFILE'
export default function Editor() {
  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#0F2447', fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>Editor de Contratos</h1>
      <p style={{ color: '#888', margin: '0 0 32px' }}>Redacta, edita y gestiona contratos</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Negrita','Cursiva','Subrayado','Alinear','Lista','Tabla'].map((t,i) => (
                <button key={i} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #E0E2E6', background: 'white', color: '#0F2447', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', minHeight: '500px' }}>
            <p style={{ color: '#0F2447', fontWeight: 700, textAlign: 'center', marginBottom: '8px', fontSize: '16px' }}>CONTRATO DE PRESTACION DE SERVICIOS</p>
            <p style={{ color: '#888', fontSize: '13px', lineHeight: '1.8' }}>
              Que celebran por una parte <strong>[NOMBRE CLIENTE]</strong>, en adelante "EL CLIENTE", 
              representado por <strong>[APODERADO]</strong>, con RFC <strong>[RFC]</strong>; 
              y por la otra parte <strong>T1 Pagos S.A. de C.V.</strong>, en adelante "T1", 
              al tenor de las siguientes clausulas...
            </p>
            <br />
            <p style={{ color: '#ccc', fontSize: '13px', fontStyle: 'italic' }}>Continua editando aqui...</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ color: '#0F2447', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Plantillas</h3>
            {['Contrato Cliente','Contrato Proveedor','NDA','Convenio Modificatorio','Anexo'].map((p,i) => (
              <div key={i} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #F0F0F0', marginBottom: '6px', cursor: 'pointer', fontSize: '13px', color: '#0F2447' }}>📄 {p}</div>
            ))}
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ color: '#0F2447', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Acciones</h3>
            {[
              { label: 'Guardar borrador', color: '#0F2447' },
              { label: 'Enviar a revision', color: '#3B82F6' },
              { label: 'Exportar PDF', color: '#0D5C36' },
              { label: 'Firmar', color: '#E8321A' },
            ].map((a,i) => (
              <button key={i} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: a.color, color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginBottom: '8px' }}>{a.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
