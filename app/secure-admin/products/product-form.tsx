'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '../admin-shell'
import { ArrowLeft, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { compressImageFile } from '@/lib/image-compress'

interface ProductFormProps {
  productId?: number
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!productId

  const [categories, setCategories] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  const [form, setForm] = useState({
    name: '', description: '', price: '', discount_price: '',
    category_id: '', stock: '', images: [] as string[],
    sizes: [] as string[], is_featured: false, is_best_seller: false,
  })
  const [sizeInput, setSizeInput] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files)
    
    // Validate current image limit (max 5)
    if (form.images.length >= 5) {
      toast.error('Maximum limit of 5 images per product reached.')
      return
    }

    const availableSlots = 5 - form.images.length
    if (fileArr.length > availableSlots) {
      toast.error(`You can only add ${availableSlots} more image(s). (Max 5 images per product)`)
    }

    const filesToUpload = fileArr.slice(0, availableSlots)
    
    // Allowed formats: JPG, JPEG, PNG, WEBP, AVIF, SVG (case-insensitive)
    const allowedTypes = [
      'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/avif', 'image/svg+xml'
    ]
    const allowedExts = /\.(png|jpg|jpeg|webp|avif|svg)$/i

    const validFiles: File[] = []

    for (const f of filesToUpload) {
      if (!allowedTypes.includes(f.type.toLowerCase()) && !f.name.match(allowedExts)) {
        toast.error(`File "${f.name}" is not a supported image format (JPG, JPEG, PNG, WEBP, AVIF, SVG).`)
        continue
      }
      if (f.size > 50 * 1024 * 1024) {
        toast.error(`File "${f.name}" exceeds the 50MB size limit.`)
        continue
      }
      validFiles.push(f)
    }

    if (validFiles.length === 0) return

    setUploadingImages(true)
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken') || ''
    const uploadedUrls: string[] = []

    for (const rawFile of validFiles) {
      const toastId = toast.loading(`Optimizing ${rawFile.name}...`)
      try {
        // Compress high-res camera photos (e.g. IMG_8017.JPG) before upload
        const fileToUpload = await compressImageFile(rawFile, 2000, 0.85)

        toast.loading(`Uploading ${rawFile.name}...`, { id: toastId })
        const fd = new FormData()
        fd.append('file', fileToUpload)

        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers,
          credentials: 'same-origin',
          body: fd,
        })

        if (res.ok) {
          const data = await res.json()
          uploadedUrls.push(data.url)
          toast.success(`${rawFile.name} uploaded successfully!`, { id: toastId })
        } else {
          const err = await res.json()
          toast.error(err.error || `Failed to upload ${rawFile.name}`, { id: toastId })
        }
      } catch (err) {
        console.error('Upload exception:', err)
        toast.error(`Error uploading ${rawFile.name}`, { id: toastId })
      }
    }

    if (uploadedUrls.length > 0) {
      set('images', [...form.images, ...uploadedUrls].slice(0, 5))
    }
    setUploadingImages(false)
  }

  useEffect(() => {
    fetch('/api/categories').then(r => r.ok ? r.json() : null).then(data => {
      setCategories(data?.categories ?? [])
    })
  }, [])

  useEffect(() => {
    if (!productId) return
    fetch(`/api/products/${productId}`).then(r => r.ok ? r.json() : null).then(data => {
      const p = data?.product
      if (p) setForm({
        name: p.name, description: p.description || '',
        price: String(p.price), discount_price: p.discount_price ? String(p.discount_price) : '',
        category_id: p.category_id ? String(p.category_id) : '',
        stock: String(p.stock), images: p.images || [], sizes: p.sizes || [],
        is_featured: p.is_featured, is_best_seller: p.is_best_seller,
      })
    }).finally(() => setLoading(false))
  }, [productId])

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }))

  const removeImage = (index: number) => {
    const updated = [...form.images]
    updated.splice(index, 1)
    set('images', updated)
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= form.images.length) return
    const updated = [...form.images]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    set('images', updated)
  }

  const addSize = () => {
    const s = sizeInput.trim().toUpperCase()
    if (s && !form.sizes.includes(s)) { set('sizes', [...form.sizes, s]); setSizeInput('') }
  }
  const removeSize = (s: string) => set('sizes', form.sizes.filter(x => x !== s))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name, description: form.description || null,
      price: parseFloat(form.price),
      discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
      category_id: form.category_id ? parseInt(form.category_id) : null,
      stock: parseInt(form.stock) || 0,
      images: form.images, sizes: form.sizes,
      is_featured: form.is_featured, is_best_seller: form.is_best_seller,
    }
    try {
      const res = isEdit
        ? await fetch(`/api/admin/products/${productId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })

      if (res.ok) {
        toast.success(isEdit ? 'Product updated' : 'Product created')
        router.push('/secure-admin/products')
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to save product')
      }
    } catch { toast.error('Network error') }
    finally { setSaving(false) }
  }

  const inputCls = "w-full bg-white border border-neutral-200 rounded-lg px-3 py-2.5 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors"
  const labelCls = "block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5"

  if (loading) return (
    <AdminShell>
      <div className="p-6 text-center text-neutral-400 text-sm font-medium">Loading product...</div>
    </AdminShell>
  )

  return (
    <AdminShell>
      <div className="p-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/secure-admin/products" className="text-neutral-400 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-neutral-900 text-2xl font-bold tracking-tight">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="text-neutral-500 text-sm">{isEdit ? 'Update product details' : 'Fill in the details below to list a new product'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic info */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-sm">
            <h2 className="text-neutral-900 text-sm font-bold">Basic Information</h2>
            <div>
              <label className={labelCls}>Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Men's Slim Fit Shirt" suppressHydrationWarning className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Describe the product..." suppressHydrationWarning className={inputCls + ' resize-none'} />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select value={form.category_id} onChange={e => set('category_id', e.target.value)} suppressHydrationWarning className={inputCls}>
                <option value="">Select category</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-sm">
            <h2 className="text-neutral-900 text-sm font-bold">Pricing & Stock</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)} required min="0" step="0.01" placeholder="999" suppressHydrationWarning className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Sale Price (₹)</label>
                <input type="number" value={form.discount_price} onChange={e => set('discount_price', e.target.value)} min="0" step="0.01" placeholder="799" suppressHydrationWarning className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Stock Qty *</label>
                <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} required min="0" placeholder="50" suppressHydrationWarning className={inputCls} />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-neutral-900 text-sm font-bold">Product Images ({form.images.length}/5)</h2>
              <span className="text-neutral-400 text-xs font-medium">JPG, JPEG, PNG, WEBP, AVIF (Max 50MB)</span>
            </div>

            {/* Drop zone */}
            {form.images.length < 5 && (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files) }}
                className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
                  dragOver ? 'border-black bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'
                }`}
                onClick={() => !uploadingImages && document.getElementById('img-file-input')?.click()}
              >
                <input
                  id="img-file-input"
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.avif,.svg,image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                  multiple
                  className="hidden"
                  onChange={e => { if (e.target.files?.length) { uploadFiles(e.target.files); e.target.value = '' } }}
                />
                <div className="flex flex-col items-center justify-center py-8 gap-2 select-none pointer-events-none">
                  {uploadingImages ? (
                    <>
                      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <p className="text-neutral-400 text-sm font-medium">Uploading image(s)...</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4-4a3 3 0 014.24 0L16 16m-2-2l1.59-1.59a3 3 0 014.24 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-neutral-500 text-sm">
                        <span className="text-black font-semibold underline">Click to upload</span> or drag & drop
                      </p>
                      <p className="text-neutral-400 text-xs">JPG, JPEG, PNG, WEBP, AVIF supported • Max 5 images</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Image previews with reorder and delete controls */}
            {form.images.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Image Preview & Ordering</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {form.images.map((url, idx) => (
                    <div key={url + idx} className="relative group aspect-square rounded-lg border border-neutral-200 bg-neutral-50 overflow-hidden shadow-sm flex flex-col">
                      <img
                        src={url}
                        alt={`Product preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-black text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">MAIN</span>
                      )}

                      {/* Reorder and Delete Controls overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        {idx > 0 && (
                          <button
                            type="button"
                            title="Move left"
                            onClick={() => moveImage(idx, 'left')}
                            suppressHydrationWarning
                            className="w-7 h-7 bg-white/90 hover:bg-white text-black rounded-full flex items-center justify-center shadow transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        )}
                        {idx < form.images.length - 1 && (
                          <button
                            type="button"
                            title="Move right"
                            onClick={() => moveImage(idx, 'right')}
                            suppressHydrationWarning
                            className="w-7 h-7 bg-white/90 hover:bg-white text-black rounded-full flex items-center justify-center shadow transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Remove image"
                          onClick={() => removeImage(idx)}
                          suppressHydrationWarning
                          className="w-7 h-7 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sizes */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 shadow-sm">
            <h2 className="text-neutral-900 text-sm font-bold">Sizes (optional)</h2>
            <div className="flex gap-2">
              <input
                value={sizeInput} onChange={e => setSizeInput(e.target.value)}
                placeholder="e.g. S, M, L, XL or 32"
                suppressHydrationWarning
                className={inputCls + ' flex-1'}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())}
              />
              <button type="button" onClick={addSize} suppressHydrationWarning className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 rounded-lg px-3 text-sm transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.sizes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.sizes.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-800 text-xs px-2.5 py-1 rounded-lg border border-neutral-200">
                    {s}
                    <button type="button" onClick={() => removeSize(s)} suppressHydrationWarning className="text-neutral-400 hover:text-red-500 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 shadow-sm">
            <h2 className="text-neutral-900 text-sm font-bold">Labels</h2>
            <div className="flex gap-6">
              {[
                { key: 'is_featured', label: 'Featured Product' },
                { key: 'is_best_seller', label: 'Best Seller' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                      form[key as keyof typeof form]
                        ? 'bg-black border-black text-white'
                        : 'border-neutral-300 bg-white'
                    }`}
                    onClick={() => set(key, !form[key as keyof typeof form])}
                  >
                    {form[key as keyof typeof form] && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <span className="text-neutral-700 text-sm font-semibold">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              suppressHydrationWarning
              className="bg-black hover:bg-neutral-900 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
            <Link href="/secure-admin/products" className="text-neutral-500 hover:text-black text-sm font-semibold transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AdminShell>
  )
}
