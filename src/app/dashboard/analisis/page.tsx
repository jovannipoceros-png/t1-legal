'use client'
import { useState } from 'react'

export default function Analisis() {
  const [motor, setMotor] = useState('Claude')
  const [modo, setModo] = useState('completo')
  const [texto, setTexto] = useState('')
  const [analizando, setAnalizando] = useState(false)
  const [resultado, setResultado] = useState<any>(null)

  const motores = ['Claude','Gemini','ChatGPT']
  const modos = [
    { id:'completo', label:'Analisis completo' },
    { id:'clausulas', label:'Por clausula' },
    { id:'riesgos', label:'Solo riesgos' },
    { id:'comparar', label:'Comparar vs mejores practicas' },
  ]

  const analizar = async () => {
    if (!texto.trim()) return
    setAnalizando(true)
    setResultado(null)
    try {
      const res = await fetch('/api/analisis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, modo, motor })
      })
      const data = await res.json()
      setResultado(data)
    } catch(e) {
      setResultado({ error: 'Error al analizar. Verifica que la API key este configurada.' })
    } finally {
      setAnalizando(false)
    }
  }

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Analisis IA</h1>
      <p style={{ color:'#888', margin:'0 0 24px' }}>Analisis juridico inteligente de contratos</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', marginBottom:'24px' }}>
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
          <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 16px' }}>Motor de IA</h3>
          <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
            {motores.map((m,i) => (
              <button key={i} onClick={() => setMotor(m)}
                style={{ flex:1, padding:'10px', borderRadius:'8px', border:`2px solid ${motor===m?'#E8321A':'#E8E8E8'}`, background:motor===m?'#FFF5F5':'white', color:motor===m?'#E8321A':'#888', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                {m}
              </button>
            ))}
          </div>
          <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 12px' }}>Modo</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {modos.map((m,i) => (
              <button key={i} onClick={() => setModo(m.id)}
                style={{ padding:'10px 14px', borderRadius:'8px', border:`1.5px solid ${modo===m.id?'#E8321A':'#E8E8E8'}`, background:modo===m.id?'#FFF5F5':'white', color:modo===m.id?'#E8321A':'#555', fontWeight:modo===m.id?700:400, fontSize:'13px', cursor:'pointer', textAlign:'left' }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
          <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 12px' }}>Contrato a analizar</h3>
          <textarea value={texto} onChange={e => setTexto(e.target.value)}
            placeholder="Pega aqui el contrato o clausula a analizar..." rows={10}
            style={{ width:'100%', padding:'14px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'13px', color:'#0F2447', lineHeight:'1.7', resize:'none', boxSizing:'border-box', outline:'none', marginBottom:'12px' }} />
          <button onClick={analizar} disabled={analizando||!texto.trim()}
            style={{ width:'100%', padding:'13px', background:texto.trim()?'#E8321A':'#E8E8E8', color:texto.trim()?'white':'#aaa', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'14px', cursor:texto.trim()?'pointer':'default' }}>
            {analizando?'Analizando con '+motor+'...':'Analizar con '+motor}
          </button>
        </div>
      </div>

      {resultado && !resultado.error && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'24px' }}>
            <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0', textAlign:'center' }}>
              <p style={{ color:'#888', fontSize:'13px', margin:'0 0 8px' }}>Score de riesgo</p>
              <p style={{ color:resultado.score>70?'#0D5C36':resultado.score>40?'#F59E0B':'#E8321A', fontSize:'48px', fontWeight:900, margin:'0 0 4px' }}>{resultado.score}</p>
              <p style={{ color:'#888', fontSize:'12px', margin:0 }}>de 100</p>
            </div>
            <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0', gridColumn:'span 2' }}>
              <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:700, margin:'0 0 8px' }}>Resumen ejecutivo</p>
              <p style={{ color:'#555', fontSize:'13px', lineHeight:'1.7', margin:0 }}>{resultado.resumen}</p>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px' }}>
            <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
              <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 16px' }}>Riesgos detectados</h3>
              {resultado.riesgos?.map((r: any,i: number) => (
                <div key={i} style={{ marginBottom:'16px', padding:'16px', borderRadius:'10px', border:`1.5px solid ${r.nivel==='Alto'?'#FCA5A5':'#FDE68A'}`, background:r.nivel==='Alto'?'#FFF5F5':'#FFFBEB' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                    <span style={{ background:r.nivel==='Alto'?'#E8321A':'#F59E0B', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{r.nivel}</span>
                    <span style={{ color:'#0F2447', fontSize:'13px', fontWeight:700 }}>{r.clausula}</span>
                  </div>
                  <p style={{ color:'#555', fontSize:'13px', margin:'0 0 8px', lineHeight:'1.6' }}>{r.descripcion}</p>
                  <p style={{ color:'#0D5C36', fontSize:'12px', margin:0, fontWeight:600 }}>→ {r.recomendacion}</p>
                </div>
              ))}
            </div>
            <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
              <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 16px' }}>Checklist legal</h3>
              {resultado.checklist?.map((c: any,i: number) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ color:c.ok?'#0D5C36':'#E8321A', fontSize:'16px', fontWeight:700 }}>{c.ok?'✓':'✗'}</span>
                  <span style={{ color:c.ok?'#0F2447':'#888', fontSize:'12px', fontWeight:c.ok?600:400 }}>{c.item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {resultado?.error && (
        <div style={{ background:'#FFF5F5', border:'1px solid #FFD0CC', borderRadius:'12px', padding:'20px' }}>
          <p style={{ color:'#C42A15', fontSize:'14px', margin:0 }}>{resultado.error}</p>
        </div>
      )}
    </div>
  )
}
