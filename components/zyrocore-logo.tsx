'use client'

interface LogoProps {
  className?: string
  showTagline?: boolean
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  invertInDark?: boolean
}

export default function ZyrocoreLogo({ className = '', showTagline = false, iconOnly = false, size = 'md', invertInDark = true }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* ZYRØCORE Emblem Image */}
      <img
        src="/logo-emblem.png"
        alt="ZYRØCORE Emblem"
        className={`${iconSizes[size]} flex-shrink-0 object-contain ${invertInDark ? 'dark:invert' : ''}`}
      />

      {!iconOnly && (
        <div className="flex flex-col">
          <span className={`font-black tracking-wider uppercase font-mono ${textSizes[size]} text-foreground leading-none`}>
            ZYR<span className="inline-block relative">Ø</span>CORE
          </span>
          {showTagline && (
            <span className="text-[10px] tracking-[0.25em] font-semibold text-muted-foreground uppercase mt-1">
              Built for Ambitious
            </span>
          )}
        </div>
      )}
    </div>
  )
}
