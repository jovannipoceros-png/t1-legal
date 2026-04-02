'use client'
import { useState } from 'react'

export default function Solicitudes() {
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')

  const solicitudes = [
    { id:'C-2026-001', nombre:'Carlos Mendoza', area:'Ultima Milla', empresa_t1:'T1.com', tipo:'Contrato de servicios', prioridad:'Alta', estado:'En proceso', flujo:'A', riesgos:3, confidencial:false, fecha:'01/04/2026', resumen_riesgo:'Penalizacion 50% valor total · Pago 90 dias sin penalizacion · Vigencia indefinida' },
    { id:'C-2026-002', nombre:'Laura Reyes', area:'Marketing', empresa_t1:'Claro Pagos', tipo:'Convenio de Confidencialidad', prioridad:'Media', estado:'Pendiente', flujo:'B', riesgos:0, confidencial:false, fecha:'02/04/2026', resumen_riesgo:'' },
    { id:'C-2026-003', nombre:'Roberto Salas', area:'Comercial', empresa_t1:'T1.com', tipo:'Anexo', prioridad:'Baja', estado:'Pendiente', flujo:'B', riesgos:0, confidencial:true, fecha:'03/04/2026', resumen_riesgo:'' },
    { id:'C-2026-004', nombre:'Diana Torres', area:'TI', empresa_t1:'T1.com', tipo:'Contrato de servicios', prioridad:'Alta', estado:'En proceso', flujo:'A', riesgos:2, confidencial:false, fecha:'04/04/2026', resumen_riesgo:'Clausula de propiedad intelectual desfavorable · Pago a 60 dias sin garantia' },
  ]

  const filtradas = solicitudes.filter(s => {
    const matchFiltro = filtro==='todas' || (filtro==='flujoA' && s.flujo==='A') || (filtro==='flujoB' && s.flujo==='B') || (filtro==='riesgo' && s.riesgos>0) || (filtro==='confidencial' && s.confidencial)
    const matchBusqueda = s.nombre.toLowerCase().includes(busqueda.toLowerCase()) || s.id.toLowerCase().includes(busqueda.toLowerCase()) || s.area.toLowerCase().includes(busqueda.toLowerCase())
    return matchFiltro && matchBusqueda
  })

  const prioridadColor: Record<string,string> = { Alta:'#E8321A', Media:'#F59E0B', Baja:'#0D5C36' }
  const estadoColor: Record<string,{bg:string,color:string}> = {
    'En proceso': { bg:'#EFF6FF', color:'#1D4ED8' },
    'Pendiente': { bg:'#FEF3C7', color:'#92400E' },
    'Cerrado': { bg:'#F0FDF4', color:'#166534' },
  }

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
        <div>
          <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Solicitudes</h1>
          <p style={{ color:'#888', margin:0 }}>Todas las solicitudes recibidas</p>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {[
          { label:'Total', value:solicitudes.length, color:'#0F2447' },
          { label:'Con riesgo detectado', value:solicitudes.filter(s=>s.riesgos>0).length, color:'#E8321A' },
          { label:'Flujo A — Socio', value:solicitudes.filter(s=>s.flujo==='A').length, color:'#F59E0B' },
          { label:'Flujo B — T1', value:solicitudes.filter(s=>s.flujo==='B').length, color:'#1D4ED8' },
        ].map((k,i) => (
          <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ color:'#888', fontSize:'12px', margin:'0 0 8px' }}>{k.label}</p>
            <p style={{ color:k.color, fontSize:'32px', fontWeight:700, margin:0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, ID o area..."
            style={{ flex:1, minWidth:'200px', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none' }} />
          {[
            { id:'todas', label:'Todas' },
            { id:'riesgo', label:'⚠️ Con riesgo' },
            { id:'flujoA', label:'📄 Flujo A' },
            { id:'flujoB', label:'⚖️ Flujo B' },
            { id:'confidencial', label:'🔒 Confidencial' },
          ].map((f,i) => (
            <button key={i} onClick={() => setFiltro(f.id)}
              style={{ padding:'10px 16px', borderRadius:'8px', border:`1.5px solid ${filtro===f.id?'#E8321A':'#E8E8E8'}`, background:filtro===f.id?'#FFF5F5':'white', color:filtro===f.id?'#E8321A':'#888', fontWeight:filtro===f.id?700:400, fontSize:'13px', cursor:'pointer' }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {filtradas.map((s,i) => (
            <div key={i} style={{ borderRadius:'12px', border:`1.5px solid ${s.riesgos>0?'#FCA5A5':'#F0F0F0'}`, padding:'16px 20px', background:s.riesgos>0?'#FFFAFA':'white', position:'relative', overflow:'hidden' }}>
              {s.riesgos>0 && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'#E8321A' }} />}
              {s.flujo==='B' && s.riesgos===0 && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'#1D4ED8' }} />}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                  <span style={{ background:'#0F2447', color:'white', fontSize:'12px', fontWeight:700, padding:'3px 10px', borderRadius:'20px' }}>{s.id}</span>
                  <span style={{ background:s.flujo==='A'?'#FEF3C7':'#EFF6FF', color:s.flujo==='A'?'#92400E':'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                    {s.flujo==='A'?'📄 Socio comercial':'⚖️ Direccion Juridica T1'}
                  </span>
                  {s.confidencial && <span style={{ background:'#FFF5F5', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', border:'1px solid #FFD0CC' }}>🔒 Confidencial</span>}
                  {s.riesgos>0 && <span style={{ background:'#FEE2E2', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>⚠️ {s.riesgos} riesgo{s.riesgos>1?'s':''} detectado{s.riesgos>1?'s':''}</span>}
                  <span style={{ background:estadoColor[s.estado]?.bg, color:estadoColor[s.estado]?.color, fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{s.estado}</span>
                </div>
                <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                  <span style={{ background:prioridadColor[s.prioridad]+'20', color:prioridadColor[s.prioridad], fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{s.prioridad}</span>
                  <span style={{ color:'#888', fontSize:'11px' }}>{s.fecha}</span>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                <div>
                  <p style={{ color:'#0F2447', fontWeight:700, fontSize:'14px', margin:'0 0 2px' }}>{s.nombre} — {s.area}</p>
                  <p style={{ color:'#888', fontSize:'12px', margin:'0 0 4px' }}>{s.tipo} · {s.empresa_t1}</p>
                  {s.resumen_riesgo && (
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <span style={{ color:'#E8321A', fontSize:'11px' }}>⚠️</span>
                      <p style={{ color:'#C42A15', fontSize:'11px', margin:0, fontWeight:600 }}>{s.resumen_riesgo}</p>
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', gap:'6px' }}>
                  <button style={{ background:'#E8321A', color:'white', border:'none', padding:'7px 16px', borderRadius:'7px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Abrir en Editor</button>
                  <button style={{ background:'#0F2447', color:'white', border:'none', padding:'7px 16px', borderRadius:'7px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Ver expediente</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
