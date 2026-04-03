'use client'
import { useState, useEffect } from 'react'
import { obtenerSolicitudes } from '@/lib/supabase/solicitudes'

export default function Reportes() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [periodo, setPeriodo] = useState('todo')

  useEffect(() => {
    obtenerSolicitudes()
      .then(data => { setSolicitudes(data || []); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  const filtrados = solicitudes.filter(s => {
    if (periodo === 'todo') return true
    const fecha = new Date(s.created_at)
    const ahora = new Date()
    const dias = periodo === 'mes' ? 30 : periodo === 'trimestre' ? 90 : 365
    return (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24) <= dias
  })

  const t1 = filtrados.filter(s => s.empresa_t1 === 'T1.com')
  const claro = filtrados.filter(s => s.empresa_t1 === 'Claro Pagos')
  const flujoA = filtrados.filter(s => s.flujo === 'A')
  const flujoB = filtrados.filter(s => s.flujo === 'B')
  const cerrados = filtrados.filter(s => s.estado === 'Cerrado')
  const pendientes = filtrados.filter(s => s.estado === 'Pendiente')
  const urgentes = filtrados.filter(s => s.prioridad === 'Alta')

  const porTipo = filtrados.reduce((acc: any, s) => {
    const tipo = s.tipo_solicitud || 'Sin tipo'
    acc[tipo] = (acc[tipo] || 0) + 1
    return acc
  }, {})

  const porArea = filtrados.reduce((acc: any, s) => {
    const area = s.area || 'Sin area'
    acc[area] = (acc[area] || 0) + 1
    return acc
  }, {})

  const maxTipo = Math.max(...Object.values(porTipo).map(Number), 1)
  const maxArea = Math.max(...Object.values(porArea).map(Number), 1)

  const tasaCierre = filtrados.length > 0 ? Math.round((cerrados.length / filtrados.length) * 100) : 0

  const exportarPDF = () => {
    const contenido = `
T1 LEGAL — REPORTE EJECUTIVO
Periodo: ${periodo === 'todo' ? 'Todo el tiempo' : periodo === 'mes' ? 'Ultimo mes' : periodo === 'trimestre' ? 'Ultimo trimestre' : 'Ultimo año'}
Generado: ${new Date().toLocaleDateString('es-MX')}

RESUMEN EJECUTIVO
Total solicitudes: ${filtrados.length}
Cerradas: ${cerrados.length}
Pendientes: ${pendientes.length}
Urgentes: ${urgentes.length}
Tasa de cierre: ${tasaCierre}%

T1.com: ${t1.length} solicitudes
Claro Pagos: ${claro.length} solicitudes

Flujo A (Socio comercial): ${flujoA.length}
Flujo B (Direccion Juridica): ${flujoB.length}

POR TIPO DE DOCUMENTO
${Object.entries(porTipo).map(([k,v]) => `${k}: ${v}`).join('\n')}

POR AREA SOLICITANTE
${Object.entries(porArea).map(([k,v]) => `${k}: ${v}`).join('\n')}
    `
    const blob = new Blob([contenido], { type:'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_t1_legal_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
  }

  const exportarCSV = () => {
    const headers = ['ID','Nombre','Area','Empresa T1','Tipo','Flujo','Prioridad','Estado','Fecha']
    const rows = filtrados.map(s => [s.id, s.nombre, s.area, s.empresa_t1, s.tipo_solicitud, s.flujo, s.prioridad, s.estado, new Date(s.created_at).toLocaleDateString('es-MX')])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type:'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_t1_legal_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const colores = ['#E8321A','#0F2447','#F59E0B','#0D5C36','#3B82F6','#8B5CF6','#EC4899']

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Reportes</h1>
          <p style={{ color:'#888', margin:0 }}>Metricas y estadisticas del area legal</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={exportarPDF}
            style={{ background:'#E8321A', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
            Exportar reporte
          </button>
          <button onClick={exportarCSV}
            style={{ background:'#0F2447', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
            Exportar CSV
          </button>
        </div>
      </div>

      <div style={{ display:'flex', gap:'8px', marginBottom:'24px' }}>
        {[
          { id:'mes', label:'Ultimo mes' },
          { id:'trimestre', label:'Trimestre' },
          { id:'anio', label:'Ultimo año' },
          { id:'todo', label:'Todo' },
        ].map((p,i) => (
          <button key={i} onClick={() => setPeriodo(p.id)}
            style={{ padding:'8px 20px', borderRadius:'8px', border:`1.5px solid ${periodo===p.id?'#E8321A':'#E8E8E8'}`, background:periodo===p.id?'#FFF5F5':'white', color:periodo===p.id?'#E8321A':'#888', fontWeight:periodo===p.id?700:400, fontSize:'13px', cursor:'pointer' }}>
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {[
          { label:'Total solicitudes', value:filtrados.length, color:'#0F2447', sub:'en el periodo' },
          { label:'Tasa de cierre', value:`${tasaCierre}%`, color:'#0D5C36', sub:`${cerrados.length} cerradas` },
          { label:'Urgentes', value:urgentes.length, color:'#E8321A', sub:'prioridad alta' },
          { label:'Pendientes', value:pendientes.length, color:'#F59E0B', sub:'por atender' },
        ].map((k,i) => (
          <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
            <p style={{ color:'#888', fontSize:'12px', margin:'0 0 8px' }}>{k.label}</p>
            <p style={{ color:k.color, fontSize:'32px', fontWeight:700, margin:'0 0 4px' }}>{cargando?'...':k.value}</p>
            <p style={{ color:'#aaa', fontSize:'11px', margin:0 }}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', marginBottom:'24px' }}>
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
          <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 20px' }}>T1.com vs Claro Pagos</h3>
          <div style={{ display:'flex', gap:'16px', alignItems:'center', marginBottom:'20px' }}>
            <div style={{ flex:1 }}>
              {[
                { label:'T1.com', value:t1.length, color:'#0F2447' },
                { label:'Claro Pagos', value:claro.length, color:'#E8321A' },
              ].map((d,i) => (
                <div key={i} style={{ marginBottom:'14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                    <span style={{ color:'#555', fontSize:'13px' }}>{d.label}</span>
                    <span style={{ color:d.color, fontSize:'13px', fontWeight:700 }}>{d.value}</span>
                  </div>
                  <div style={{ height:'8px', background:'#F0F0F0', borderRadius:'4px' }}>
                    <div style={{ height:'100%', width:filtrados.length>0?`${(d.value/filtrados.length)*100}%`:'0%', background:d.color, borderRadius:'4px' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ width:'100px', height:'100px', position:'relative' }}>
              <svg viewBox="0 0 36 36" style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F0F0F0" strokeWidth="3" />
                {filtrados.length > 0 && (
                  <>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0F2447" strokeWidth="3"
                      strokeDasharray={`${(t1.length/filtrados.length)*100} 100`} />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E8321A" strokeWidth="3"
                      strokeDasharray={`${(claro.length/filtrados.length)*100} 100`}
                      strokeDashoffset={`${-(t1.length/filtrados.length)*100}`} />
                  </>
                )}
              </svg>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {[
              { label:'Flujo A — Socio', value:flujoA.length, color:'#F59E0B' },
              { label:'Flujo B — T1', value:flujoB.length, color:'#1D4ED8' },
            ].map((d,i) => (
              <div key={i} style={{ padding:'12px', background:'#F8F8F8', borderRadius:'8px', textAlign:'center' }}>
                <p style={{ color:d.color, fontSize:'22px', fontWeight:700, margin:'0 0 2px' }}>{d.value}</p>
                <p style={{ color:'#888', fontSize:'11px', margin:0 }}>{d.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
          <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 20px' }}>Por tipo de documento</h3>
          {Object.keys(porTipo).length === 0 ? (
            <p style={{ color:'#888', textAlign:'center', padding:'20px' }}>Sin datos</p>
          ) : (
            Object.entries(porTipo).map(([tipo, cant]: any, i) => (
              <div key={i} style={{ marginBottom:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <span style={{ color:'#555', fontSize:'12px' }}>{tipo}</span>
                  <span style={{ color:'#0F2447', fontSize:'12px', fontWeight:700 }}>{cant}</span>
                </div>
                <div style={{ height:'6px', background:'#F0F0F0', borderRadius:'3px' }}>
                  <div style={{ height:'100%', width:`${(cant/maxTipo)*100}%`, background:colores[i%colores.length], borderRadius:'3px' }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
        <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 20px' }}>Solicitudes por area</h3>
        {Object.keys(porArea).length === 0 ? (
          <p style={{ color:'#888', textAlign:'center', padding:'20px' }}>Sin datos</p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px' }}>
            {Object.entries(porArea).map(([area, cant]: any, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'#F8F8F8', borderRadius:'8px' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:colores[i%colores.length], display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'14px', flexShrink:0 }}>
                  {area.charAt(0)}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:600, margin:'0 0 2px' }}>{area}</p>
                  <div style={{ height:'4px', background:'#E8E8E8', borderRadius:'2px' }}>
                    <div style={{ height:'100%', width:`${(cant/maxArea)*100}%`, background:colores[i%colores.length], borderRadius:'2px' }} />
                  </div>
                </div>
                <span style={{ color:colores[i%colores.length], fontWeight:700, fontSize:'16px' }}>{cant}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
