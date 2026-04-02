export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const modulos = [
    { icon: '📊', name: 'Inicio', href: '/dashboard' },
    { icon: '📋', name: 'Solicitudes', href: '/dashboard/solicitudes' },
    { icon: '📅', name: 'Agenda', href: '/dashboard/agenda' },
    { icon: '✏️', name: 'Editor', href: '/dashboard/editor' },
    { icon: '🌐', name: 'Traductor', href: '/dashboard/traductor' },
    { icon: '🤖', name: 'Análisis IA', href: '/dashboard/analisis' },
    { icon: '⚖️', name: 'Negociación', href: '/dashboard/negociacion' },
    { icon: '📁', name: 'Expediente', href: '/dashboard/expediente' },
    { icon: '📚', name: 'Inventario', href: '/dashboard/inventario' },
    { icon: '📈', name: 'Reportes', href: '/dashboard/reportes' },
    { icon: '📡', name: 'Monitor', href: '/dashboard/monitor' },
    { icon: '⚖️', name: 'Biblioteca', href: '/dashboard/biblioteca' },
    { icon: '🥋', name: 'Entrenamiento', href: '/dashboard/entrenamiento' },
    { icon: '⚡', name: 'Sistema', href: '/dashboard/sistema' },
    { icon: '👥', name: 'Usuarios', href: '/dashboard/usuarios' },
  ]
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: '220px', background: '#0F2447', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1B3A6B', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#E8321A', color: 'white', fontWeight: 900, fontSize: '16px', padding: '3px 10px', borderRadius: '4px' }}>T1</span>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Legal</span>
        </div>
        {modulos.map((m, i) => (
          <a key={i} href={m.href} style={{ padding: '10px 16px', color: '#B0C4DE', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{m.icon}</span><span>{m.name}</span>
          </a>
        ))}
      </div>
      <div style={{ marginLeft: '220px', flex: 1, background: '#F5F6F7', minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  )
}
