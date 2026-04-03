'use client'
import { useState, useEffect } from 'react'
import { obtenerSolicitudes } from '@/lib/supabase/solicitudes'

export default function Inventario() {
  const [contratos, setContratos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtroEmpresa, setFiltroEmpresa] = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    obtenerSolicitudes()
      .then(data => { setContratos(data || []); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  const filtrados = contratos.filter(c => {
    const matchEmpresa = filtroEmpresa==='todas' || c.empresa_t1===filtroEmpresa
    const matchEstado = filtroEstado==='todos' || c.estado===filtroEstado
    const matchBusqueda = (c.nombre_empresa||'').toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.id||'').toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.nombre||'').toLowerCase().includes(busqueda.toLowerCase())
    return matchEmpresa && matchEstado && matchBusqueda
  })

  const t1 = contratos.filter(c => c.empresa_t1==='T1.com')
  const claro = contratos.filter(c => c.empresa_t1==='Claro Pagos')
  const pendientes = contratos.filter(c => c.estado==='Pendiente')
  const cerrados = contratos.filter(c => c.estado==='Cerrado')

  const exportarCSV = () => {
    const headers = ['ID','Nombre','Area','Empresa T1','Tipo','Prioridad','Estado','Fecha']
    const rows = filtrados.map(c => [c.id, c.nombre, c.area, c.empresa_t1, c.tipo_solicitud, c.prioridad, c.estado, new Date(c.created_at).toLocaleDateString('es-MX')])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type:'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventario_t1_legal.csv'
    a.click()
  }

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Inventario Legal</h1>
          <p style={{ color:'#888', margin:0 }}>Control completo de contratos T1.com y Claro Pagos</p>
        </div>
        <button onClick={exportarCSV}
          style={{ background:'#0F2447', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
          Exportar CSV
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' }}>
        <div style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
          <p style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 14px' }}>T1.com</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
            {[
              { label:'Total', value:t1.length, color:'#0F2447' },
              { label:'Pendientes', value:t1.filter(c=>c.estado==='Pendiente').length, color:'#F59E0B' },
              { label:'En proceso', value:t1.filter(c=>c.estado==='En proceso').length, color:'#1D4ED8' },
              { label:'Cerrados', value:t1.filter(c=>c.estado==='Cerrado').length, color:'#0D5C36' },
            ].map((k,i) => (
              <div key={i} style={{ textAlign:'center', padding:'12px', background:'#F8F8F8', borderRadius:'8px' }}>
                <p style={{ color:k.color, fontSize:'22px', fontWeight:700, margin:'0 0 2px' }}>{cargando?'...':k.value}</p>
                <p style={{ color:'#888', fontSize:'11px', margin:0 }}>{k.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
          <p style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 14px' }}>Claro Pagos</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
            {[
              { label:'Total', value:claro.length, color:'#0F2447' },
              { label:'Pendientes', value:claro.filter(c=>c.estado==='Pendiente').length, color:'#F59E0B' },
              { label:'En proceso', value:claro.filter(c=>c.estado==='En proceso').length, color:'#1D4ED8' },
              { label:'Cerrados', value:claro.filter(c=>c.estado==='Cerrado').length, color:'#0D5C36' },
            ].map((k,i) => (
              <div key={i} style={{ textAlign:'center', padding:'12px', background:'#F8F8F8', borderRadius:'8px' }}>
                <p style={{ color:k.color, fontSize:'22px', fontWeight:700, margin:'0 0 2px' }}>{cargando?'...':k.value}</p>
                <p style={{ color:'#888', fontSize:'11px', margin:0 }}>{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
        <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por empresa, ID o nombre..."
            style={{ flex:1, minWidth:'200px', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none', color:'#0F2447' }} />
          <select value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)}
            style={{ padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none', color:'#0F2447' }}>
            <option value="todas">Todas las empresas</option>
            <option value="T1.com">T1.com</option>
            <option value="Claro Pagos">Claro Pagos</option>
          </select>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
            style={{ padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none', color:'#0F2447' }}>
            <option value="todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>

        {cargando ? (
          <p style={{ textAlign:'center', color:'#888', padding:'32px' }}>Cargando...</p>
        ) : (
          <>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr style={{ background:'#F8F8F8' }}>
                  {['ID','Solicitante','Area','Tipo','Empresa T1','Prioridad','Estado','Fecha'].map((h,i) => (
                    <th key={i} style={{ padding:'10px 12px', color:'#0F2447', fontWeight:700, textAlign:'left', fontSize:'11px', borderBottom:'1px solid #F0F0F0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c,i) => (
                  <tr key={i} style={{ borderBottom:'1px solid #F0F0F0' }}>
                    <td style={{ padding:'12px', color:'#E8321A', fontWeight:700, fontSize:'12px' }}>{c.id}</td>
                    <td style={{ padding:'12px', color:'#0F2447', fontWeight:600 }}>{c.nombre||'—'}</td>
                    <td style={{ padding:'12px', color:'#555' }}>{c.area||'—'}</td>
                    <td style={{ padding:'12px', color:'#555' }}>{c.tipo_solicitud||'—'}</td>
                    <td style={{ padding:'12px' }}>
                      <span style={{ background:'#EFF6FF', color:'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{c.empresa_t1}</span>
                    </td>
                    <td style={{ padding:'12px' }}>
                      <span style={{ background:c.prioridad==='Alta'?'#FEE2E2':c.prioridad==='Media'?'#FEF3C7':'#F0FDF4', color:c.prioridad==='Alta'?'#C42A15':c.prioridad==='Media'?'#92400E':'#166534', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{c.prioridad||'—'}</span>
                    </td>
                    <td style={{ padding:'12px' }}>
                      <span style={{ background:c.estado==='Cerrado'?'#F0FDF4':c.estado==='En proceso'?'#EFF6FF':'#FEF3C7', color:c.estado==='Cerrado'?'#166534':c.estado==='En proceso'?'#1D4ED8':'#92400E', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{c.estado}</span>
                    </td>
                    <td style={{ padding:'12px', color:'#888', fontSize:'12px' }}>{new Date(c.created_at).toLocaleDateString('es-MX')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ color:'#888', fontSize:'12px', margin:'12px 0 0' }}>{filtrados.length} registros encontrados</p>
          </>
        )}
      </div>
    </div>
  )
}
