'use client'
import { useState } from 'react'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([
    { id:1, nombre:'Jovanni Poceros', correo:'jovanni.poceros@t1.com', rol:'admin', area:'Legal', estado:'activo', fecha:'01/01/2026' },
    { id:2, nombre:'Maria Garcia', correo:'maria.garcia@t1.com', rol:'legal', area:'Legal', estado:'activo', fecha:'15/02/2026' },
    { id:3, nombre:'Carlos Lopez', correo:'carlos.lopez@t1.com', rol:'revisor', area:'Finanzas', estado:'activo', fecha:'01/03/2026' },
    { id:4, nombre:'Ana Martinez', correo:'ana.martinez@t1.com', rol:'lectura', area:'Comercial', estado:'pendiente', fecha:'01/04/2026' },
    { id:5, nombre:'Roberto Silva', correo:'roberto.silva@t1.com', rol:'legal', area:'Legal', estado:'activo', fecha:'15/03/2026' },
  ])

  const roles = ['admin','legal','revisor','lectura']
  const colores: Record<string,string> = { admin:'#E8321A', legal:'#0F2447', revisor:'#3B82F6', lectura:'#888' }

  const cambiarRol = (id:number, rol:string) => {
    setUsuarios(u => u.map(x => x.id===id ? {...x, rol} : x))
  }

  const cambiarEstado = (id:number) => {
    setUsuarios(u => u.map(x => x.id===id ? {...x, estado:x.estado==='activo'?'revocado':'activo'} : x))
  }

  const aprobar = (id:number) => {
    setUsuarios(u => u.map(x => x.id===id ? {...x, estado:'activo'} : x))
  }

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Usuarios</h1>
      <p style={{ color:'#888', margin:'0 0 24px' }}>Gestion de accesos y roles — Solo administrador</p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {[
          { label:'Total usuarios', value:usuarios.length, color:'#0F2447' },
          { label:'Activos', value:usuarios.filter(u=>u.estado==='activo').length, color:'#0D5C36' },
          { label:'Pendientes', value:usuarios.filter(u=>u.estado==='pendiente').length, color:'#F59E0B' },
          { label:'Revocados', value:usuarios.filter(u=>u.estado==='revocado').length, color:'#E8321A' },
        ].map((k,i) => (
          <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ color:'#888', fontSize:'12px', margin:'0 0 8px' }}>{k.label}</p>
            <p style={{ color:k.color, fontSize:'32px', fontWeight:700, margin:0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {usuarios.filter(u=>u.estado==='pendiente').length > 0 && (
        <div style={{ background:'#FFF8F0', border:'1px solid #FED7AA', borderRadius:'12px', padding:'16px 20px', marginBottom:'20px' }}>
          <h3 style={{ color:'#92400E', fontSize:'13px', fontWeight:700, margin:'0 0 10px' }}>Solicitudes de acceso pendientes</h3>
          {usuarios.filter(u=>u.estado==='pendiente').map((u,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid #FED7AA' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#F59E0B', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'14px' }}>
                {u.nombre.charAt(0)}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ color:'#0F2447', fontWeight:700, fontSize:'13px', margin:'0 0 2px' }}>{u.nombre}</p>
                <p style={{ color:'#888', fontSize:'11px', margin:0 }}>{u.correo} — {u.area}</p>
              </div>
              <select onChange={e => cambiarRol(u.id, e.target.value)} defaultValue=""
                style={{ padding:'6px 10px', borderRadius:'6px', border:'1px solid #FED7AA', fontSize:'12px', color:'#0F2447', outline:'none', background:'white' }}>
                <option value="" disabled>Asignar rol...</option>
                {roles.filter(r=>r!=='admin').map((r,j) => <option key={j} value={r}>{r}</option>)}
              </select>
              <button onClick={() => aprobar(u.id)}
                style={{ background:'#0D5C36', color:'white', border:'none', padding:'7px 14px', borderRadius:'7px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                Aprobar
              </button>
              <button onClick={() => cambiarEstado(u.id)}
                style={{ background:'#E8321A', color:'white', border:'none', padding:'7px 14px', borderRadius:'7px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                Rechazar
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 16px' }}>Todos los usuarios</h3>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
          <thead>
            <tr style={{ background:'#F8F8F8' }}>
              {['Usuario','Correo','Area','Rol','Estado','Desde','Acciones'].map((h,i) => (
                <th key={i} style={{ padding:'10px 12px', color:'#0F2447', fontWeight:700, textAlign:'left', fontSize:'11px', borderBottom:'1px solid #F0F0F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u,i) => (
              <tr key={i} style={{ borderBottom:'1px solid #F0F0F0', opacity:u.estado==='revocado'?0.5:1 }}>
                <td style={{ padding:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:colores[u.rol]||'#888', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'12px' }}>
                      {u.nombre.charAt(0)}
                    </div>
                    <span style={{ color:'#0F2447', fontWeight:600 }}>{u.nombre}</span>
                  </div>
                </td>
                <td style={{ padding:'12px', color:'#555', fontSize:'12px' }}>{u.correo}</td>
                <td style={{ padding:'12px', color:'#555' }}>{u.area}</td>
                <td style={{ padding:'12px' }}>
                  <select value={u.rol} onChange={e => cambiarRol(u.id, e.target.value)}
                    disabled={u.id===1}
                    style={{ padding:'5px 8px', borderRadius:'6px', border:`1px solid ${colores[u.rol]}`, fontSize:'11px', color:colores[u.rol], fontWeight:700, outline:'none', background:'white', cursor:u.id===1?'default':'pointer' }}>
                    {roles.map((r,j) => <option key={j} value={r}>{r}</option>)}
                  </select>
                </td>
                <td style={{ padding:'12px' }}>
                  <span style={{ background:u.estado==='activo'?'#F0FDF4':u.estado==='pendiente'?'#FEF3C7':'#FFF5F5', color:u.estado==='activo'?'#166534':u.estado==='pendiente'?'#92400E':'#C42A15', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'10px' }}>
                    {u.estado}
                  </span>
                </td>
                <td style={{ padding:'12px', color:'#888', fontSize:'12px' }}>{u.fecha}</td>
                <td style={{ padding:'12px' }}>
                  {u.id !== 1 && (
                    <button onClick={() => cambiarEstado(u.id)}
                      style={{ background:u.estado==='activo'?'#FFF5F5':'#F0FDF4', color:u.estado==='activo'?'#E8321A':'#0D5C36', border:`1px solid ${u.estado==='activo'?'#FFD0CC':'#BBF7D0'}`, padding:'5px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                      {u.estado==='activo'?'Revocar':'Activar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginTop:'16px' }}>
        <h3 style={{ color:'#0F2447', fontSize:'13px', fontWeight:700, margin:'0 0 12px' }}>Permisos por rol</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
          {[
            { rol:'admin', permisos:['Todos los modulos','Gestion de usuarios','Configuracion del sistema'] },
            { rol:'legal', permisos:['Solicitudes','Editor','Traductor','Analisis IA','Negociacion','Expediente','Inventario','Reportes','Biblioteca','Entrenamiento'] },
            { rol:'revisor', permisos:['Solicitudes','Expediente','Inventario','Biblioteca'] },
            { rol:'lectura', permisos:['Dashboard — Solo KPIs'] },
          ].map((r,i) => (
            <div key={i} style={{ padding:'14px', background:'#F8F8F8', borderRadius:'10px' }}>
              <span style={{ background:colores[r.rol], color:'white', fontSize:'11px', fontWeight:700, padding:'2px 10px', borderRadius:'10px', display:'inline-block', marginBottom:'10px' }}>{r.rol}</span>
              {r.permisos.map((p,j) => (
                <p key={j} style={{ color:'#555', fontSize:'11px', margin:'0 0 4px', display:'flex', gap:'4px' }}>
                  <span style={{ color:'#0D5C36' }}>✓</span>{p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
