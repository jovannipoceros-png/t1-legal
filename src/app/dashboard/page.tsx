'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Scale, BookOpen, Calendar, BarChart3, Monitor, Brain, GraduationCap, Settings, Users, Globe, Package, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { obtenerSolicitudes } from '@/lib/supabase/solicitudes'

const hora = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

const fecha = () => new Date().toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

export default function Dashboard() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerSolicitudes()
      .then(data => { setSolicitudes(data || []); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  const activas = solicitudes.filter(s => s.estado !== 'Cerrado')
  const urgentes = solicitudes.filter(s => s.prioridad === 'Alta' && s.estado !== 'Cerrado')
  const porFirmar = solicitudes.filter(s => s.estado === 'Lista para firma')
  const enNeg = solicitudes.filter(s => s.estado === 'En negociacion')
  const vencenProximo = solicitudes.filter(s => {
    if (!s.fecha_limite) return false
    const dias = Math.ceil((new Date(s.fecha_limite).getTime() - Date.now()) / 86400000)
    return dias >= 0 && dias <= 7
  })

  const resumen = urgentes.length > 0
    ? `Tienes ${urgentes.length} contrato${urgentes.length>1?'s':''} urgente${urgentes.length>1?'s':''} — atención requerida`
    : porFirmar.length > 0
    ? `${porFirmar.length} contrato${porFirmar.length>1?'s':''} listo${porFirmar.length>1?'s':''} para firma`
    : vencenProximo.length > 0
    ? `${vencenProximo.length} contrato${vencenProximo.length>1?'s':''} vence${vencenProximo.length>1?'n':''} esta semana`
    : activas.length > 0
    ? `${activas.length} contratos activos — todo en orden`
    : 'Sin contratos activos por el momento'

  const modulos = [
    { href:'/dashboard/solicitudes', icon: FileText, label:'Solicitudes', desc:'Gestión de contratos', valor: activas.length, tag:'activas', color:'#0F2447', bg:'#EFF6FF', border:'#BFDBFE' },
    { href:'/dashboard/agenda', icon: Calendar, label:'Agenda', desc:'Vencimientos y alertas', valor: vencenProximo.length, tag:'esta semana', color:'#065F46', bg:'#F0FDF4', border:'#BBF7D0' },
    { href:'/dashboard/negociacion', icon: Scale, label:'Negociación', desc:'Mesa de negociación', valor: enNeg.length, tag:'en proceso', color:'#7C3AED', bg:'#F3E8FF', border:'#DDD6FE' },
    { href:'/dashboard/expediente', icon: Package, label:'Expediente', desc:'Expedientes digitales', valor: solicitudes.length, tag:'total', color:'#92400E', bg:'#FFFBEB', border:'#FDE68A' },
    { href:'/dashboard/editor', icon: FileText, label:'Editor', desc:'Redacción de contratos', valor: null, tag:null, color:'#0F2447', bg:'#F8F8F8', border:'#E8E8E8' },
    { href:'/dashboard/traductor', icon: Globe, label:'Traductor', desc:'Traducción de documentos', valor: null, tag:null, color:'#0F2447', bg:'#F8F8F8', border:'#E8E8E8' },
    { href:'/dashboard/monitor', icon: Monitor, label:'Monitor', desc:'Alertas regulatorias', valor: urgentes.length > 0 ? urgentes.length : null, tag: urgentes.length > 0 ? 'alertas' : null, color:'#E8321A', bg:'#FFF5F5', border:'#FFD0CC' },
    { href:'/dashboard/biblioteca', icon: BookOpen, label:'Biblioteca', desc:'Marco legal', valor: null, tag:null, color:'#0F2447', bg:'#F8F8F8', border:'#E8E8E8' },
    { href:'/dashboard/analisis', icon: Brain, label:'Análisis IA', desc:'Análisis inteligente', valor: null, tag:'próximo', color:'#0F2447', bg:'#F8F8F8', border:'#E8E8E8' },
    { href:'/dashboard/entrenamiento', icon: GraduationCap, label:'Entrenamiento', desc:'Simulador El Dojo', valor: null, tag:null, color:'#0F2447', bg:'#F8F8F8', border:'#E8E8E8' },
    { href:'/dashboard/reportes', icon: BarChart3, label:'Reportes', desc:'Informes y métricas', valor: null, tag:null, color:'#0F2447', bg:'#F8F8F8', border:'#E8E8E8' },
    { href:'/dashboard/usuarios', icon: Users, label:'Usuarios', desc:'Gestión de equipo', valor: null, tag:null, color:'#0F2447', bg:'#F8F8F8', border:'#E8E8E8' },
  ]

  const alertas = [
    ...urgentes.slice(0,3).map(s => ({ tipo:'urgente', msg:`${s.nombre_empresa||s.nombre||s.id} — contrato urgente`, id:s.id, color:'#E8321A', bg:'#FFF5F5', icon:'🔴' })),
    ...porFirmar.slice(0,2).map(s => ({ tipo:'firma', msg:`${s.nombre_empresa||s.nombre||s.id} — listo para firma`, id:s.id, color:'#065F46', bg:'#F0FDF4', icon:'✅' })),
    ...vencenProximo.slice(0,2).map(s => ({ tipo:'vence', msg:`${s.nombre_empresa||s.nombre||s.id} — vence pronto`, id:s.id, color:'#92400E', bg:'#FFFBEB', icon:'⏰' })),
  ]

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', background:'#F7F8FA', minHeight:'100vh' }}>

      {/* HEADER */}
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        style={{ marginBottom:'32px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap' as any, gap:'16px' }}>
          <div>
            <p style={{ fontSize:'13px', color:'#888', margin:'0 0 4px', textTransform:'capitalize' as any }}>{fecha()}</p>
            <h1 style={{ color:'#0F2447', fontSize:'28px', fontWeight:800, margin:'0 0 6px', letterSpacing:'-0.5px' }}>
              {hora()}, Jovanni 👋
            </h1>
            <p style={{ color: urgentes.length > 0 ? '#E8321A' : '#888', fontSize:'14px', margin:0, fontWeight: urgentes.length > 0 ? 600 : 400 }}>
              {cargando ? 'Cargando...' : resumen}
            </p>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <a href="/dashboard/solicitudes/nueva" style={{ background:'#E8321A', color:'white', padding:'10px 20px', borderRadius:'10px', fontSize:'13px', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:'6px' }}>
              + Nueva solicitud
            </a>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.1 }}
        style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'28px' }}>
        {[
          { label:'Contratos activos', val: activas.length, icon:'📋', color:'#0F2447', bg:'white' },
          { label:'Urgentes', val: urgentes.length, icon:'🔴', color:'#E8321A', bg: urgentes.length > 0 ? '#FFF5F5' : 'white' },
          { label:'Por firmar', val: porFirmar.length, icon:'✍️', color:'#065F46', bg: porFirmar.length > 0 ? '#F0FDF4' : 'white' },
          { label:'Vencen esta semana', val: vencenProximo.length, icon:'⏰', color:'#92400E', bg: vencenProximo.length > 0 ? '#FFFBEB' : 'white' },
        ].map((k,i) => (
          <motion.div key={i} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.15+i*0.05 }}
            style={{ background:k.bg, borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <p style={{ fontSize:'11px', color:'#aaa', fontWeight:600, textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 8px' }}>{k.label}</p>
                <p style={{ fontSize:'36px', fontWeight:800, color:k.color, margin:0, lineHeight:1 }}>
                  {cargando ? '—' : k.val}
                </p>
              </div>
              <span style={{ fontSize:'24px' }}>{k.icon}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'20px' }}>

        {/* MODULOS */}
        <div>
          <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.08em', margin:'0 0 14px' }}>Módulos</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
            {modulos.map((m, i) => {
              const Icon = m.icon
              return (
                <motion.a key={i} href={m.href}
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2+i*0.04 }}
                  whileHover={{ scale:1.02, transition:{ duration:0.15 } }}
                  style={{ background:'white', borderRadius:'14px', padding:'18px', border:`1px solid ${m.border}`, textDecoration:'none', display:'block', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                    <div style={{ background:m.bg, borderRadius:'10px', width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon size={18} color={m.color} strokeWidth={2} />
                    </div>
                    {m.valor !== null && (
                      <span style={{ background:m.bg, color:m.color, fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'8px', border:`1px solid ${m.border}` }}>
                        {m.valor} {m.tag}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 3px' }}>{m.label}</p>
                  <p style={{ fontSize:'11px', color:'#aaa', margin:0 }}>{m.desc}</p>
                </motion.a>
              )
            })}
          </div>
        </div>

        {/* ALERTAS */}
        <div>
          <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.08em', margin:'0 0 14px' }}>Atención requerida</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {cargando ? (
              <div style={{ background:'white', borderRadius:'12px', padding:'20px', border:'1px solid #F0F0F0', textAlign:'center', color:'#888', fontSize:'13px' }}>Cargando...</div>
            ) : alertas.length === 0 ? (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ background:'#F0FDF4', borderRadius:'12px', padding:'24px', border:'1px solid #BBF7D0', textAlign:'center' }}>
                <p style={{ fontSize:'28px', margin:'0 0 8px' }}>✅</p>
                <p style={{ fontSize:'13px', fontWeight:700, color:'#065F46', margin:'0 0 4px' }}>Todo en orden</p>
                <p style={{ fontSize:'11px', color:'#888', margin:0 }}>Sin alertas pendientes</p>
              </motion.div>
            ) : alertas.map((a, i) => (
              <motion.a key={i} href={`/dashboard/solicitudes/${a.id}`}
                initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3+i*0.05 }}
                style={{ background:a.bg, borderRadius:'12px', padding:'14px 16px', border:`1px solid ${a.color}20`, textDecoration:'none', display:'block' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <span style={{ fontSize:'16px', flexShrink:0 }}>{a.icon}</span>
                  <p style={{ fontSize:'12px', color:'#0F2447', fontWeight:600, margin:0, lineHeight:1.4 }}>{a.msg}</p>
                </div>
              </motion.a>
            ))}

            {/* ACCESO RAPIDO */}
            <div style={{ marginTop:'8px' }}>
              <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.08em', margin:'0 0 10px' }}>Acceso rápido</p>
              {[
                { label:'Nueva solicitud', href:'/dashboard/solicitudes', icon:'➕', color:'#0F2447' },
                { label:'Ir a Agenda', href:'/dashboard/agenda', icon:'📅', color:'#065F46' },
                { label:'Ver Monitor', href:'/dashboard/monitor', icon:'📡', color:'#7C3AED' },
                { label:'Centro de Control', href:'/dashboard/sistema', icon:'⚙️', color:'#E8321A' },
              ].map((acc, i) => (
                <a key={i} href={acc.href}
                  style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background:'white', borderRadius:'10px', border:'1px solid #F0F0F0', marginBottom:'6px', textDecoration:'none' }}>
                  <span style={{ fontSize:'14px' }}>{acc.icon}</span>
                  <span style={{ fontSize:'12px', fontWeight:600, color:acc.color }}>{acc.label}</span>
                  <span style={{ marginLeft:'auto', color:'#aaa', fontSize:'12px' }}>→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
