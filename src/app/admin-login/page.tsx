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
    <div style={{ minHeight:'100vh', fontFamily:'sans-serif', display:'flex' }}>
      <div style={{ flex:1, background:'linear-gradient(135deg, #0F2447 0%, #1B3A6B 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(232,50,26,0.15)' }} />
        <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(232,50,26,0.1)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'48px' }}>
            <span style={{ background:'#E8321A', color:'white', fontWeight:900, fontSize:'24px', padding:'4px 16px', borderRadius:'8px' }}>T1</span>
            <span style={{ color:'white', fontWeight:700, fontSize:'20px' }}>Legal</span>
          </div>
          <h1 style={{ color:'white', fontSize:'42px', fontWeight:900, margin:'0 0 16px', lineHeight:'1.2' }}>Sistema de Gestion Legal</h1>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'16px', margin:'0 0 48px', lineHeight:'1.6' }}>Plataforma inteligente para la gestion de contratos, expedientes y documentos legales de T1 Pagos.</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {['Analisis de contratos con IA en segundos','Documentos seguros y encriptados','Tracking en tiempo real de expedientes'].map((t,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#E8321A', flexShrink:0 }} />
                <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'14px' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ width:'480px', background:'white', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 48px' }}>
        <div style={{ marginBottom:'40px' }}>
          <div style={{ width:'4px', height:'32px', background:'#E8321A', borderRadius:'2px', marginBottom:'16px' }} />
          <h2 style={{ color:'#0F2447', fontSize:'28px', fontWeight:700, margin:'0 0 8px' }}>Bienvenido</h2>
          <p style={{ color:'#888', fontSize:'14px', margin:0 }}>Ingresa tus credenciales para acceder</p>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={{ display:'block', color:'#0F2447', fontSize:'13px', fontWeight:600, marginBottom:'8px' }}>Correo electronico</label>
          <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="jovanni.poceros@t1.com"
            style={{ width:'100%', padding:'14px 16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', color:'#0F2447', fontSize:'14px', boxSizing:'border-box' as any, outline:'none' }} />
        </div>
        <div style={{ marginBottom:'24px' }}>
          <label style={{ display:'block', color:'#0F2447', fontSize:'13px', fontWeight:600, marginBottom:'8px' }}>Contrasena</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password"
            onKeyDown={e => e.key==='Enter' && entrar()}
            style={{ width:'100%', padding:'14px 16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', color:'#0F2447', fontSize:'14px', boxSizing:'border-box' as any, outline:'none' }} />
        </div>
        {error && <div style={{ background:'#FFF5F5', border:'1px solid #FFD0CC', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px' }}><p style={{ color:'#C42A15', fontSize:'13px', margin:0 }}>{error}</p></div>}
        <button onClick={entrar} disabled={cargando}
          style={{ width:'100%', padding:'15px', background:'#E8321A', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'16px', cursor:'pointer', opacity:cargando?0.8:1 }}>
          {cargando ? 'Verificando...' : 'Entrar al sistema'}
        </button>
        <div style={{ marginTop:'32px', padding:'16px', background:'#F8F8F8', borderRadius:'10px', textAlign:'center' }}>
          <p style={{ color:'#888', fontSize:'12px', margin:0 }}>Acceso restringido — Solo personal autorizado de T1 Legal</p>
        </div>
      </div>
    </div>
  )
}
