import Link from 'next/link'
import sql from '@/lib/db'
import type { Category } from '@/lib/types'

async function getCategories(): Promise<Category[]> {
  try {
    const rows = await sql`SELECT * FROM categories ORDER BY name ASC`
    return rows as unknown as Category[]
  } catch {
    return []
  }
}

export default async function CategoryGrid() {
  const categories = await getCategories()

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-foreground mb-6 text-balance">Shop by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-border hover:border-foreground/30 hover:shadow-sm transition-all bg-card"
          >
            <div className="w-14 h-14 rounded-full overflow-hidden bg-muted ring-1 ring-border group-hover:ring-foreground/20 transition-all">
              {cat.image_url ? (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
            </div>
            <span className="text-xs font-medium text-center text-foreground leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
