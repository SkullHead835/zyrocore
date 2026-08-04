import { Truck, RotateCcw, Shield, Sparkles } from 'lucide-react'

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹999' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '15-day hassle-free returns' },
  { icon: Shield, title: 'Authentic Products', desc: '100% genuine fashion brands' },
  { icon: Sparkles, title: 'New Arrivals Weekly', desc: 'Fresh styles every week' },
]

export default function BannerStrip() {
  return (
    <section className="bg-secondary/50 border-y border-border py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center md:items-start gap-3 text-center md:text-left">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
