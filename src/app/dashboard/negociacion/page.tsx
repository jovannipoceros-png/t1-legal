'use client'
import { useState } from 'react'

export default function Negociacion() {
  const [ronda, setRonda] = useState(1)
  const [tab, setTab] = useState('clausulas')

  const clausulas = [
    { id:1, titulo:'III. Pago', original:'El pago se realizara a 90 dias naturales sin penalizacion por retraso.', riesgo:'Alto', recomendacion:'Reducir a 30 dias habiles con penalizacion del 2% mensual por retraso.', contrapropuesta:'El pago se realizara dentro de los 30 dias habiles siguientes a la facturacion. En caso de retraso se aplicara una penalizacion del 2% mensual sobre el saldo insoluto.', decision:'' },
    { id:2, titulo:'I. Objeto', original:'Los servicios incluiran penalizacion del 50% sobre el valor total a cargo de T1.', riesgo:'Alto', recomendacion:'Limitar penalizacion al 10% y establecer causas especificas de incumplimiento.', contrapropuesta:'La penalizacion por incumplimiento se limitara al 10% del valor total del contrato, aplicable unicamente en casos de incumplimiento total y debidamente documentado.', decision:'' },
    { id:3, titulo:'II. Vigencia', original:'El contrato tendra vigencia indefinida sin posibilidad de rescision unilateral.', riesgo:'Medio', recomendacion:'Agregar clausula de rescision con 30 dias de anticipacion para ambas partes.', contrapropuesta:'El contrato tendra vigencia de 12 meses, renovable automaticamente. Cualquiera de las partes podra rescindirlo con 30 dias naturales de anticipacion.', decision:'' },
  ]

  const [decisiones, setDecisiones] = useState<Record<number,string>>({})

  const setDecision = (id: number, d: string) => setDecisiones(prev => ({...prev, [id]: d}))

  const tabs = [{id:'clausulas',label:'Clausulas'},{id:'resultado',label:'Documento resultado'},{id:'historial',label:'Historial de rondas'}]

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
        <div>
          <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Negociacion</h1>
          <p style={{ color:'#888', margin:0 }}>C-2026-001 — Empresa Solistica — Ronda {ronda}</p>
        </div>
        <button onClick={() => setRonda(r => r+1)}
          style={{ background:'#0F2447', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
          + Nueva ronda
        </button>
      </div>

      <div style={{ display:'flex', gap:'0', marginBottom:'24px', borderBottom:'2px solid #F0F0F0' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:'10px 20px', border:'none', background:'transparent', color:tab===t.id?'#E8321A':'#888', fontWeight:tab===t.id?700:400, fontSize:'13px', cursor:'pointer', borderBottom:tab===t.id?'2px solid #E8321A':'2px solid transparent', marginBottom:'-2px' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'clausulas' && (
        <div>
          <div style={{ background:'#FFF8F0', border:'1px solid #FED7AA', borderRadius:'10px', padding:'12px 18px', marginBottom:'20px' }}>
            <p style={{ color:'#92400E', fontSize:'13px', margin:0 }}>📎 Contrato de la contraparte cargado — Solistica_v2.pdf — Ronda {ronda} — {clausulas.length} clausulas para revisar</p>
          </div>
          {clausulas.map((c,i) => (
            <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                <h3 style={{ color:'#0F2447', fontSize:'15px', fontWeight:700, margin:0 }}>{c.titulo}</h3>
                <span style={{ background:c.riesgo==='Alto'?'#E8321A':'#F59E0B', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{c.riesgo}</span>
                {decisiones[c.id] && <span style={{ background:'#0D5C36', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>✓ {decisiones[c.id]}</span>}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
                <div>
                  <p style={{ color:'#888', fontSize:'11px', fontWeight:700, margin:'0 0 6px' }}>TEXTO ORIGINAL</p>
                  <div style={{ background:'#FEE2E2', borderRadius:'8px', padding:'12px' }}>
                    <p style={{ color:'#555', fontSize:'13px', margin:0, lineHeight:'1.6' }}>{c.original}</p>
                  </div>
                </div>
                <div>
                  <p style={{ color:'#888', fontSize:'11px', fontWeight:700, margin:'0 0 6px' }}>CONTRAPROPUESTA T1</p>
                  <div style={{ background:'#F0FDF4', borderRadius:'8px', padding:'12px' }}>
                    <p style={{ color:'#555', fontSize:'13px', margin:0, lineHeight:'1.6' }}>{c.contrapropuesta}</p>
                  </div>
                </div>
              </div>
              <div style={{ background:'#EFF6FF', borderRadius:'8px', padding:'10px 14px', marginBottom:'14px' }}>
                <p style={{ color:'#1D4ED8', fontSize:'12px', margin:0 }}>💡 {c.recomendacion}</p>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={() => setDecision(c.id,'Aceptado')}
                  style={{ flex:1, padding:'9px', borderRadius:'7px', border:'none', background:decisiones[c.id]==='Aceptado'?'#0D5C36':'#F0FDF4', color:decisiones[c.id]==='Aceptado'?'white':'#0D5C36', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
                  ✓ Aceptar original
                </button>
                <button onClick={() => setDecision(c.id,'Contrapropuesta')}
                  style={{ flex:1, padding:'9px', borderRadius:'7px', border:'none', background:decisiones[c.id]==='Contrapropuesta'?'#0F2447':'#EFF6FF', color:decisiones[c.id]==='Contrapropuesta'?'white':'#0F2447', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
                  ↔ Usar contrapropuesta
                </button>
                <button onClick={() => setDecision(c.id,'Rechazado')}
                  style={{ flex:1, padding:'9px', borderRadius:'7px', border:'none', background:decisiones[c.id]==='Rechazado'?'#E8321A':'#FFF5F5', color:decisiones[c.id]==='Rechazado'?'white':'#E8321A', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
                  ✗ Rechazar
                </button>
              </div>
            </div>
          ))}
          <div style={{ display:'flex', gap:'10px', marginTop:'8px' }}>
            <button style={{ background:'#E8321A', color:'white', border:'none', padding:'12px 24px', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
              Generar documento resultado
            </button>
            <button style={{ background:'#0F2447', color:'white', border:'none', padding:'12px 24px', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
              Pasar al editor
            </button>
          </div>
        </div>
      )}

      {tab === 'resultado' && (
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color:'#0F2447', fontSize:'16px', fontWeight:700, margin:'0 0 20px' }}>Documento resultado — Ronda {ronda}</h3>
          <div style={{ background:'#F8F8F8', borderRadius:'10px', padding:'24px', minHeight:'300px', border:'1.5px solid #E8E8E8', marginBottom:'16px' }}>
            <p style={{ color:'#0F2447', fontWeight:700, textAlign:'center', marginBottom:'20px' }}>CONTRATO DE PRESTACION DE SERVICIOS — VERSION NEGOCIADA</p>
            {clausulas.map((c,i) => (
              <div key={i} style={{ marginBottom:'16px', padding:'12px', background:'white', borderRadius:'8px', borderLeft:`4px solid ${decisiones[c.id]==='Contrapropuesta'?'#0D5C36':decisiones[c.id]==='Aceptado'?'#3B82F6':'#E8E8E8'}` }}>
                <p style={{ color:'#0F2447', fontWeight:700, fontSize:'13px', margin:'0 0 6px' }}>{c.titulo}</p>
                <p style={{ color:'#555', fontSize:'13px', margin:0, lineHeight:'1.6' }}>
                  {decisiones[c.id]==='Contrapropuesta' ? c.contrapropuesta : c.original}
                </p>
                {decisiones[c.id] && <span style={{ fontSize:'11px', color:'#888', marginTop:'6px', display:'block' }}>Decision: {decisiones[c.id]}</span>}
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button style={{ background:'#0D5C36', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Guardar en Drive</button>
            <button style={{ background:'#0F2447', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Pasar al editor</button>
            <button style={{ background:'#E8321A', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Exportar TXT</button>
          </div>
        </div>
      )}

      {tab === 'historial' && (
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color:'#0F2447', fontSize:'16px', fontWeight:700, margin:'0 0 20px' }}>Historial de rondas de negociacion</h3>
          {Array.from({length:ronda}, (_,i) => (
            <div key={i} style={{ display:'flex', gap:'16px', padding:'16px', borderRadius:'10px', border:'1px solid #F0F0F0', marginBottom:'10px', alignItems:'center' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%', background: i+1===ronda?'#E8321A':'#0F2447', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'14px', flexShrink:0 }}>
                {i+1}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ color:'#0F2447', fontWeight:700, fontSize:'14px', margin:'0 0 2px' }}>Ronda {i+1}</p>
                <p style={{ color:'#888', fontSize:'12px', margin:0 }}>
                  {i+1===ronda ? 'En proceso — '+clausulas.length+' clausulas' : 'Completada — '+clausulas.length+' clausulas revisadas'}
                </p>
              </div>
              <span style={{ background:i+1===ronda?'#FEF3C7':'#F0FDF4', color:i+1===ronda?'#92400E':'#166534', fontSize:'12px', fontWeight:700, padding:'4px 12px', borderRadius:'20px' }}>
                {i+1===ronda?'En proceso':'Completada'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
