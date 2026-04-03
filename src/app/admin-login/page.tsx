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
    <div style={{ minHeight:'100vh', fontFamily:'sans-serif', display:'flex', background:'white' }}>
      <div style={{ flex:1, background:'linear-gradient(135deg, #fdf2f0 0%, #fce8e4 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'80px 60px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(232,50,26,0.08)' }} />
        <div style={{ position:'absolute', bottom:'-60px', left:'20%', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(232,50,26,0.06)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'56px' }}>
            <span style={{ background:'#E8321A', color:'white', fontWeight:900, fontSize:'22px', padding:'3px 14px', borderRadius:'6px' }}>T1</span>
            <span style={{ color:'#0F2447', fontWeight:700, fontSize:'18px' }}>Legal</span>
          </div>
          <h1 style={{ color:'#0F2447', fontSize:'48px', fontWeight:900, margin:'0 0 12px', lineHeight:'1.1' }}>
            Gestiona.<br/>
            <span style={{ color:'#E8321A' }}>Con T1 Legal.</span>
          </h1>
          <p style={{ color:'#555', fontSize:'16px', margin:'0 0 48px', lineHeight:'1.7', maxWidth:'400px' }}>
            El sistema legal mas avanzado de T1. Contratos, expedientes y documentos en un solo lugar.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {[
              { num:'01', text:'Analisis de contratos con IA en segundos' },
              { num:'02', text:'Documentos seguros y encriptados' },
              { num:'03', text:'Tracking en tiempo real de exped
cat > src/app/admin-login/page.tsx << 'FINARCHIVO'
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
    <div style={{ minHeight:'100vh', fontFamily:'sans-serif', display:'flex', background:'white' }}>
      <div style={{ flex:1, background:'linear-gradient(135deg, #fdf2f0 0%, #fce8e4 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'80px 60px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(232,50,26,0.08)' }} />
        <div style={{ position:'absolute', bottom:'-60px', left:'20%', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(232,50,26,0.06)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'56px' }}>
            <span style={{ background:'#E8321A', color:'white', fontWeight:900, fontSize:'22px', padding:'3px 14px', borderRadius:'6px' }}>T1</span>
            <span style={{ color:'#0F2447', fontWeight:700, fontSize:'18px' }}>Legal</span>
          </div>
          <h1 style={{ color:'#0F2447', fontSize:'48px', fontWeight:900, margin:'0 0 12px', lineHeight:'1.1' }}>
            Gestiona.<br/>
            <span style={{ color:'#E8321A' }}>Con T1 Legal.</span>
          </h1>
          <p style={{ color:'#555', fontSize:'16px', margin:'0 0 48px', lineHeight:'1.7', maxWidth:'400px' }}>
            El sistema legal mas avanzado de T1. Contratos, expedientes y documentos en un solo lugar.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {[
              { num:'01', text:'Analisis de contratos con IA en segundos' },
              { num:'02', text:'Documentos seguros y encriptados' },
              { num:'03', text:'Tracking en tiempo real de expedientes' },
            ].map((f,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'16px', padding:'14px 20px', background:'white', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                <span style={{ color:'#E8321A', fontWeight:900, fontSize:'13px', minWidth:'24px' }}>{f.num}</span>
                <span style={{ color:'#0F2447', fontSize:'14px', fontWeight:500 }}>{f.text}</span>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:'24px', marginTop:'48px' }}>
            {['+25,000 contratos','99.9% uptime','100% seguro'].map((s,i) => (
              <div key={i}>
                <p style={{ color:'#0F2447', fontWeight:700, fontSize:'13px', margin:0 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width:'460px', background:'white', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 48px', borderLeft:'1px solid #F0F0F0' }}>
        <div style={{ marginBottom:'40px' }}>
          <h2 style={{ color:'#0F2447', fontSize:'26px', fontWeight:700, margin:'0 0 8px' }}>Iniciar sesion</h2>
          <p style={{ color:'#888', fontSize:'14px', margin:0 }}>Acceso exclusivo para el equipo de T1 Legal</p>
        </div>

        <div style={{ marginBottom:'20px' }}>
          <label style={{ display:'block', color:'#0F2447', fontSize:'13px', fontWeight:600, marginBottom:'8px' }}>Correo electronico</label>
          <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="jovanni.poceros@t1.com"
            style={{ width:'100%', padding:'14px 16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', color:'#0F2447', fontSize:'14px', boxSizing:'border-box' as any, outline:'none' }} />
        </div>

        <div style={{ marginBottom:'28px' }}>
          <label style={{ display:'block', color:'#0F2447', fontSize:'13px', fontWeight:600, marginBottom:'8px' }}>Contrasena</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••"
            onKeyDown={e => e.key==='Enter' && entrar()}
            style={{ width:'100%', padding:'14px 16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', color:'#0F2447', fontSize:'14px', boxSizing:'border-box' as any, outline:'none' }} />
        </div>

        {error && (
          <div style={{ background:'#FFF5F5', border:'1px solid #FFD0CC', borderRadius:'8px', padding:'10px 14px', marginBottom:'20px' }}>
            <p style={{ color:'#C42A15', fontSize:'13px', margin:0 }}>{error}</p>
          </div>
        )}

        <button onClick={entrar} disabled={cargando}
          style={{ width:'100%', padding:'15px', background:'#E8321A', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'16px', cursor:'pointer', opacity:cargando?0.8:1, marginBottom:'16px' }}>
          {cargando ? 'Verificando...' : 'Entrar al sistema →'}
        </button>

        <div style={{ textAlign:'center', padding:'16px', background:'#F8F8F8', borderRadius:'10px' }}>
          <p style={{ color:'#888', fontSize:'12px', margin:0 }}>Acceso restringido — Solo personal autorizado</p>
        </div>
      </div>
    </div>
  )
}
