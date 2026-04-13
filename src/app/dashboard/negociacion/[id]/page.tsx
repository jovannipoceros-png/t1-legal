'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function NegociacionRedirect() {
  const { id } = useParams()
  const router = useRouter()
  useEffect(() => { if (id) router.replace(`/dashboard/negociacion?id=${id}`) }, [id])
  return <div style={{ padding:'32px', fontFamily:'sans-serif', color:'#888' }}>Cargando negociación...</div>
}
