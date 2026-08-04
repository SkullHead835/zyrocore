'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function StorySection() {
  const [isVisible, setIsVisible] = useState(false)
  const [parallaxOffset, setParallaxOffset] = useState(0)
  const [scrollVisibility, setScrollVisibility] = useState({
    journey: false,
    philosophy: false,
    craftsmanship: false,
    hoodie: false,
  })
  const sectionRef = useRef<HTMLDivElement>(null)
  const journeyRef = useRef<HTMLDivElement>(null)
  const philosophyRef = useRef<HTMLDivElement>(null)
  const craftsmanshipRef = useRef<HTMLDivElement>(null)
  const hoodieRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setParallaxOffset(scrollY * 0.5)

      // Intersection Observer for scroll-triggered animations
      const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px',
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target === journeyRef.current && entry.isIntersecting) {
            setScrollVisibility((prev) => ({ ...prev, journey: true }))
          }
          if (entry.target === philosophyRef.current && entry.isIntersecting) {
            setScrollVisibility((prev) => ({ ...prev, philosophy: true }))
          }
          if (entry.target === craftsmanshipRef.current && entry.isIntersecting) {
            setScrollVisibility((prev) => ({ ...prev, craftsmanship: true }))
          }
          if (entry.target === hoodieRef.current && entry.isIntersecting) {
            setScrollVisibility((prev) => ({ ...prev, hoodie: true }))
          }
        })
      }, observerOptions)

      if (journeyRef.current) observer.observe(journeyRef.current)
      if (philosophyRef.current) observer.observe(philosophyRef.current)
      if (craftsmanshipRef.current) observer.observe(craftsmanshipRef.current)
      if (hoodieRef.current) observer.observe(hoodieRef.current)

      return () => observer.disconnect()
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="bg-background py-0" ref={sectionRef}>
      {/* First: Mountain Road Journey - Full Width with Overlay */}
      <div 
        ref={journeyRef}
        className={`relative w-full aspect-video md:aspect-auto md:h-screen overflow-hidden transition-all duration-1200 cubic-bezier(0.34, 1.56, 0.64, 1) ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          style={{ transform: `translateY(${parallaxOffset * 0.3}px)` }}
          className="absolute inset-0 transition-transform duration-100"
        >
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%204%2C%202026%2C%2006_09_47%20PM-3oooqJkYvF6ZjQ3BH1XsS1abUxjvgU.png"
            alt="Ambitious journey on mountain road"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-2xl">
              <div className={`transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                <p className="text-xs uppercase tracking-widest text-accent mb-4 font-semibold drop-shadow-lg">
                  Our Journey
                </p>
              </div>
              <div className={`transition-all duration-1000 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`} style={{ transitionDelay: '100ms' }}>
                <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 leading-tight drop-shadow-lg">
                  Built from Tamil Nadu. Built in Public.
                </h1>
              </div>
              <div className={`transition-all duration-1000 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed drop-shadow-md">
                  A middle class dream turned into a mission. Building a global brand, one step at a time.
                </p>
              </div>
              <div className={`transition-all duration-1000 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105" asChild>
                  <Link href="/products" className="flex items-center gap-2">
                    Explore Our Collection
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second: Minimalist Showroom Philosophy */}
      <div ref={philosophyRef} className="grid md:grid-cols-2 gap-0 min-h-screen md:min-h-auto">
        <div className="relative aspect-square md:aspect-auto md:min-h-screen flex items-center justify-center order-2 md:order-1 overflow-hidden">
          <div className={`absolute inset-0 transition-transform duration-1200 ease-out ${scrollVisibility.philosophy ? 'scale-100' : 'scale-110'}`}>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1000566637.png-TLRgYaZUZssSukm7SuHvezQPpprjj2.jpeg"
              alt="ZYRØCORE minimalist lifestyle showroom"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="bg-secondary/50 flex items-center p-6 md:p-12 lg:p-16 order-1 md:order-2">
          <div className="max-w-md w-full">
            <div className={`transform transition-all duration-700 ease-out ${scrollVisibility.philosophy ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <p className="text-xs uppercase tracking-widest text-accent mb-4 font-semibold">
                The Philosophy
              </p>
            </div>
            <div className={`transform transition-all duration-800 ease-out ${scrollVisibility.philosophy ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '100ms' }}>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Timeless Design.
              </h2>
            </div>
            <div className={`transform transition-all duration-800 ease-out ${scrollVisibility.philosophy ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
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
                  className={`flex items-start gap-4 transform transition-all duration-700 ease-out group cursor-pointer hover:translate-x-2 ${
                    scrollVisibility.philosophy ? 'translate-x-0 opacity-100' : 'translate-x-[-30px] opacity-0'
                  }`}
                  style={{ transitionDelay: `${300 + i * 100}ms` }}
                >
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-accent/40 transition-colors duration-300">
                    <div className="w-2 h-2 rounded-full bg-accent group-hover:scale-125 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-accent transition-colors duration-300">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Third: Craftsmanship Detail */}
      <div ref={craftsmanshipRef} className="grid md:grid-cols-2 gap-0 min-h-screen md:min-h-auto">
        <div className="bg-card flex items-center p-6 md:p-12 lg:p-16 order-2 md:order-1">
          <div className="max-w-md w-full">
            <div className={`transform transition-all duration-700 ease-out ${scrollVisibility.craftsmanship ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <p className="text-xs uppercase tracking-widest text-accent mb-4 font-semibold">
                Craftsmanship
              </p>
            </div>
            <div className={`transform transition-all duration-800 ease-out ${scrollVisibility.craftsmanship ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '100ms' }}>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Built to Last.
              </h2>
            </div>
            <div className={`transform transition-all duration-800 ease-out ${scrollVisibility.craftsmanship ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Tone-on-tone embroidery. Oversized fit. Premium construction. Every detail matters. Every stitch counts. This is what separates ambitious from ordinary.
              </p>
            </div>
            <div className={`transform transition-all duration-800 ease-out ${scrollVisibility.craftsmanship ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105" asChild>
                <Link href="/products" className="flex items-center gap-2">
                  Explore Collection
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative aspect-square md:aspect-auto md:min-h-screen flex items-center justify-center order-1 md:order-2 overflow-hidden">
          <div className={`absolute inset-0 transition-transform duration-1200 ease-out ${scrollVisibility.craftsmanship ? 'scale-100' : 'scale-110'}`}>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%204%2C%202026%2C%2006_02_50%20PM-xKPpux39mxyPnN7UtMGxh9jI2KSND4.png"
              alt="ZYRØCORE embroidery detail craftsmanship"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Fourth: Premium Collection Hoodie */}
      <div 
        ref={hoodieRef}
        className={`relative w-full aspect-video md:aspect-auto md:h-screen overflow-hidden flex items-center transition-all duration-1200 ease-out ${
          scrollVisibility.hoodie ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          style={{ transform: `translateY(${parallaxOffset * 0.4}px)` }}
          className="absolute inset-0 transition-transform duration-100"
        >
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%204%2C%202026%2C%2005_08_16%20PM-BiZnDdD00gFB05jL3MrkGgZWPyiirA.png"
            alt="ZYRØCORE brown hoodie detail"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-l from-background/95 via-background/60 to-transparent flex items-center justify-end">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-2xl ml-auto">
              <div className={`transition-all duration-700 ease-out ${scrollVisibility.hoodie ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                <p className="text-xs uppercase tracking-widest text-accent mb-4 font-semibold drop-shadow-lg">
                  Premium Collection
                </p>
              </div>
              <div className={`transition-all duration-1000 ease-out ${scrollVisibility.hoodie ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`} style={{ transitionDelay: '100ms' }}>
                <h2 className="text-6xl md:text-7xl font-bold text-foreground mb-6 leading-tight drop-shadow-lg">
                  Timeless Hoodie.
                </h2>
              </div>
              <div className={`transition-all duration-1000 ease-out ${scrollVisibility.hoodie ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed drop-shadow-md">
                  The foundation of your wardrobe. Premium 340 GSM cotton. Tone-on-tone embroidery. Built for ambitious.
                </p>
              </div>
              <div className={`transition-all duration-1000 ease-out ${scrollVisibility.hoodie ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105" asChild>
                  <Link href="/products" className="flex items-center gap-2">
                    Shop Now
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
