'use client'
import { useState } from 'react'

type Solicitud = {
  id: string
  tipo: string
  empresa: string
  estado: string
  fecha: string
  paso: number
  flujo: string
  confidencial: boolean
  resumen: string
  solicitante?: string
}

export default function Portal() {
  const [vistaLider, setVistaLider] = useState(false)
  const pasos = ['Recibida','En revision','En negociacion','Lista para firma','Cerrada']

  const misSolicitudes: Solicitud[] = [
    { id:'C-2026-003', tipo:'Anexo', empresa:'T1.com', estado:'Pendiente', fecha:'03/04/2026', paso:0, flujo:'B', confidencial:true, resumen:'Solicitud recibida. El area legal la revisara pronto.' },
  ]

  const solicitudesEquipo: Solicitud[] = [
    { id:'C-2026-001', tipo:'Contrato de servicios', empresa:'T1.com', estado:'En proceso', fecha:'01/04/2026', paso:2, flujo:'A', confidencial:false, solicitante:'Colaborador — Ultima Milla', resumen:'En revision legal. Se detectaron 3 clausulas de riesgo.' },
    { id:'C-2026-002', tipo:'Convenio de Confidencialidad', empresa:'Claro Pagos', estado:'Pendiente', fecha:'02/04/2026', paso:0, flujo:'B', confidencial:false, solicitante:'Colaborador — Marketing', resumen:'Solicitud recibida. Pendiente de asignacion.' },
    { id:'C-2026-003', tipo:'Anexo', empresa:'T1.com', estado:'Pendiente', fecha:'03/04/2026', paso:0, flujo:'B', confidencial:true, solicitante:'Tu solicitud', resumen:'Solicitud confidencial.' },
  ]

  const solicitudes = vistaLider ? solicitudesEquipo : misSolicitudes
  const kpis = vistaLider
    ? [
        { label:'Total equipo', value:solicitudesEquipo.length, color:'#0F2447' },
        { label:'En proceso', value:solicitudesEquipo.filter(s=>s.estado==='En proceso').length, color:'#1D4ED8' },
        { label:'Pendientes', value:solicitudesEquipo.filter(s=>s.estado==='Pendiente').length, color:'#F59E0B' },
        { label:'Confidenciales', value:solicitudesEquipo.filter(s=>s.confidencial).length, color:'#E8321A' },
      ]
    : [
        { label:'Mis solicitudes', value:misSolicitudes.length, color:'#0F2447' },
        { label:'En proceso', value:misSolicitudes.filter(s=>s.estado==='En proceso').length, color:'#1D4ED8' },
        { label:'Pendientes', value:misSolicitudes.filter(s=>s.estado==='Pendiente').length, color:'#F59E0B' },
        { label:'Cerradas', value:misSolicitudes.filter(s=>s.estado==='Cerrada').length, color:'#0D5C36' },
      ]

  return (
    <div style={{ minHeight:'100vh', background:'#F5F6F7', fontFamily:'sans-serif' }}>
      <div style={{ background:'#0F2447', padding:'0 32px' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:'64px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ background:'#E8321A', color:'white', fontWeight:900, fontSize:'16px', padding:'3px 10px', borderRadius:'4px' }}>T1</span>
            <span style={{ color:'white', fontWeight:700 }}>Legal — Mi Portal</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <button onClick={() => setVistaLider(!vistaLider)}
              style={{ background:vistaLider?'#E8321A':'rgba(255,255,255,0.1)', color:'white', border:'1px solid rgba(255,255,255,0.2)', padding:'6px 14px', borderRadius:'6px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
              {vistaLider?'Mi vista':'Vista lider'}
            </button>
            <a href="/login" style={{ color:'#B0C4DE', fontSize:'13px', textDecoration:'none', border:'1px solid rgba(255,255,255,0.2)', padding:'4px 12px', borderRadius:'6px' }}>Salir</a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'40px 32px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
          <div>
            <h1 style={{ color:'#0F2447', fontSize:'26px', fontWeight:700, margin:'0 0 4px' }}>
              {vistaLider?'Solicitudes de mi equipo':'Mis Solicitudes'}
            </h1>
            <p style={{ color:'#888', margin:0 }}>Seguimiento en tiempo real de tus contratos</p>
          </div>
          <a href="/solicitar" style={{ background:'#E8321A', color:'white', padding:'12px 24px', borderRadius:'10px', textDecoration:'none', fontWeight:700, fontSize:'14px' }}>+ Nueva solicitud</a>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'32px' }}>
          {kpis.map((k,i) => (
            <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <p style={{ color:'#888', fontSize:'13px', margin:'0 0 8px' }}>{k.label}</p>
              <p style={{ color:k.color, fontSize:'32px', fontWeight:700, margin:0 }}>{k.value}</p>
            </div>
          ))}
        </div>

        {solicitudes.map((s,i) => (
          <div key={i} style={{ background:'white', borderRadius:'16px', padding:'28px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'16px', borderLeft:`4px solid ${s.flujo==='A'?'#F59E0B':'#1D4ED8'}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', flexWrap:'wrap' }}>
                  <span style={{ background:'#0F2447', color:'white', fontSize:'12px', fontWeight:700, padding:'3px 10px', borderRadius:'20px' }}>{s.id}</span>
                  <span style={{ background:s.flujo==='A'?'#FEF3C7':'#EFF6FF', color:s.flujo==='A'?'#92400E':'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                    {s.flujo==='A'?'Documento del socio':'Documento T1'}
                  </span>
                  {s.confidencial && <span style={{ background:'#FFF5F5', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', border:'1px solid #FFD0CC' }}>Confidencial</span>}
                  <span style={{ background:s.estado==='En proceso'?'#EFF6FF':s.estado==='Pendiente'?'#FEF3C7':'#F0FDF4', color:s.estado==='En proceso'?'#1D4ED8':s.estado==='Pendiente'?'#92400E':'#166534', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{s.estado}</span>
                </div>
                <h3 style={{ color:'#0F2447', fontSize:'16px', fontWeight:700, margin:'0 0 4px' }}>{s.tipo}</h3>
                <p style={{ color:'#888', fontSize:'13px', margin:'0 0 4px' }}>{s.empresa} — Enviada el {s.fecha}</p>
                {vistaLider && s.solicitante && <p style={{ color:'#888', fontSize:'12px', margin:0 }}>{s.solicitante}</p>}
                {s.resumen && !s.confidencial && <p style={{ color:'#555', fontSize:'12px', margin:'6px 0 0', fontStyle:'italic' }}>{s.resumen}</p>}
                {s.confidencial && vistaLider && <p style={{ color:'#C42A15', fontSize:'12px', margin:'6px 0 0', fontWeight:600 }}>Contenido confidencial</p>}
              </div>
            </div>
            {!s.confidencial && (
              <div>
                <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, marginBottom:'16px' }}>Seguimiento:</p>
                <div style={{ position:'relative', padding:'8px 0 32px' }}>
                  <div style={{ position:'absolute', top:'20px', left:'5%', right:'5%', height:'3px', background:'#E0E2E6' }} />
                  <div style={{ position:'absolute', top:'20px', left:'5%', width:`${(s.paso/(pasos.length-1))*90}%`, height:'3px', background:'#E8321A' }} />
                  <div style={{ display:'flex', justifyContent:'space-between', position:'relative' }}>
                    {pasos.map((p,j) => (
                      <div key={j} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', width:'20%' }}>
                        <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:j<=s.paso?'#E8321A':'white', border:`3px solid ${j<=s.paso?'#E8321A':'#E0E2E6'}`, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1 }}>
                          {j<s.paso && <span style={{ color:'white', fontSize:'14px', fontWeight:700 }}>✓</span>}
                          {j===s.paso && <span style={{ width:'10px', height:'10px', background:'white', borderRadius:'50%', display:'block' }} />}
                        </div>
                        <span style={{ fontSize:'11px', color:j<=s.paso?'#0F2447':'#888', fontWeight:j===s.paso?700:400, textAlign:'center' }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
// updated Thu Apr  2 22:18:11 UTC 2026
