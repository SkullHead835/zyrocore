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
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate size (max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 })
    }

    // Validate mime type & extensions (JPG, JPEG, PNG, WEBP, AVIF, SVG)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/svg+xml',
    ]

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg']

    if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: 'Only JPG, JPEG, PNG, WEBP, AVIF and SVG image formats are allowed' },
        { status: 400 }
      )
    }

    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    let fileUrl = ''

    // Attempt Vercel Blob upload first
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(filename, file, { access: 'public' })
        fileUrl = blob.url
      } else {
        throw new Error('BLOB_READ_WRITE_TOKEN is missing')
      }
    } catch (blobErr) {
      console.warn('[upload] Vercel blob token missing or failed. Using local storage fallback:', blobErr)
      // Fallback: save to public/uploads directory or construct Data URI
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }
        
        const localFileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const filePath = path.join(uploadsDir, localFileName)
        fs.writeFileSync(filePath, buffer)
        
        fileUrl = `/uploads/${localFileName}`
      } catch (localErr) {
        console.warn('[upload] Local disk write failed. Converting file to base64 Data URI:', localErr)
        const bytes = await file.arrayBuffer()
        const base64 = Buffer.from(bytes).toString('base64')
        const mime = file.type || `image/${ext}`
        fileUrl = `data:${mime};base64,${base64}`
      }
    }

    await logAdminAction(admin.id, 'image_upload', `Uploaded file: ${file.name} -> ${fileUrl}`)

    return NextResponse.json({ url: fileUrl })
  } catch (error) {
    console.error('[upload] error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
