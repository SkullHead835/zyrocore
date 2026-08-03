'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { Plus, Pencil, Trash2, Search, Star, Upload, X, ImageIcon } from 'lucide-react'
import AdminLayout from '../admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { formatPrice } from '@/lib/utils-shop'
import { toast } from 'sonner'
import type { Product, Category } from '@/lib/types'

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.json())
}

interface ProductForm {
  name: string
  description: string
  price: string
  discount_price: string
  category_id: string
  images: string
  stock: string
  sizes: string
  is_featured: boolean
  is_best_seller: boolean
}

const emptyForm: ProductForm = {
  name: '', description: '', price: '', discount_price: '',
  category_id: '', images: '', stock: '0', sizes: '',
  is_featured: false, is_best_seller: false,
}

export default function AdminProductsPage() {
  const [ready, setReady] = useState(false)
  const [search, setSearch] = useState('')
  const { data, isLoading, mutate } = useSWR(ready ? '/api/admin/products' : null, fetcher)
  const { data: catData } = useSWR(ready ? '/api/categories' : null, fetcher)

  const rawProducts = data?.products ?? data
  const products: Product[] = Array.isArray(rawProducts) ? rawProducts : []
  const rawCategories = catData?.categories ?? catData
  const categories: Category[] = Array.isArray(rawCategories) ? rawCategories : []

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (file: File) => {
    setUploading(true)
    const token = localStorage.getItem('adminToken')
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    })
    setUploading(false)
    if (!res.ok) { toast.error('Image upload failed'); return }
    const { url } = await res.json()
    setForm(f => ({
      ...f,
      images: f.images ? `${f.images}, ${url}` : url,
    }))
    toast.success('Image uploaded')
  }

  const removeImage = (url: string) => {
    setForm(f => ({
      ...f,
      images: f.images.split(',').map(s => s.trim()).filter(s => s !== url).join(', '),
    }))
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) window.location.replace('/admin/login')
    else setReady(true)
  }, [])

  const openCreate = () => {
    setEditProduct(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditProduct(p)
    setForm({
      name: p.name, description: p.description || '',
      price: String(p.price), discount_price: p.discount_price ? String(p.discount_price) : '',
      category_id: p.category_id ? String(p.category_id) : '',
      images: (p.images || []).join(', '), stock: String(p.stock),
      sizes: (p.sizes || []).join(', '),
      is_featured: p.is_featured, is_best_seller: p.is_best_seller,
    })
    setDialogOpen(true)
  }

  const authHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
  }

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return }
    setSaving(true)
    const payload = {
      name: form.name, description: form.description,
      price: parseFloat(form.price),
      discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
      category_id: form.category_id ? parseInt(form.category_id) : null,
      images: form.images.split(',').map(s => s.trim()).filter(Boolean),
      stock: parseInt(form.stock) || 0,
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      is_featured: form.is_featured, is_best_seller: form.is_best_seller,
    }

    const url = editProduct ? `/api/admin/products/${editProduct.id}` : '/api/admin/products'
    const method = editProduct ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) })
    const json = await res.json()

    setSaving(false)
    if (res.ok) {
      toast.success(editProduct ? 'Product updated' : 'Product created')
      setDialogOpen(false)
      mutate()
    } else {
      toast.error(json?.error || 'Failed to save product')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (res.ok) { toast.success('Product deleted'); mutate() }
    else { const j = await res.json(); toast.error(j?.error || 'Failed to delete') }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!ready) return null

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{products.length} total products</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Product
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rating</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tags</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.map(product => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {product.images?.[0] && (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="font-medium line-clamp-1 max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.category_name || '—'}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(product.discount_price ?? product.price)}
                      {product.discount_price && (
                        <span className="text-xs text-muted-foreground line-through ml-1">{formatPrice(product.price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={product.stock === 0 ? 'text-destructive font-medium' : ''}>{product.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
                        <span>{Number(product.rating).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {product.is_featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                        {product.is_best_seller && <Badge variant="secondary" className="text-xs">Best Seller</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(product)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Price *</Label>
                <Input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Sale Price</Label>
                <Input type="number" min="0" step="0.01" value={form.discount_price} onChange={e => setForm(f => ({ ...f, discount_price: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Stock</Label>
                <Input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Images</Label>
              {/* Preview existing images */}
              {form.images && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.images.split(',').map(s => s.trim()).filter(Boolean).map((url, i) => (
                    <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        suppressHydrationWarning
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = '' }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                suppressHydrationWarning
                className="w-full border-dashed"
              >
                {uploading ? (
                  <span className="flex items-center gap-2"><Upload className="w-4 h-4 animate-pulse" />Uploading...</span>
                ) : (
                  <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" />Upload Image</span>
                )}
              </Button>
              {/* Manual URL input fallback */}
              <Input
                value={form.images}
                onChange={e => setForm(f => ({ ...f, images: e.target.value }))}
                placeholder="Or paste URL(s) comma-separated"
                className="text-xs text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sizes (comma-separated, e.g. S, M, L)</Label>
              <Input value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} placeholder="XS, S, M, L, XL" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.is_featured} onCheckedChange={c => setForm(f => ({ ...f, is_featured: !!c }))} />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.is_best_seller} onCheckedChange={c => setForm(f => ({ ...f, is_best_seller: !!c }))} />
                <span className="text-sm">Best Seller</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
