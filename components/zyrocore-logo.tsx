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
      {/* High-DPI Vector SVG Emblem for crisp Retina rendering across all devices & themes */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes[size]} flex-shrink-0 text-foreground transition-colors duration-200`}
        aria-hidden="true"
      >
        {/* Geometric Oval Cut Ring */}
        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="12" />
        {/* Bold Diagonal Cut line */}
        <path
          d="M22 22 L78 78"
          stroke="currentColor"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Inner Z Accents */}
        <path
          d="M32 32 H68 L32 68 H68"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
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
