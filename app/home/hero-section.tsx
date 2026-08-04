'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const slides = [
  {
    title: 'New Season Edit',
    subtitle: 'Discover fresh, performance-driven styles for men — from casual wear to sharp formals.',
    cta: 'Shop Collection',
    href: '/products?category=casuals',
    bg: 'bg-foreground',
    text: 'text-background',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=80',
  },
  {
    title: 'Men\'s Formals',
    subtitle: 'Stop following trends, be Timeless.',
    cta: 'Shop Formals',
    href: '/products?category=formals',
    bg: 'bg-secondary',
    text: 'text-foreground',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1200&q=80',
  },
  {
    title: 'Party & Evening Wear',
    subtitle: 'Make a bold statement in premium men\'s jackets, blazers and celebration outfits.',
    cta: 'Shop Party Wear',
    href: '/products?category=party-wear',
    bg: 'bg-foreground',
    text: 'text-background',
    image: 'https://www.mydesignation.com/cdn/shop/files/green-panel-409122.jpg?v=1735912357&width=750',
  },
]

export default function HeroSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = slides[current]

  return (
    <section className={`relative overflow-hidden ${slide.bg} transition-colors duration-500`}>
      <div className="absolute inset-0">
        <img
          src={slide.image}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-current/80 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32 flex items-center">
        <div className="max-w-xl">
          <p className={`text-sm font-semibold uppercase tracking-widest mb-3 ${slide.text} opacity-60`}>
            ZYRØCORE — Built for Ambitious
          </p>
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 text-balance leading-tight ${slide.text}`}>
            {slide.title}
          </h1>
          <p className={`text-lg md:text-xl mb-8 ${slide.text} opacity-70 leading-relaxed`}>
            {slide.subtitle}
          </p>
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              variant={slide.bg === 'bg-foreground' ? 'secondary' : 'default'}
              asChild
            >
              <Link href={slide.href} className="flex items-center gap-2">
                {slide.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className={slide.bg === 'bg-foreground' ? 'border-background/30 text-background hover:bg-background/10 bg-transparent' : ''}
            >
              <Link href="/products">Browse All</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            suppressHydrationWarning
            className={`rounded-full transition-all duration-200 ${i === current
                ? 'w-6 h-2 bg-background/80'
                : 'w-2 h-2 bg-background/40 hover:bg-background/60'
              }`}
          />
        ))}
      </div>
      <button
        onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
        aria-label="Previous slide"
        suppressHydrationWarning
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/20 hover:bg-background/40 flex items-center justify-center transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-background" />
      </button>
      <button
        onClick={() => setCurrent(c => (c + 1) % slides.length)}
        aria-label="Next slide"
        suppressHydrationWarning
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/20 hover:bg-background/40 flex items-center justify-center transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-background" />
      </button>
    </section>
  )
}
