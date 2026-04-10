import Link from 'next/link'

const modulos = [
  { href:'/dashboard', label:'Inicio', icon:'🏠' },
  { href:'/dashboard/solicitudes', label:'Solicitudes', icon:'📋' },
  { href:'/dashboard/agenda', label:'Agenda', icon:'📅' },
  { href:'/dashboard/editor', label:'Editor', icon:'✏️' },
  { href:'/dashboard/traductor', label:'Traductor', icon:'🌐' },
  { href:'/dashboard/analisis', label:'Analisis IA', icon:'🔍' },
  { href:'/dashboard/negociacion', label:'Negociacion', icon:'🤝' },
  { href:'/dashboard/expediente', label:'Expediente', icon:'📁' },
  { href:'/dashboard/inventario', label:'Inventario', icon:'📊' },
  { href:'/dashboard/reportes', label:'Reportes', icon:'📈' },
  { href:'/dashboard/monitor', label:'Monitor', icon:'📡' },
  { href:'/dashboard/biblioteca', label:'Biblioteca', icon:'⚖️' },
  { href:'/dashboard/entrenamiento', label:'Entrenamiento', icon:'🎯' },
  { href:'/dashboard/sistema', label:'Sistema', icon:'⚡' },
  { href:'/dashboard/usuarios', label:'Usuarios', icon:'👥' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F8F8F8', fontFamily:'sans-serif' }}>
      <div style={{ width:'220px', background:'white', borderRight:'1px solid #F0F0F0', position:'fixed', top:0, left:0, bottom:0, overflowY:'auto', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'24px 20px', borderBottom:'1px solid #F0F0F0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ background:'#E8321A', color:'white', fontWeight:900, fontSize:'16px', padding:'2px 10px', borderRadius:'5px' }}>T1</span>
            <span style={{ color:'#0F2447', fontWeight:700, fontSize:'15px' }}>Legal</span>
          </div>
        </div>
        <nav style={{ padding:'12px 0', flex:1 }}>
          {modulos.map((m,i) => (
            <Link key={i} href={m.href}
              style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 20px', color:'#555', textDecoration:'none', fontSize:'13px', fontWeight:500 }}>
              <span style={{ fontSize:'15px' }}>{m.icon}</span>
              <span>{m.label}</span>
            </Link>
          ))}
        </nav>
        <div style={{ padding:'16px 20px', borderTop:'1px solid #F0F0F0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#E8321A', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'13px' }}>J</div>
            <div>
              <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:700, margin:0 }}>Jovanni Poceros</p>
              <p style={{ color:'#888', fontSize:'11px', margin:0 }}>Admin</p>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginLeft:'220px', flex:1, minHeight:'100vh' }}>
        <div style={{ background:'white', borderBottom:'1px solid #F0F0F0', padding:'0 32px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
          <p style={{ color:'#0F2447', fontSize:'13px', margin:0, fontWeight:500 }}>T1 Legal — Sistema de Gestion Legal</p>
          <div style={{ marginLeft:'auto', paddingRight:'16px' }}><Notificaciones correo="jovanni.poceros@t1.com" /></div>
          <a href="/admin-login" style={{ color:'#888', fontSize:'12px', textDecoration:'none', padding:'6px 14px', border:'1px solid #E8E8E8', borderRadius:'6px' }}>Cerrar sesion</a>
        </div>
        {children}
      </div>
    </div>
  )
}
