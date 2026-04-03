'use client'
import { useState } from 'react'

export default function Login() {
  const [correo, setCorreo] = useState('')

  return (
    <div style={{ minHeight:'100vh', background:'white', fontFamily:'sans-serif', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth:'420px', padding:'32px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <span style={{ background:'#E8321A', color:'white', fontWeight:900, fontSize:'24px', padding:'4px 16px', borderRadius:'8px' }}>T1</span>
          <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'16px 0 4px' }}>T1 Legal</h1>
          <p style={{ color:'#888', fontSize:'14px', margin:0 }}>Ingresa tu correo para ver tus solicitudes</p>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={{ display:'block', color:'#0F2447', fontSize:'13px', fontWeight:600, marginBottom:'8px' }}>Correo electronico</label>
          <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="correo@empresa.com"
            style={{ width:'100%', padding:'13px 16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', color:'#0F2447', fontSize:'14px', boxSizing:'border-box', outline:'none' }} />
        </div>
        <a href="/portal">
          <button style={{ width:'100%', padding:'14px', background:'#E8321A', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'16px', cursor:'pointer' }}>
            Ver mis solicitudes
          </button>
        </a>
        <p style={{ textAlign:'center', color:'#888', fontSize:'13px', marginTop:'16px' }}>
          Primera vez? <a href="/solicitar" style={{ color:'#E8321A', fontWeight:700, textDecoration:'none' }}>Haz una solicitud</a>
        </p>
      </div>
    </div>
  )
}
