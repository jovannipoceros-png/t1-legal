'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ExpedienteRedirect() {
  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    if (id) {
      router.replace(`/dashboard/expediente?buscar=${id}`)
    }
  }, [id])

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', color:'#888' }}>
      Cargando expediente...
    </div>
  )
}
