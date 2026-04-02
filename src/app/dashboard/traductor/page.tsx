'use client'
import { useState } from 'react'

export default function Traductor() {
  const [texto, setTexto] = useState('')
  const [traduccion, setTraduccion] = useState('')
  const [origen, setOrigen] = useState('Español')
  const [destino, setDestino] = useState('Inglés')
  const [historial, setHistorial] = useState([
    { origen:'Español', destino:'Inglés', fragmento:'El presente contrato tiene por objeto...', fecha:'04/04/2026 09:15' },
    { origen:'Español', destino:'Francés', fragmento:'Las partes se obligan a mantener confidencial...', fecha:'03/04/2026 14:30' },
  ])

  const idiomas = ['Español','Inglés','Francés','Alemán','Italiano','Portugués','Chino','Japonés','Árabe']

  const traducir = () => {
    setTraduccion('This services agreement is entered into by and between the parties, hereinafter referred to as "THE CLIENT" and "T1", pursuant to the following terms and conditions. The parties hereby agree to maintain strict confidentiality regarding all information exchanged during the term of this agreement.')
    setHistorial(h => [{ origen, destino, fragmento: texto.substring(0,50)+'...', fecha: new Date().toLocaleDateString() }, ...h])
  }

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Traductor Legal</h1>
      <p style={{ color:'#888', margin:'0 0 24px' }}>Traduccion especializada en terminos juridicos — Motor: Gemini 1.5 Flash</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'24px' }}>
        <div>
          <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
              <select value={origen} onChange={e => setOrigen(e.target.value)}
                style={{ flex:1, padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'14px', color:'#0F2447', outline:'none' }}>
                {idiomas.map((i,idx) => <option key={idx}>{i}</option>)}
              </select>
              <button onClick={() => { const t=origen; setOrigen(destino); setDestino(t); setTraduccion(''); }}
                style={{ padding:'10px 16px', borderRadius:'8px', border:'1.5px solid #E8E8E8', background:'white', cursor:'pointer', fontSize:'18px', fontWeight:700 }}>⇄</button>
              <select value={destino} onChange={e => setDestino(e.target.value)}
                style={{ flex:1, padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'14px', color:'#0F2447', outline:'none' }}>
                {idiomas.map((i,idx) => <option key={idx}>{i}</option>)}
              </select>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              <div>
                <label style={{ display:'block', color:'#0F2447', fontSize:'12px', fontWeight:600, marginBottom:'6px' }}>{origen}</label>
                <textarea value={texto} onChange={e => setTexto(e.target.value)}
                  placeholder="Escribe o pega el texto legal a traducir..."
                  rows={14} style={{ width:'100%', padding:'14px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'13px', color:'#0F2447', lineHeight:'1.7', resize:'none', boxSizing:'border-box', outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', color:'#0F2447', fontSize:'12px', fontWeight:600, marginBottom:'6px' }}>{destino}</label>
                <div style={{ width:'100%', padding:'14px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'13px', color:'#555', lineHeight:'1.7', minHeight:'320px', background:'#FAFAFA', boxSizing:'border-box' }}>
                  {traduccion || <span style={{ color:'#ccc', fontStyle:'italic' }}>La traduccion aparecera aqui...</span>}
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={traducir}
                style={{ background:'#E8321A', color:'white', border:'none', padding:'12px 28px', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
                Traducir
              </button>
              <button onClick={traducir}
                style={{ background:'#0F2447', color:'white', border:'none', padding:'12px 28px', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
                Otra opcion
              </button>
              {traduccion && (
                <button style={{ background:'#0D5C36', color:'white', border:'none', padding:'12px 28px', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
                  Insertar al editor
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 16px' }}>Historial de traducciones</h3>
            {historial.map((h,i) => (
              <div key={i} style={{ padding:'10px 12px', borderRadius:'8px', border:'1px solid #F0F0F0', marginBottom:'8px', cursor:'pointer', background:'#FAFAFA' }}>
                <div style={{ display:'flex', gap:'6px', marginBottom:'4px' }}>
                  <span style={{ background:'#0F2447', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>{h.origen}</span>
                  <span style={{ color:'#888', fontSize:'10px' }}>→</span>
                  <span style={{ background:'#E8321A', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>{h.destino}</span>
                </div>
                <p style={{ color:'#555', fontSize:'11px', margin:'0 0 2px' }}>{h.fragmento}</p>
                <p style={{ color:'#aaa', fontSize:'10px', margin:0 }}>{h.fecha}</p>
              </div>
            ))}
          </div>

          <div style={{ background:'#EFF6FF', borderRadius:'16px', padding:'20px', border:'1px solid #BFDBFE' }}>
            <h3 style={{ color:'#1D4ED8', fontSize:'13px', fontWeight:700, margin:'0 0 10px' }}>Idiomas disponibles</h3>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
              {idiomas.map((id,i) => (
                <span key={i} style={{ background:'white', color:'#1D4ED8', fontSize:'11px', fontWeight:600, padding:'3px 8px', borderRadius:'10px', border:'1px solid #BFDBFE' }}>{id}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
