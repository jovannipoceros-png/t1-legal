'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function EditorRedirect() {
  const { id } = useParams()
  const router = useRouter()
  useEffect(() => { if (id) router.replace(`/dashboard/editor?id=${id}`) }, [id])
  return <div style={{ padding:'32px', fontFamily:'sans-serif', color:'#888' }}>Cargando editor...</div>
}
