'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const slides = [
  {
    title: 'Stop Following The Trend.',
    subtitle: 'Be Timeless.',
    cta: 'Explore Collection',
    href: '/products?category=premium-collection',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product2-MrjpbiVDhc1Nnt7rEHuFQpWG0mjnmu.png',
  },
  {
    title: 'Built For Ambitious.',
    subtitle: 'Built Different.',
    cta: 'Shop All',
    href: '/products',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product1-8hkDsCe2Wte7KzSRmuKPEWEhHiVKHd.png',
  },
]

export default function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = slides[current]

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen md:min-h-[80vh]">
        {/* Left: Text content */}
        <div className="relative flex items-center justify-center md:justify-start md:items-center p-6 md:p-12 lg:p-16">
          <div className="max-w-md">
            <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-6 text-accent">
                ZYRØCORE Collection
              </p>
            </div>
            <div className={`transition-all duration-1000 delay-150 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight text-foreground">
                {slide.title}
              </h1>
            </div>
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <p className="text-lg md:text-xl mb-10 text-muted-foreground leading-relaxed">
                {slide.subtitle}
              </p>
            </div>
            <div className={`flex items-center gap-4 transition-all duration-1000 delay-450 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                asChild
              >
                <Link href={slide.href} className="flex items-center gap-2">
                  {slide.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Product image */}
        <div className={`relative hidden md:flex items-center justify-center p-8 lg:p-12 transition-all duration-1000 delay-200 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={slide.image}
              alt="Featured product"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            suppressHydrationWarning
            className={`rounded-full transition-all duration-300 ${i === current
                ? 'w-8 h-2 bg-accent'
                : 'w-2 h-2 bg-muted hover:bg-muted-foreground'
              }`}
          />
        ))}
      </div>
    </section>
  )
}
