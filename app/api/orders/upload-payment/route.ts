import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const orderId = formData.get('order_id') as string

  if (!file || !orderId) {
    return NextResponse.json({ error: 'file and order_id are required' }, { status: 400 })
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG or WebP allowed' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const filename = `payment-screenshots/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const blob = await put(filename, file, { access: 'public' })

  await sql`
    UPDATE orders
    SET payment_screenshot = ${blob.url}, payment_status = 'submitted'
    WHERE id = ${parseInt(orderId)} AND user_id = ${user.id}
  `

  return NextResponse.json({ url: blob.url })
}
