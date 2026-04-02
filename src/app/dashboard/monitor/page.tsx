'use client'
import { useState } from 'react'

export default function Monitor() {
  const [keywords, setKeywords] = useState(['Ley Fintech','SPEI','IFPE','CoDi','DiMo','PLD','datos personales','firma electronica'])
  const [nuevaKeyword, setNuevaKeyword] = useState('')
  const [tab, setTab] = useState('alertas')
  const [mostrarNuevaFuente, setMostrarNuevaFuente] = useState(false)
  const [nuevaFuente, setNuevaFuente] = useState({ nombre:'', url:'', sector:'', pais:'Mexico' })
  const [fuentes, setFuentes] = useState([
    { nombre:'DOF', url:'dof.gob.mx', sector:'Regulatorio', pais:'Mexico', estado:'OK', ultima:'Hace 2 horas' },
    { nombre:'Banxico', url:'banxico.org.mx', sector:'Financiero', pais:'Mexico', estado:'OK', ultima:'Hace 1 hora' },
    { nombre:'CNBV', url:'cnbv.gob.mx', sector:'Financiero', pais:'Mexico', estado:'OK', ultima:'Hace 30 min' },
    { nombre:'SAT', url:'sat.gob.mx', sector:'Fiscal', pais:'Mexico', estado:'OK', ultima:'Hace 3 horas' },
    { nombre:'IMSS', url:'imss.gob.mx', sector:'Laboral', pais:'Mexico', estado:'OK', ultima:'Hace 5 horas' },
    { nombre:'SCJN', url:'scjn.gob.mx', sector:'Judicial', pais:'Mexico', estado:'OK', ultima:'Hace 1 dia' },
  ])
  const sectores = ['Regulatorio','Financiero','Fiscal','Laboral','Judicial','Propiedad Intelectual','Energetico','Internacional','Comercio','Otro']
  const paises = ['Mexico','Colombia','Estados Unidos','España','Argentina','Brasil','Chile','Peru','Otro']
  const alertas = [
    { titulo:'Nueva circular Banxico — SPEI', fuente:'Banxico', sector:'Financiero', pais:'Mexico', fecha:'04/04/2026', relevancia:'Alta', resumen:'Banxico emite nueva circular sobre operaciones SPEI con nuevos limites de monto.', keywords:['SPEI'] },
    { titulo:'Modificacion Ley Fintech — IFPE', fuente:'DOF', sector:'Regulatorio', pais:'Mexico', fecha:'03/04/2026', relevancia:'Alta', resumen:'Modificaciones al reglamento de IFPE conforme a la Ley Fintech.', keywords:['Ley Fintech','IFPE'] },
    { titulo:'Actualizacion criterios PLD', fuente:'CNBV', sector:'Financiero', pais:'Mexico', fecha:'02/04/2026', relevancia:'Media', resumen:'CNBV actualiza criterios de prevencion de lavado de dinero para fintech.', keywords:['PLD'] },
    { titulo:'Reforma laboral — trabajo remoto', fuente:'IMSS', sector:'Laboral', pais:'Mexico', fecha:'01/04/2026', relevancia:'Media', resumen:'Nuevas disposiciones sobre contratos de trabajo remoto.', keywords:['laboral'] },
  ]
  const agregarKeyword = () => { if (nuevaKeyword.trim()) { setKeywords(k => [...k, nuevaKeyword.trim()]); setNuevaKeyword('') } }
  const agregarFuente = () => { if (nuevaFuente.nombre && nuevaFuente.url) { setFuentes(f => [...f, { ...nuevaFuente, estado:'Verificando', ultima:'Recien agregada' }]); setNuevaFuente({ nombre:'', url:'', sector:'', pais:'Mexico' }); setMostrarNuevaFuente(false) } }
  const tabs = [{id:'alertas',label:'Alertas'},{id:'fuentes',label:'Fuentes y sectores'},{id:'keywords',label:'Keywords'}]

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Monitor Legal</h1>
      <p style={{ color:'#888', margin:'0 0 24px' }}>Monitoreo personalizado — cualquier sector, cualquier pais</p>
      <div style={{ display:'flex', gap:0, marginBottom:'24px', borderBottom:'2px solid #F0F0F0' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:'10px 20px', border:'none', background:'transparent', color:tab===t.id?'#E8321A':'#888', fontWeight:tab===t.id?700:400, fontSize:'13px', cursor:'pointer', borderBottom:tab===t.id?'2px solid #E8321A':'2px solid transparent', marginBottom:'-2px' }}>{t.label}</button>
        ))}
      </div>
      {tab==='alertas' && (
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px' }}>
          <div>
            {alertas.map((a,i) => (
              <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'12px', borderLeft:`4px solid ${a.relevancia==='Alta'?'#E8321A':'#F59E0B'}` }}>
                <div style={{ display:'flex', gap:'8px', marginBottom:'8px', flexWrap:'wrap' }}>
                  <span style={{ background:a.relevancia==='Alta'?'#E8321A':'#F59E0B', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{a.relevancia}</span>
                  <span style={{ background:'#F8F8F8', color:'#555', fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'10px' }}>{a.fuente}</span>
                  <span style={{ background:'#EFF6FF', color:'#1D4ED8', fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'10px' }}>{a.sector}</span>
                  <span style={{ background:'#F0FDF4', color:'#166534', fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'10px' }}>🌎 {a.pais}</span>
                </div>
                <h4 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 6px' }}>{a.titulo}</h4>
                <p style={{ color:'#888', fontSize:'12px', margin:'0 0 8px' }}>{a.fecha}</p>
                <p style={{ color:'#555', fontSize:'13px', lineHeight:'1.6', margin:'0 0 10px' }}>{a.resumen}</p>
                <div style={{ display:'flex', gap:'6px' }}>
                  {a.keywords.map((k,j) => <span key={j} style={{ background:'#EFF6FF', color:'#1D4ED8', fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'10px' }}>{k}</span>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ background:'white', borderRadius:'12px', padding:'18px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ color:'#0F2447', fontSize:'13px', fontWeight:700, margin:'0 0 12px' }}>Estado de fuentes</h3>
              {fuentes.slice(0,5).map((f,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 0', borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#0D5C36', flexShrink:0 }} />
                  <span style={{ color:'#0F2447', fontSize:'12px', fontWeight:600, flex:1 }}>{f.nombre}</span>
                  <span style={{ color:'#888', fontSize:'11px' }}>{f.ultima}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab==='fuentes' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'20px' }}>
            <p style={{ color:'#888', fontSize:'13px', margin:0 }}>Agrega cualquier fuente legal de cualquier pais o sector</p>
            <button onClick={() => setMostrarNuevaFuente(!mostrarNuevaFuente)} style={{ background:'#E8321A', color:'white', border:'none', padding:'8px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>+ Agregar fuente</button>
          </div>
          {mostrarNuevaFuente && (
            <div style={{ background:'#F8F8F8', borderRadius:'12px', padding:'20px', marginBottom:'20px', border:'1.5px solid #E8E8E8' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', color:'#0F2447', fontSize:'12px', fontWeight:600, marginBottom:'5px' }}>Nombre *</label><input value={nuevaFuente.nombre} onChange={e => setNuevaFuente(n => ({...n, nombre:e.target.value}))} placeholder="Ej: Superintendencia Colombia" style={{ width:'100%', padding:'9px 12px', borderRadius:'7px', border:'1.5px solid #E8E8E8', fontSize:'13px', boxSizing:'border-box', outline:'none' }} /></div>
                <div><label style={{ display:'block', color:'#0F2447', fontSize:'12px', fontWeight:600, marginBottom:'5px' }}>URL *</label><input value={nuevaFuente.url} onChange={e => setNuevaFuente(n => ({...n, url:e.target.value}))} placeholder="superfinanciera.gov.co" style={{ width:'100%', padding:'9px 12px', borderRadius:'7px', border:'1.5px solid #E8E8E8', fontSize:'13px', boxSizing:'border-box', outline:'none' }} /></div>
                <div><label style={{ display:'block', color:'#0F2447', fontSize:'12px', fontWeight:600, marginBottom:'5px' }}>Sector</label><select value={nuevaFuente.sector} onChange={e => setNuevaFuente(n => ({...n, sector:e.target.value}))} style={{ width:'100%', padding:'9px 12px', borderRadius:'7px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none', color:'#0F2447' }}><option value="">Selecciona...</option>{sectores.map((s,i) => <option key={i}>{s}</option>)}</select></div>
                <div><label style={{ display:'block', color:'#0F2447', fontSize:'12px', fontWeight:600, marginBottom:'5px' }}>Pais</label><select value={nuevaFuente.pais} onChange={e => setNuevaFuente(n => ({...n, pais:e.target.value}))} style={{ width:'100%', padding:'9px 12px', borderRadius:'7px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none', color:'#0F2447' }}>{paises.map((p,i) => <option key={i}>{p}</option>)}</select></div>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={agregarFuente} style={{ background:'#E8321A', color:'white', border:'none', padding:'8px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Agregar</button>
                <button onClick={() => setMostrarNuevaFuente(false)} style={{ background:'white', color:'#888', border:'1.5px solid #E8E8E8', padding:'8px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Cancelar</button>
              </div>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
            {fuentes.map((f,i) => (
              <div key={i} style={{ background:'white', borderRadius:'12px', padding:'18px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:'#F8F8F8', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#0F2447', fontSize:'14px' }}>{f.nombre.charAt(0)}</div>
                  <div><p style={{ color:'#0F2447', fontWeight:700, fontSize:'13px', margin:'0 0 2px' }}>{f.nombre}</p><p style={{ color:'#888', fontSize:'11px', margin:0 }}>{f.url}</p></div>
                </div>
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px' }}>
                  <span style={{ background:'#EFF6FF', color:'#1D4ED8', fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'10px' }}>{f.sector||'General'}</span>
                  <span style={{ background:'#F0FDF4', color:'#166534', fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'10px' }}>🌎 {f.pais}</span>
                </div>
                <span style={{ background:'#F0FDF4', color:'#166534', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{f.estado}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='keywords' && (
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color:'#0F2447', fontSize:'15px', fontWeight:700, margin:'0 0 8px' }}>Keywords monitoreadas</h3>
          <p style={{ color:'#888', fontSize:'13px', margin:'0 0 20px' }}>El sistema alerta cuando estas palabras aparecen en las fuentes. Agrega o elimina segun tus necesidades.</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'20px' }}>
            {keywords.map((k,i) => (
              <span key={i} onClick={() => setKeywords(kw => kw.filter((_,j) => j!==i))} style={{ background:'#EFF6FF', color:'#1D4ED8', fontSize:'12px', fontWeight:600, padding:'6px 12px', borderRadius:'20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', border:'1px solid #BFDBFE' }}>
                {k} <span style={{ color:'#93C5FD' }}>✕</span>
              </span>
            ))}
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <input value={nuevaKeyword} onChange={e => setNuevaKeyword(e.target.value)} onKeyDown={e => e.key==='Enter'&&agregarKeyword()} placeholder="Agrega una keyword — Ej: sector energetico, ley colombia..." style={{ flex:1, padding:'11px 16px', borderRadius:'9px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none' }} />
            <button onClick={agregarKeyword} style={{ background:'#E8321A', color:'white', border:'none', padding:'11px 24px', borderRadius:'9px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Agregar</button>
          </div>
        </div>
      )}
    </div>
  )
}
