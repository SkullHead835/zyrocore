import { Truck, RotateCcw, Shield, Sparkles } from 'lucide-react'

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹999' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '15-day hassle-free returns' },
  { icon: Shield, title: 'Authentic Products', desc: '100% genuine fashion brands' },
  { icon: Sparkles, title: 'New Arrivals Weekly', desc: 'Fresh styles every week' },
]

export default function BannerStrip() {
  return (
    <section className="bg-secondary border-y border-border py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
