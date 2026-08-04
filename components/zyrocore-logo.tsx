'use client'

interface LogoProps {
  className?: string
  showTagline?: boolean
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  invertInDark?: boolean
}

export default function ZyrocoreLogo({
  className = '',
  showTagline = false,
  iconOnly = false,
  size = 'md',
  invertInDark = true,
}: LogoProps) {
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
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Modern geometric logo - bold Z with circle */}
      <svg
        viewBox="0 0 512 512"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes[size]} flex-shrink-0 transition-colors duration-200`}
        aria-hidden="true"
      >
        {/* Outer circle segments */}
        <path d="M 100 120 A 150 150 0 0 1 180 70 L 210 50 A 180 180 0 0 0 80 100 Z" fill="currentColor" />
        <path d="M 330 70 A 150 150 0 0 1 410 120 L 420 90 A 180 180 0 0 0 300 50 Z" fill="currentColor" />
        <path d="M 410 390 A 150 150 0 0 1 330 440 L 300 460 A 180 180 0 0 0 440 420 Z" fill="currentColor" />
        <path d="M 180 440 A 150 150 0 0 1 100 390 L 80 420 A 180 180 0 0 0 210 460 Z" fill="currentColor" />
        
        {/* Top horizontal bar */}
        <rect x="120" y="140" width="270" height="60" fill="currentColor" />
        
        {/* Main diagonal slash */}
        <polygon points="180,220 340,220 180,420 140,420" fill="currentColor" />
        <polygon points="340,220 380,220 220,420 180,420" fill="currentColor" />
        
        {/* Bottom horizontal bar */}
        <rect x="120" y="310" width="270" height="60" fill="currentColor" />
      </svg>

      {!iconOnly && (
        <div className="flex flex-col">
          <span
            className={`font-black tracking-wider uppercase font-mono ${textSizes[size]} text-foreground leading-none`}
          >
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
