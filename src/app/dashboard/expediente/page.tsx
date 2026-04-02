'use client'
import { useState } from 'react'

export default function Expediente() {
  const [busqueda, setBusqueda] = useState('')
  const [expediente, setExpediente] = useState<any>(null)

  const expedientes = [
    {
      id:'C-2026-001', empresa:'Empresa Solistica S.A. de C.V.', tipo:'Contrato de servicios',
      estado:'En proceso', empresa_t1:'T1.com', fecha:'01/04/2026', responsable:'Jovanni Poceros',
      rfc:'SOL920301ABC', apoderado:'Carlos Ramirez Lopez', vigencia:'12 meses',
      semaforo:'amarillo',
      carpetas:['01 Solicitud','02 Documentos','03 Analisis Legal','04 Negociacion','05 Firma','06 Cierre'],
      timeline:[
        { fecha:'01/04/2026 09:00', evento:'Solicitud recibida de T1 Pagos — Comercial', tipo:'solicitud', autor:'Sistema' },
        { fecha:'01/04/2026 09:05', evento:'Expediente creado automaticamente', tipo:'sistema', autor:'Sistema' },
        { fecha:'02/04/2026 10:30', evento:'Jovanni inicio revision del contrato', tipo:'legal', autor:'Jovanni Poceros' },
        { fecha:'02/04/2026 11:15', evento:'Clausula III enviada a estudio IA — Riesgo detectado: plazo 90 dias', tipo:'ia', autor:'Claude' },
        { fecha:'02/04/2026 11:20', evento:'Clausula III modificada — Reducida a 30 dias habiles', tipo:'cambio', autor:'Jovanni Poceros' },
        { fecha:'03/04/2026 09:00', evento:'Version 2 enviada a Finanzas para revision', tipo:'colaboracion', autor:'Jovanni Poceros' },
        { fecha:'03/04/2026 16:45', evento:'VoBo de Finanzas recibido', tipo:'vobo', autor:'Finanzas' },
        { fecha:'04/04/2026 10:00', evento:'Version 3 enviada al solicitante para revision', tipo:'envio', autor:'Jovanni Poceros' },
      ],
      trackingLegal:[
        { fecha:'02/04/2026', accion:'Clausula III — Riesgo alto detectado por IA', tipo:'ia' },
        { fecha:'02/04/2026', accion:'Clausula I — Penalizacion 50% inaceptable', tipo:'estudio' },
        { fecha:'03/04/2026', accion:'Ambas clausulas modificadas y aprobadas', tipo:'cambio' },
      ],
      trackingComercial:[
        { fecha:'01/04/2026', accion:'Solicitud recibida', tipo:'recibido' },
        { fecha:'04/04/2026', accion:'Documento enviado al solicitante — Version 3 PDF', tipo:'envio' },
        { fecha:'04/04/2026', accion:'Solicitante descargo el documento 04/04 14:32', tipo:'descarga' },
      ],
    }
  ]

  const buscar = () => {
    const found = expedientes.find(e => e.id.toLowerCase().includes(busqueda.toLowerCase()) || e.empresa.toLowerCase().includes(busqueda.toLowerCase()))
    setExpediente(found || null)
  }

  const semaforo = (s: string) => s==='verde'?'#0D5C36':s==='amarillo'?'#F59E0B':'#E8321A'

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Expediente Digital</h1>
      <p style={{ color:'#888', margin:'0 0 24px' }}>Busca por ID o empresa para ver el expediente completo</p>

      <div style={{ display:'flex', gap:'10px', marginBottom:'24px' }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key==='Enter'&&buscar()}
          placeholder="Buscar por ID (C-2026-001) o nombre de empresa..."
          style={{ flex:1, padding:'12px 16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'14px', outline:'none' }} />
        <button onClick={buscar}
          style={{ background:'#E8321A', color:'white', border:'none', padding:'12px 24px', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
          Buscar
        </button>
        <button onClick={() => setExpediente(expedientes[0])}
          style={{ background:'#0F2447', color:'white', border:'none', padding:'12px 24px', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
          Ver C-2026-001
        </button>
      </div>

      {expediente && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px', marginBottom:'24px' }}>
            <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                    <span style={{ background:'#0F2447', color:'white', fontSize:'13px', fontWeight:700, padding:'3px 12px', borderRadius:'20px' }}>{expediente.id}</span>
                    <span style={{ background:'#EFF6FF', color:'#1D4ED8', fontSize:'12px', fontWeight:700, padding:'3px 10px', borderRadius:'20px' }}>{expediente.estado}</span>
                    <span style={{ width:'12px', height:'12px', borderRadius:'50%', background:semaforo(expediente.semaforo), display:'inline-block' }} title="Semaforo de vigencia" />
                  </div>
                  <h2 style={{ color:'#0F2447', fontSize:'18px', fontWeight:700, margin:'0 0 4px' }}>{expediente.empresa}</h2>
                  <p style={{ color:'#888', fontSize:'13px', margin:0 }}>{expediente.tipo} — {expediente.empresa_t1}</p>
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button style={{ background:'#E8321A', color:'white', border:'none', padding:'8px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Ir al editor</button>
                  <button style={{ background:'#0F2447', color:'white', border:'none', padding:'8px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Negociacion</button>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
                {[
                  {label:'RFC', value:expediente.rfc},
                  {label:'Apoderado', value:expediente.apoderado},
                  {label:'Vigencia', value:expediente.vigencia},
                  {label:'Responsable', value:expediente.responsable},
                  {label:'Fecha creacion', value:expediente.fecha},
                  {label:'Empresa T1', value:expediente.empresa_t1},
                ].map((d,i) => (
                  <div key={i} style={{ padding:'10px 14px', background:'#F8F8F8', borderRadius:'8px' }}>
                    <p style={{ color:'#888', fontSize:'11px', fontWeight:700, margin:'0 0 2px' }}>{d.label.toUpperCase()}</p>
                    <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:0 }}>{d.value}</p>
                  </div>
                ))}
              </div>

              <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 14px' }}>Linea de tiempo completa</h3>
              <div style={{ position:'relative', paddingLeft:'24px' }}>
                <div style={{ position:'absolute', left:'8px', top:0, bottom:0, width:'2px', background:'#F0F0F0' }} />
                {expediente.timeline.map((t: any,i: number) => (
                  <div key={i} style={{ position:'relative', marginBottom:'14px' }}>
                    <div style={{ position:'absolute', left:'-20px', top:'4px', width:'10px', height:'10px', borderRadius:'50%', background:
                      t.tipo==='ia'?'#8B5CF6':t.tipo==='cambio'?'#E8321A':t.tipo==='envio'?'#0D5C36':t.tipo==='vobo'?'#3B82F6':'#0F2447' }} />
                    <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:600, margin:'0 0 2px' }}>{t.evento}</p>
                    <p style={{ color:'#aaa', fontSize:'11px', margin:0 }}>{t.fecha} — {t.autor}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 14px' }}>Carpetas del expediente</h3>
                {expediente.carpetas.map((c: string,i: number) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px', borderRadius:'7px', border:'1px solid #F0F0F0', marginBottom:'5px', cursor:'pointer', background:'#FAFAFA' }}>
                    <span style={{ fontSize:'14px' }}>📁</span>
                    <span style={{ color:'#0F2447', fontSize:'12px', fontWeight:500 }}>{c}</span>
                  </div>
                ))}
              </div>

              <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color:'#0F2447', fontSize:'13px', fontWeight:700, margin:'0 0 12px' }}>Tracking legal</h3>
                <p style={{ color:'#888', fontSize:'11px', margin:'0 0 8px' }}>Solo visible para el equipo legal</p>
                {expediente.trackingLegal.map((t: any,i: number) => (
                  <div key={i} style={{ padding:'8px 0', borderBottom:'1px solid #F0F0F0' }}>
                    <p style={{ color:'#0F2447', fontSize:'11px', fontWeight:600, margin:'0 0 2px' }}>{t.accion}</p>
                    <p style={{ color:'#aaa', fontSize:'10px', margin:0 }}>{t.fecha}</p>
                  </div>
                ))}
              </div>

              <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color:'#0F2447', fontSize:'13px', fontWeight:700, margin:'0 0 12px' }}>Tracking comercial</h3>
                <p style={{ color:'#888', fontSize:'11px', margin:'0 0 8px' }}>Visible para el solicitante</p>
                {expediente.trackingComercial.map((t: any,i: number) => (
                  <div key={i} style={{ padding:'8px 0', borderBottom:'1px solid #F0F0F0' }}>
                    <p style={{ color:'#0F2447', fontSize:'11px', fontWeight:600, margin:'0 0 2px' }}>{t.accion}</p>
                    <p style={{ color:'#aaa', fontSize:'10px', margin:0 }}>{t.fecha}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!expediente && (
        <div style={{ background:'white', borderRadius:'16px', padding:'48px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', textAlign:'center' }}>
          <p style={{ fontSize:'32px', marginBottom:'16px' }}>📁</p>
          <p style={{ color:'#0F2447', fontWeight:700, fontSize:'16px', margin:'0 0 8px' }}>Busca un expediente</p>
          <p style={{ color:'#888', fontSize:'13px', margin:0 }}>Escribe el ID o nombre de la empresa para ver el expediente completo</p>
        </div>
      )}
    </div>
  )
}
