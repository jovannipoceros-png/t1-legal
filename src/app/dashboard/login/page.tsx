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
          <h1 style={{ color:'white', fontSize:'42px', fontWeight:900, margin:'0 0 16px', lineHeight:'1.2' }}>
            Sistema de<br/>Gestion Legal
          </h1>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'16px', margin:'0 0 48px', lineHeight:'1.6' }}>
            Plataf
