'use client'
import { useState, useEffect } from 'react'
import { obtenerNotificaciones, marcarNotificacionLeida, marcarTodasLeidas } from '@/lib/supabase/solicitudes'

export default function Notificaciones({ correo }: { correo: string }) {
  const [notifs, setNotifs] = useState<any[]>([])
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    if (!correo) return
    cargar()
    const interval = setInterval(cargar, 30000)
    return () => clearInterval(interval)
  }, [correo])

  const cargar = async () => {
    try {
      const data = await obtenerNotificaciones(correo)
      setNotifs(data || [])
    } catch(e) {}
  }

  const noLeidas = notifs.filter(n => !n.leida).length

  const marcarLeida = async (id: string) => {
    await marcarNotificacionLeida(id)
    setNotifs(prev => prev.map(n => n.id === id ? {...n, leida: true} : n))
  }

  const marcarTodas = async () => {
    await marcarTodasLeidas(correo)
    setNotifs(prev => prev.map(n => ({...n, leida: true})))
  }

  const iconoTipo: Record<string,string> = {
    'documentos_faltantes': '📄',
    'pregunta': '❓',
    'estado_actualizado': '🔄',
    'respuesta_recibida': '✅',
  }

  return (
    <div style={{ position:'relative' }}>
      <button onClick={() => setAbierto(!abierto)}
        style={{ background:'none', border:'none', cursor:'pointer', padding:'6px', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:'20px' }}>🔔</span>
        {noLeidas > 0 && (
          <span style={{ position:'absolute', top:'0', right:'0', background:'#E8321A', color:'white', fontSize:'10px', fontWeight:700, width:'16px', height:'16px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <>
          <div onClick={() => setAbierto(false)} style={{ position:'fixed', inset:0, zIndex:40 }} />
          <div style={{ position:'absolute', right:0, top:'40px', width:'340px', background:'white', borderRadius:'14px', border:'1px solid #F0F0F0', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', zIndex:50, overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid #F0F0F0' }}>
              <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:0 }}>Notificaciones {noLeidas > 0 && <span style={{ background:'#E8321A', color:'white', fontSize:'10px', padding:'1px 6px', borderRadius:'10px', marginLeft:'6px' }}>{noLeidas}</span>}</p>
              {noLeidas > 0 && <button onClick={marcarTodas} style={{ background:'none', border:'none', color:'#888', fontSize:'11px', cursor:'pointer' }}>Marcar todas como leidas</button>}
            </div>

            <div style={{ maxHeight:'400px', overflowY:'auto' }}>
              {notifs.length === 0 ? (
                <div style={{ padding:'32px', textAlign:'center', color:'#888', fontSize:'13px' }}>Sin notificaciones</div>
              ) : notifs.map((n, i) => (
                <div key={i} onClick={() => { marcarLeida(n.id); if (n.datos?.link) window.location.href = n.datos.link }}
                  style={{ padding:'12px 16px', borderBottom:'1px solid #F8F8F8', background:n.leida?'white':'#FFF8F7', cursor:'pointer', display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'18px', flexShrink:0 }}>{iconoTipo[n.tipo] || '🔔'}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:'12px', fontWeight:n.leida?400:700, color:'#0F2447', margin:'0 0 2px', lineHeight:1.4 }}>{n.mensaje}</p>
                    <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{n.solicitud_id} · {new Date(n.created_at).toLocaleDateString('es-MX', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                  </div>
                  {!n.leida && <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#E8321A', flexShrink:0, marginTop:'4px' }} />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
