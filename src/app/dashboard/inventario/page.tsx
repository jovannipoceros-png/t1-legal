'use client'
import { useState } from 'react'

export default function Inventario() {
  const [filtroEmpresa, setFiltroEmpresa] = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  const contratos = [
    { id:'C-2026-001', empresa:'Solistica S.A.', tipo:'Servicios', empresa_t1:'T1.com', vigencia:'12 meses', vence:'01/04/2027', rfc:'SOL920301ABC', responsable:'Jovanni', firmado:false, estado:'En proceso' },
    { id:'C-2026-002', empresa:'Grupo Modelo', tipo:'NDA', empresa_t1:'Claro Pagos', vigencia:'24 meses', vence:'15/03/2028', rfc:'GRM850115ABC', responsable:'Jovanni', firmado:true, estado:'Cerrado' },
    { id:'C-2026-003', empresa:'FEMSA Comercio', tipo:'Compraventa', empresa_t1:'T1.com', vigencia:'6 meses', vence:'01/07/2026', rfc:'FCO910601ABC', responsable:'Jovanni', firmado:false, estado:'Pendiente' },
    { id:'C-2025-089', empresa:'Rappi Mexico', tipo:'Servicios', empresa_t1:'T1.com', vigencia:'12 meses', vence:'15/05/2026', rfc:'RMX190501ABC', responsable:'Jovanni', firmado:true, estado:'Cerrado' },
    { id:'C-2025-090', empresa:'Mercado Libre', tipo:'Convenio', empresa_t1:'Claro Pagos', vigencia:'18 meses', vence:'30/06/2026', rfc:'MLE990601ABC', responsable:'Jovanni', firmado:false, estado:'En proceso' },
  ]

  const filtrados = contratos.filter(c => {
    const matchEmpresa = filtroEmpresa==='todas' || c.empresa_t1===filtroEmpresa
    const matchEstado = filtroEstado==='todos' || c.firmado===(filtroEstado==='firmados')
    const matchBusqueda = c.empresa.toLowerCase().includes(busqueda.toLowerCase()) || c.id.toLowerCase().includes(busqueda.toLowerCase())
    return matchEmpresa && matchEstado && matchBusqueda
  })

  const stats = (empresa: string) => {
    const cts = empresa==='todas' ? contratos : contratos.filter(c => c.empresa_t1===empresa)
    return {
      total: cts.length,
      firmados: cts.filter(c => c.firmado).length,
      sinFirma: cts.filter(c => !c.firmado).length,
      porVencer: cts.filter(c => !c.firmado && c.estado!=='Cerrado').length,
    }
  }

  const Hero = ({ empresa }: { empresa: string }) => {
    const s = stats(empresa)
    return (
      <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ color:'#0F2447', fontSize:'15px', fontWeight:700, margin:'0 0 16px' }}>{empresa}</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
          {[
            { label:'Total', value:s.total, color:'#0F2447', icon:'📋' },
            { label:'Firmados', value:s.firmados, color:'#0D5C36', icon:'✅' },
            { label:'Sin firma', value:s.sinFirma, color:'#F59E0B', icon:'⏳' },
            { label:'Por vencer', value:s.porVencer, color:'#E8321A', icon:'⚠️' },
          ].map((k,i) => (
            <div key={i} style={{ textAlign:'center', padding:'12px', background:'#F8F8F8', borderRadius:'10px' }}>
              <p style={{ fontSize:'18px', margin:'0 0 4px' }}>{k.icon}</p>
              <p style={{ color:k.color, fontSize:'22px', fontWeight:700, margin:'0 0 2px' }}>{k.value}</p>
              <p style={{ color:'#888', fontSize:'11px', margin:0 }}>{k.label}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Inventario Legal</h1>
      <p style={{ color:'#888', margin:'0 0 24px' }}>Control completo de contratos T1.com y Claro Pagos</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' }}>
        <Hero empresa="T1.com" />
        <Hero empresa="Claro Pagos" />
      </div>

      <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por empresa o ID..."
            style={{ flex:1, minWidth:'200px', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none' }} />
          <select value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)}
            style={{ padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none', color:'#0F2447' }}>
            <option value="todas">Todas las empresas</option>
            <option value="T1.com">T1.com</option>
            <option value="Claro Pagos">Claro Pagos</option>
          </select>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
            style={{ padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none', color:'#0F2447' }}>
            <option value="todos">Todos</option>
            <option value="firmados">Firmados</option>
            <option value="sinFirma">Sin firma</option>
          </select>
          <button style={{ background:'#0F2447', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
            Exportar CSV
          </button>
        </div>

        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
          <thead>
            <tr style={{ background:'#F8F8F8' }}>
              {['ID','Empresa','Tipo','T1','Vigencia','Vence','RFC','Responsable','Firma','Estado'].map((h,i) => (
                <th key={i} style={{ padding:'10px 12px', color:'#0F2447', fontWeight:700, textAlign:'left', fontSize:'11px', borderBottom:'1px solid #F0F0F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c,i) => (
              <tr key={i} style={{ borderBottom:'1px solid #F0F0F0', cursor:'pointer' }}>
                <td style={{ padding:'12px', color:'#E8321A', fontWeight:700 }}>{c.id}</td>
                <td style={{ padding:'12px', color:'#0F2447', fontWeight:600 }}>{c.empresa}</td>
                <td style={{ padding:'12px', color:'#555' }}>{c.tipo}</td>
                <td style={{ padding:'12px' }}>
                  <span style={{ background:'#EFF6FF', color:'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{c.empresa_t1}</span>
                </td>
                <td style={{ padding:'12px', color:'#555' }}>{c.vigencia}</td>
                <td style={{ padding:'12px', color:'#555' }}>{c.vence}</td>
                <td style={{ padding:'12px', color:'#555', fontFamily:'monospace', fontSize:'11px' }}>{c.rfc}</td>
                <td style={{ padding:'12px', color:'#555' }}>{c.responsable}</td>
                <td style={{ padding:'12px' }}>
                  <span style={{ background:c.firmado?'#F0FDF4':'#FEF3C7', color:c.firmado?'#166534':'#92400E', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                    {c.firmado?'✓ Firmado':'Pendiente'}
                  </span>
                </td>
                <td style={{ padding:'12px' }}>
                  <span style={{ background:c.estado==='Cerrado'?'#F0FDF4':c.estado==='En proceso'?'#EFF6FF':'#FEF3C7', color:c.estado==='Cerrado'?'#166534':c.estado==='En proceso'?'#1D4ED8':'#92400E', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                    {c.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ color:'#888', fontSize:'12px', margin:'12px 0 0' }}>{filtrados.length} contratos encontrados</p>
      </div>
    </div>
  )
}
