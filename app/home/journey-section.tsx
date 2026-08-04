import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function JourneySection() {
  return (
    <section className="bg-background py-0">
      {/* First: Mountain Road Journey */}
      <div className="relative w-full aspect-video md:aspect-auto md:h-96 overflow-hidden">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%204%2C%202026%2C%2006_09_47%20PM-3oooqJkYvF6ZjQ3BH1XsS1abUxjvgU.png"
          alt="Ambitious journey on mountain road"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-lg">
              <p className="text-xs uppercase tracking-widest text-accent mb-4 font-semibold">
                Our Journey
              </p>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Built from Tamil Nadu. Built in Public.
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                A middle class dream turned into a mission. Building a global brand, one step at a time.
              </p>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/about" className="flex items-center gap-2">
                  Read Our Story
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Second: Minimalist Showroom Lifestyle */}
      <div className="grid md:grid-cols-2 gap-0">
        <div className="relative aspect-square md:aspect-auto md:min-h-96">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1000566637.png-TLRgYaZUZssSukm7SuHvezQPpprjj2.jpeg"
            alt="ZYRØCORE minimalist lifestyle showroom"
            fill
            className="object-cover"
          />
        </div>

        <div className="bg-secondary/50 flex items-center p-6 md:p-12 lg:p-16">
          <div className="max-w-md">
            <p className="text-xs uppercase tracking-widest text-accent mb-4 font-semibold">
              The Philosophy
            </p>
            <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Timeless Design.
            </h3>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Minimal today. Relevant tomorrow. Timeless forever. Every piece is designed to transcend seasons and trends, built for those who refuse to follow the crowd.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Premium Quality</p>
                  <p className="text-sm text-muted-foreground">340 GSM cotton. Built to last.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Ethical Production</p>
                  <p className="text-sm text-muted-foreground">Made responsibly. Made with care.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Timeless Style</p>
                  <p className="text-sm text-muted-foreground">Designed to never go out of style.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third: Product Craftsmanship Detail + Brown Hoodie */}
      <div className="grid md:grid-cols-2 gap-0">
        <div className="bg-card flex items-center p-6 md:p-12 lg:p-16 order-2 md:order-1">
          <div className="max-w-md">
            <p className="text-xs uppercase tracking-widest text-accent mb-4 font-semibold">
              Craftsmanship
            </p>
            <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Built to Last.
            </h3>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Tone-on-tone embroidery. Oversized fit. Premium construction. Every detail matters. Every stitch counts. This is what separates ambitious from ordinary.
            </p>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
              <Link href="/products" className="flex items-center gap-2">
                Explore Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative aspect-square md:aspect-auto md:min-h-96 order-1 md:order-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%204%2C%202026%2C%2006_02_50%20PM-xKPpux39mxyPnN7UtMGxh9jI2KSND4.png"
            alt="ZYRØCORE embroidery detail craftsmanship"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Fourth: Brown Hoodie Back Detail */}
      <div className="relative w-full aspect-video md:aspect-auto md:h-96 overflow-hidden">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%204%2C%202026%2C%2005_08_16%20PM-BiZnDdD00gFB05jL3MrkGgZWPyiirA.png"
          alt="ZYRØCORE brown hoodie detail"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-background/80 via-background/40 to-transparent flex items-center justify-end">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-lg ml-auto">
              <p className="text-xs uppercase tracking-widest text-accent mb-4 font-semibold">
                Premium Collection
              </p>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Timeless Hoodie.
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                The foundation of your wardrobe. Premium 340 GSM cotton. Tone-on-tone embroidery. Built for ambitious.
              </p>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/products?category=premium-collection" className="flex items-center gap-2">
                  Shop Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
