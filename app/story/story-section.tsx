'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function StorySection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="bg-background py-0">
      {/* First: Mountain Road Journey - Full Width with Overlay */}
      <div 
        className={`relative w-full aspect-video md:aspect-auto md:h-screen overflow-hidden transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%204%2C%202026%2C%2006_09_47%20PM-3oooqJkYvF6ZjQ3BH1XsS1abUxjvgU.png"
          alt="Ambitious journey on mountain road"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-2xl">
              <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <p className="text-xs uppercase tracking-widest text-accent mb-4 font-semibold">
                  Our Journey
                </p>
              </div>
              <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
                  Built from Tamil Nadu. Built in Public.
                </h1>
              </div>
              <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                  A middle class dream turned into a mission. Building a global brand, one step at a time.
                </p>
              </div>
              <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                  <Link href="/products" className="flex items-center gap-2">
                    Explore Our Collection
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second: Minimalist Showroom Philosophy */}
      <div className="grid md:grid-cols-2 gap-0 min-h-screen md:min-h-auto">
        <div className="relative aspect-square md:aspect-auto md:min-h-screen flex items-center justify-center order-2 md:order-1">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1000566637.png-TLRgYaZUZssSukm7SuHvezQPpprjj2.jpeg"
            alt="ZYRØCORE minimalist lifestyle showroom"
            fill
            className="object-cover"
          />
        </div>

        <div className="bg-secondary/50 flex items-center p-6 md:p-12 lg:p-16 order-1 md:order-2">
          <div className="max-w-md">
            <div className="transform transition-all duration-1000">
              <p className="text-xs uppercase tracking-widest text-accent mb-4 font-semibold">
                The Philosophy
              </p>
            </div>
            <div className="transform transition-all duration-1000 delay-100">
              <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Timeless Design.
              </h2>
            </div>
            <div className="transform transition-all duration-1000 delay-200">
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Minimal today. Relevant tomorrow. Timeless forever. Every piece is designed to transcend seasons and trends, built for those who refuse to follow the crowd.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Premium Quality', desc: '340 GSM cotton. Built to last.' },
                { title: 'Ethical Production', desc: 'Made responsibly. Made with care.' },
                { title: 'Timeless Style', desc: 'Designed to never go out of style.' },
              ].map((item, i) => (
                <div 
                  key={i}
                  className={`flex items-start gap-4 transform transition-all duration-1000 ${
                    isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[-20px] opacity-0'
                  }`}
                  style={{ transitionDelay: `${300 + i * 100}ms` }}
                >
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Third: Craftsmanship Detail */}
      <div className="grid md:grid-cols-2 gap-0 min-h-screen md:min-h-auto">
        <div className="bg-card flex items-center p-6 md:p-12 lg:p-16 order-2 md:order-1">
          <div className="max-w-md">
            <div className="transform transition-all duration-1000">
              <p className="text-xs uppercase tracking-widest text-accent mb-4 font-semibold">
                Craftsmanship
              </p>
            </div>
            <div className="transform transition-all duration-1000 delay-100">
              <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Built to Last.
              </h2>
            </div>
            <div className="transform transition-all duration-1000 delay-200">
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Tone-on-tone embroidery. Oversized fit. Premium construction. Every detail matters. Every stitch counts. This is what separates ambitious from ordinary.
              </p>
            </div>
            <div className="transform transition-all duration-1000 delay-300">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/products" className="flex items-center gap-2">
                  Explore Collection
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative aspect-square md:aspect-auto md:min-h-screen flex items-center justify-center order-1 md:order-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%204%2C%202026%2C%2006_02_50%20PM-xKPpux39mxyPnN7UtMGxh9jI2KSND4.png"
            alt="ZYRØCORE embroidery detail craftsmanship"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Fourth: Premium Collection Hoodie */}
      <div 
        className={`relative w-full aspect-video md:aspect-auto md:h-screen overflow-hidden flex items-center transition-all duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%204%2C%202026%2C%2005_08_16%20PM-BiZnDdD00gFB05jL3MrkGgZWPyiirA.png"
          alt="ZYRØCORE brown hoodie detail"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-background/90 via-background/50 to-transparent flex items-center justify-end">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-2xl ml-auto">
              <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <p className="text-xs uppercase tracking-widest text-accent mb-4 font-semibold">
                  Premium Collection
                </p>
              </div>
              <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <h2 className="text-6xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
                  Timeless Hoodie.
                </h2>
              </div>
              <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                  The foundation of your wardrobe. Premium 340 GSM cotton. Tone-on-tone embroidery. Built for ambitious.
                </p>
              </div>
              <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                  <Link href="/products" className="flex items-center gap-2">
                    Shop Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
