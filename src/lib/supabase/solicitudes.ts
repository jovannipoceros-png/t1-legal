import { createClient } from './client'

export async function guardarSolicitud(form: any) {
  const supabase = createClient()
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString().slice(-4)
  const id = `C-${year}-${timestamp}`

  const { data, error } = await supabase.from('solicitudes').insert([{
    id,
    nombre: form.nombre,
    correo: form.correo,
    area: form.area === 'Otro' ? form.area_otro : form.area,
    empresa_t1: form.empresa_t1,
    es_lider: form.es_lider,
    lider_nombre: form.lider_nombre,
    lider_correo: form.lider_correo,
    flujo: form.flujo,
    tipo_solicitud: form.tipo_solicitud === 'Otro' ? form.tipo_solicitud_otro : form.tipo_solicitud,
    descripcion: form.descripcion,
    idioma: form.idioma === 'Otro' ? form.idioma_otro : form.idioma,
    prioridad: form.prioridad,
    fecha_limite: form.fecha_limite,
    confidencial: form.confidencial,
    nombre_empresa: form.nombre_empresa,
    rfc: form.rfc,
    apoderado: form.apoderado,
    nacionalidad: form.nacionalidad,
    tiene_contrato_previo: form.tiene_contrato_previo,
    requiere_traduccion: form.requiere_traduccion,
    idioma_traduccion: form.idioma_traduccion,
    condiciones_aplican: form.condiciones_aplican,
    vigencia: form.vigencia,
    contraprestacion: form.contraprestacion,
    plazo_pago: form.plazo_pago,
    tipo_dias_pago: form.tipo_dias_pago,
    tipo_firma: form.tipo_firma,
    condiciones_especiales: form.condiciones_especiales,
    estado: 'Pendiente',
  }]).select()

  if (error) throw error

  const esAccesoTotal = form.area === 'Juridico'
  const rol = esAccesoTotal ? 'legal' : form.es_lider === 'si' ? 'revisor' : 'lectura'

  await supabase.from('usuarios').upsert([{
    correo: form.correo,
    nombre: form.nombre,
    area: form.area === 'Otro' ? form.area_otro : form.area,
    empresa_t1: form.empresa_t1,
    es_lider: form.es_lider === 'si',
    lider_correo: form.lider_correo,
    lider_nombre: form.lider_nombre,
    rol,
    estado: esAccesoTotal ? 'activo' : 'pendiente',
  }], { onConflict: 'correo' })

  try {
    await fetch('/api/notificaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'nueva_solicitud',
        correo: 'jovanni.poceros@t1.com',
        nombre: form.nombre,
        id,
        tipo_solicitud: form.tipo_solicitud
      })
    })
  } catch(e) {}
  return { id, data }
}

export async function obtenerSolicitudes() {
  const supabase = createClient()
  const { data, error } = await supabase.from('solicitudes').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function obtenerSolicitudesPorCorreo(correo: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('solicitudes').select('*').eq('correo', correo).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function actualizarEstado(id: string, estado: string, nota?: string) {
  const supabase = createClient()
  const { error } = await supabase.from('solicitudes').update({ estado }).eq('id', id)
  if (error) throw error
  await agregarTracking(id, estado, nota)
  return true
}

export async function agregarTracking(solicitud_id: string, estado: string, nota?: string) {
  const supabase = createClient()
  const { error } = await supabase.from('tracking').insert([{
    solicitud_id,
    estado,
    nota: nota || `Estado actualizado a: ${estado}`,
    autor: 'Jovanni Poceros',
  }])
  if (error) throw error
  return true
}

export async function obtenerTracking(solicitud_id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('tracking').select('*').eq('solicitud_id', solicitud_id).order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function subirDocumento(solicitudId: string, archivo: File) {
  const supabase = createClient()
  const nombreArchivo = `${solicitudId}/${Date.now()}_${archivo.name}`
  const { data, error } = await supabase.storage
    .from('expedientes')
    .upload(nombreArchivo, archivo)
  if (error) throw error
  return data
}

export async function obtenerDocumentos(solicitudId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from('expedientes')
    .list(solicitudId)
  if (error) throw error
  return data || []
}

export async function obtenerUrlDocumento(solicitudId: string, nombreArchivo: string) {
  const supabase = createClient()
  const { data } = await supabase.storage
    .from('expedientes')
    .createSignedUrl(`${solicitudId}/${nombreArchivo}`, 3600)
  return data?.signedUrl || ''
}

export async function cerrarExpediente(id: string, archivoFirmado: string) {
  const supabase = createClient()
  const { error } = await supabase.from('solicitudes').update({
    estado: 'Cerrado',
    fecha_cierre: new Date().toISOString(),
    archivo_firmado: archivoFirmado,
  }).eq('id', id)
  if (error) throw error
  await agregarTracking(id, 'Cerrado', 'Contrato firmado cargado — Expediente cerrado')
  return true
}

