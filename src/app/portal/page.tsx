'use client'
import { useState, useEffect } from 'react'
import { obtenerSolicitudesPorCorreo } from '@/lib/supabase/solicitudes'

const pasos = ['Recibida','En revision','En negociacion','Lista para firma','Cerrada']

export default function Portal() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [correo, setCorreo] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [buscado, setBuscado] = useState(false)

  const buscar = async () => {
    if (!correo) return
    setBuscando(true)
    try {
      const data = await obtenerSolicitudesPorCorreo(correo)
      setSolicitudes(data || [])
      setBuscado(true)
    } catch(e) {
      setSolicitudes([])
    } finally {
      setBuscando(false)
      setCargando(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F5F6F7', fontFamily:'sans-serif' }}>
      <div style={{ background:'#0F2447', padding:'0 32px' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:'64px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ background:'#E8321A', color:'white', fontWeight:900, fontSize:'16px', padding:'3px 10px', borderRadius:'4px' }}>T1</span>
            <span style={{ color:'white', fontWeight:700 }}>Legal — Mi Portal</span>
          </div>
          <a href="/login" style={{ color:'#B0C4DE', fontSize:'13px', textDecoration:'none', border:'1px solid rgba(255,255,255,0.2)', padding:'4px 12px', borderRadius:'6px' }}>Salir</a>
        </div>
      </div>

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'40px 32px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
          <div>
            <h1 style={{ color:'#0F2447', fontSize:'26px', fontWeight:700, margin:'0 0 4px' }}>Mis Solicitudes</h1>
            <p style={{ color:'#888', margin:0 }}>Seguimiento en tiempo real de tus contratos</p>
          </div>
          <a href="/solicitar" style={{ background:'#E8321A', color:'white', padding:'12px 24px', borderRadius:'10px', textDecoration:'none', fontWeight:700, fontSize:'14px' }}>+ Nueva solicitud</a>
        </div>

        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'24px' }}>
          <p style={{ color:'#0F2447', fontSize:'14px', fontWeight:600, margin:'0 0 12px' }}>Ingresa tu correo para ver tus solicitudes</p>
