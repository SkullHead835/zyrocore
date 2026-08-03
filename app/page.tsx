import Header from '@/components/header'
import Footer from '@/components/footer'
import HeroSection from './home/hero-section'
import CategoryGrid from './home/category-grid'
import FeaturedProducts from './home/featured-products'
import BestSellers from './home/best-sellers'
import BannerStrip from './home/banner-strip'
import EmptyStorefront from './home/empty-storefront'
import sql from '@/lib/db'

export const dynamic = 'force-dynamic'

async function hasProducts(): Promise<boolean> {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM products`
    return parseInt(result[0].count) > 0
  } catch {
    return false
  }
}

export default async function HomePage() {
  const hasProds = await hasProducts()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoryGrid />
        {hasProds ? (
          <>
            <FeaturedProducts />
            <BannerStrip />
            <BestSellers />
          </>
        ) : (
          <>
            <BannerStrip />
            <EmptyStorefront />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
