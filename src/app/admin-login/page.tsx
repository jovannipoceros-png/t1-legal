'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginAdmin() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const entrar = async () => {
    setCargando(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: correo, password })
    if (error) {
      setError('Correo o contrasena incorrectos')
      setCargando(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'white', fontFamily:'sans-serif', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth:'420px', padding:'32px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <span style={{ background:'#E8321A', color:'white', fontWeight:900, fontSize:'24px', padding:'4px 16px', borderRadius:'8px' }}>T1</span>
          <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'16px 0 4px' }}>T1 Legal</h1>
          <p style={{ color:'#888', fontSize:'14px', margin:0 }}>Acceso para el equipo legal</p>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={{ display:'block', color:'#0F2447', fontSize:'13px', fontWeight:600, marginBottom:'8px' }}>Correo</label>
          <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="correo@t1.com"
            style={{ width:'100%', padding:'13px 16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', color:'#0F2447', fontSize:'14px', boxSizing:'border-box', outline:'none' }} />
        </div>
        <div style={{ marginBottom:'24px' }}>
          <label style={{ display:'block', color:'#0F2447', fontSize:'13px', fontWeight:600, marginBottom:'8px' }}>Contrasena</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password"
            onKeyDown={e => e.key === 'Enter' && entrar()}
            style={{ width:'100%', padding:'13px 16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', color:'#0F2447', fontSize:'14px', boxSizing:'border-box', outline:'none' }} />
        </div>
        {error && <p style={{ color:'#C42A15', fontSize:'13px', margin:'0 0 16px', textAlign:'center' }}>{error}</p>}
        <button onClick={entrar} disabled={cargando}
          style={{ width:'100%', padding:'14px', background:'#E8321A', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'16px', cursor:'pointer' }}>
          {cargando ? 'Verificando...' : 'Entrar'}
        </button>
      </div>
    </div>
  )
}
