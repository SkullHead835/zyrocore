import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { logAdminAction } from '@/lib/audit'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  let admin
  try {
    admin = await requireAdmin()
  } catch (err) {
    console.error('[upload auth error]:', err)
    return NextResponse.json({ error: 'Unauthorized admin session' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 50MB size check
    const MAX_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 })
    }

    // Extension & mime-type validation (case-insensitive)
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg']
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/svg+xml',
    ]

    if (!allowedExtensions.includes(ext) && !allowedMimeTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `File format .${ext} is not supported. Please upload JPG, JPEG, PNG, WEBP, AVIF, or SVG.` },
        { status: 400 }
      )
    }

    const sanitizedExt = ext || 'jpg'
    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${sanitizedExt}`

    let fileUrl = ''

    // Attempt Vercel Blob upload first
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(filename, file, { access: 'public' })
        fileUrl = blob.url
      } else {
        throw new Error('BLOB_READ_WRITE_TOKEN token missing')
      }
    } catch (blobErr) {
      console.warn('[upload] Blob token missing or failed. Using local storage fallback:', blobErr)
      // Fallback: save to public/uploads directory or base64
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }

        const localFileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${sanitizedExt}`
        const filePath = path.join(uploadsDir, localFileName)
        fs.writeFileSync(filePath, buffer)

        fileUrl = `/uploads/${localFileName}`
      } catch (localErr) {
        console.warn('[upload] Disk write failed. Using base64 Data URI:', localErr)
        const bytes = await file.arrayBuffer()
        const base64 = Buffer.from(bytes).toString('base64')
        const mime = file.type || `image/${sanitizedExt}`
        fileUrl = `data:${mime};base64,${base64}`
      }
    }

    await logAdminAction(admin.id, 'image_upload', `Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB) -> ${fileUrl}`)

    return NextResponse.json({ url: fileUrl })
  } catch (error) {
    console.error('[upload] Unexpected server error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
