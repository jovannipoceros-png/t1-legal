'use client'
import { useState } from 'react'

export default function Reportes() {
  const [periodo, setPeriodo] = useState('mensual')

  const periodos = [
    { id:'mensual', label:'Mensual' },
    { id:'bimestral', label:'Bimestral' },
    { id:'semestral', label:'Semestral' },
    { id:'anual', label:'Anual' },
  ]

  const kpis = [
    { label:'Total solicitudes', value:'24', color:'#0F2447', sub:'+12% vs periodo anterior' },
    { label:'Cerradas', value:'18', color:'#0D5C36', sub:'75% tasa de cierre' },
    { label:'En proceso', value:'4', color:'#3B82F6', sub:'Promedio 8 dias' },
    { label:'Pendientes', value:'2', color:'#F59E0B', sub:'2 urgentes' },
  ]

  const porTipo = [
    { tipo:'Contrato de servicios', cantidad:10, porcentaje:42 },
    { tipo:'NDA', cantidad:6, porcentaje:25 },
    { tipo:'Convenio Modificatorio', cantidad:4, porcentaje:17 },
    { tipo:'Compraventa', cantidad:3, porcentaje:12 },
    { tipo:'Otro', cantidad:1, porcentaje:4 },
  ]

  const porMes = [
    { mes:'Nov', total:8 },
    { mes:'Dic', total:5 },
    { mes:'Ene', total:12 },
    { mes:'Feb', total:9 },
    { mes:'Mar', total:15 },
    { mes:'Abr', total:24 },
  ]

  const maxVal = Math.max(...porMes.map(m => m.total))

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Reportes</h1>
          <p style={{ color:'#888', margin:0 }}>Metricas y estadisticas del area legal</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button style={{ background:'#0F2447', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
            Exportar PDF
          </button>
          <button style={{ background:'white', color:'#0F2447', border:'1.5px solid #E8E8E8', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
            Exportar CSV
          </button>
        </div>
      </div>

      <div style={{ display:'flex', gap:'8px', marginBottom:'24px' }}>
        {periodos.map((p,i) => (
          <button key={i} onClick={() => setPeriodo(p.id)}
            style={{ padding:'8px 20px', borderRadius:'8px', border:`1.5px solid ${periodo===p.id?'#E8321A':'#E8E8E8'}`, background:periodo===p.id?'#FFF5F5':'white', color:periodo===p.id?'#E8321A':'#888', fontWeight:periodo===p.id?700:400, fontSize:'13px', cursor:'pointer' }}>
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {kpis.map((k,i) => (
          <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ color:'#888', fontSize:'12px', margin:'0 0 8px' }}>{k.label}</p>
            <p style={{ color:k.color, fontSize:'36px', fontWeight:700, margin:'0 0 4px' }}>{k.value}</p>
            <p style={{ color:'#0D5C36', fontSize:'11px', margin:0 }}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px', marginBottom:'24px' }}>
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 24px' }}>Solicitudes por mes</h3>
          <div style={{ display:'flex', alignItems:'flex-end', gap:'12px', height:'180px', paddingBottom:'8px', borderBottom:'1px solid #F0F0F0' }}>
            {porMes.map((m,i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', height:'100%', justifyContent:'flex-end' }}>
                <span style={{ color:'#0F2447', fontSize:'11px', fontWeight:700 }}>{m.total}</span>
                <div style={{ width:'100%', background: i===porMes.length-1?'#E8321A':'#0F2447', borderRadius:'4px 4px 0 0', height:`${(m.total/maxVal)*140}px`, minHeight:'8px', transition:'height 0.3s' }} />
                <span style={{ color:'#888', fontSize:'11px' }}>{m.mes}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 20px' }}>Por tipo de contrato</h3>
          {porTipo.map((t,i) => (
            <div key={i} style={{ marginBottom:'14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                <span style={{ color:'#555', fontSize:'12px' }}>{t.tipo}</span>
                <span style={{ color:'#0F2447', fontSize:'12px', fontWeight:700 }}>{t.cantidad}</span>
              </div>
              <div style={{ height:'6px', background:'#F0F0F0', borderRadius:'3px' }}>
                <div style={{ height:'100%', width:`${t.porcentaje}%`, background:i===0?'#E8321A':i===1?'#0F2447':i===2?'#3B82F6':i===3?'#0D5C36':'#F59E0B', borderRadius:'3px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 16px' }}>T1.com vs Claro Pagos</h3>
          <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
            <div style={{ flex:1 }}>
              {[{label:'T1.com',value:14,color:'#0F2447'},{label:'Claro Pagos',value:10,color:'#E8321A'}].map((d,i) => (
                <div key={i} style={{ marginBottom:'12px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ color:'#555', fontSize:'13px' }}>{d.label}</span>
                    <span style={{ color:d.color, fontSize:'13px', fontWeight:700 }}>{d.value}</span>
                  </div>
                  <div style={{ height:'8px', background:'#F0F0F0', borderRadius:'4px' }}>
                    <div style={{ height:'100%', width:`${(d.value/24)*100}%`, background:d.color, borderRadius:'4px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 16px' }}>Tiempos promedio</h3>
          {[
            { tipo:'Contrato de servicios', dias:'8 dias' },
            { tipo:'NDA', dias:'3 dias' },
            { tipo:'Convenio Modificatorio', dias:'12 dias' },
            { tipo:'Compraventa', dias:'15 dias' },
          ].map((t,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F0F0F0' }}>
              <span style={{ color:'#555', fontSize:'13px' }}>{t.tipo}</span>
              <span style={{ color:'#0F2447', fontSize:'13px', fontWeight:700 }}>{t.dias}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
