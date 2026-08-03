'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '../admin-shell'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

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
  const [imageInput, setImageInput] = useState('')
  const [sizeInput, setSizeInput] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files)
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
    const valid = fileArr.filter(f => allowed.includes(f.type) || f.name.match(/\.(png|jpg|jpeg|svg)$/i))
    if (valid.length === 0) {
      toast.error('Only PNG, JPG, JPEG, and SVG files are allowed')
      return
    }
    setUploadingImages(true)
    const token = localStorage.getItem('adminToken') || ''
    for (const file of valid) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
        if (res.ok) {
          const data = await res.json()
          set('images', [...form.images, data.url])
          toast.success(`${file.name} uploaded`)
        } else {
          const err = await res.json()
          toast.error(err.error || `Failed to upload ${file.name}`)
        }
      } catch {
        toast.error(`Error uploading ${file.name}`)
      }
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

  const removeImage = (url: string) => set('images', form.images.filter(i => i !== url))

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

  const inputCls = "w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#d4a017] transition-colors"
  const labelCls = "block text-xs font-medium text-[#888] uppercase tracking-wider mb-1.5"

  if (loading) return (
    <AdminShell>
      <div className="p-6 text-center text-[#444] text-sm">Loading product...</div>
    </AdminShell>
  )

  return (
    <AdminShell>
      <div className="p-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/secure-admin/products" className="text-[#555] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-white text-xl font-bold">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="text-[#555] text-sm">{isEdit ? 'Update product details' : 'Fill in the details below to list a new product'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic info */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 space-y-4">
            <h2 className="text-white text-sm font-semibold">Basic Information</h2>
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
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 space-y-4">
            <h2 className="text-white text-sm font-semibold">Pricing & Stock</h2>
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
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-sm font-semibold">Product Images</h2>
              <span className="text-[#555] text-xs">PNG, JPG, JPEG, SVG</span>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files) }}
              className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
                dragOver ? 'border-[#d4a017] bg-[#d4a017]/5' : 'border-[#2a2a2a] hover:border-[#444]'
              }`}
              onClick={() => !uploadingImages && document.getElementById('img-file-input')?.click()}
            >
              <input
                id="img-file-input"
                type="file"
                accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                multiple
                className="hidden"
                onChange={e => { if (e.target.files?.length) { uploadFiles(e.target.files); e.target.value = '' } }}
              />
              <div className="flex flex-col items-center justify-center py-8 gap-2 select-none pointer-events-none">
                {uploadingImages ? (
                  <>
                    <div className="w-8 h-8 border-2 border-[#d4a017] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#888] text-sm">Uploading...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4-4a3 3 0 014.24 0L16 16m-2-2l1.59-1.59a3 3 0 014.24 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[#888] text-sm">
                      <span className="text-[#d4a017] font-medium">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-[#555] text-xs">PNG, JPG, JPEG, SVG supported • Multiple files allowed</p>
                  </>
                )}
              </div>
            </div>

            {/* Image previews */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-1">
                {form.images.map((url, idx) => (
                  <div key={url} className="relative group aspect-square">
                    <img
                      src={url}
                      alt={`Product image ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]"
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-[#d4a017] text-black text-[9px] font-bold text-center py-0.5 rounded-b-lg">MAIN</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      suppressHydrationWarning
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* Sizes */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 space-y-3">
            <h2 className="text-white text-sm font-semibold">Sizes (optional)</h2>
            <div className="flex gap-2">
              <input
                value={sizeInput} onChange={e => setSizeInput(e.target.value)}
                placeholder="e.g. S, M, L, XL or 32"
                suppressHydrationWarning
                className={inputCls + ' flex-1'}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())}
              />
              <button type="button" onClick={addSize} suppressHydrationWarning className="bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white rounded-lg px-3 text-sm transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.sizes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.sizes.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 bg-[#1e1e1e] text-[#ccc] text-xs px-2.5 py-1 rounded-lg">
                    {s}
                    <button type="button" onClick={() => removeSize(s)} suppressHydrationWarning className="text-[#555] hover:text-red-400 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 space-y-3">
            <h2 className="text-white text-sm font-semibold">Labels</h2>
            <div className="flex gap-6">
              {[
                { key: 'is_featured', label: 'Featured Product' },
                { key: 'is_best_seller', label: 'Best Seller' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                      form[key as keyof typeof form]
                        ? 'bg-[#d4a017] border-[#d4a017]'
                        : 'border-[#333] bg-[#1a1a1a]'
                    }`}
                    onClick={() => set(key, !form[key as keyof typeof form])}
                  >
                    {form[key as keyof typeof form] && <span className="text-black text-[10px] font-bold">✓</span>}
                  </div>
                  <span className="text-[#aaa] text-sm">{label}</span>
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
              className="bg-[#d4a017] hover:bg-[#e6b01e] disabled:opacity-50 text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
            <Link href="/secure-admin/products" className="text-[#666] hover:text-white text-sm transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AdminShell>
  )
}
