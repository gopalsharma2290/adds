import { cn } from '@/lib/utils'

type Soft3DIconVariant =
  | 'home'
  | 'data'
  | 'stack'
  | 'sort'
  | 'code'
  | 'python'
  | 'chart'
  | 'motion'
  | 'database'
  | 'type'

type Soft3DIconProps = {
  variant: Soft3DIconVariant
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

const palettes: Record<Soft3DIconVariant, { base: string; glow: string; detail: string }> = {
  home: {
    base: 'from-[#fff8ea] via-[#ecd8c5] to-[#c8d8dd]',
    glow: 'shadow-[0_14px_28px_rgba(148,121,93,0.2)]',
    detail: 'bg-slate-950/55',
  },
  data: {
    base: 'from-[#f1e8ff] via-[#c9b7ff] to-[#8f6df1]',
    glow: 'shadow-[0_14px_30px_rgba(124,58,237,0.22)]',
    detail: 'bg-white/80',
  },
  stack: {
    base: 'from-[#fff2cf] via-[#efc784] to-[#d89a40]',
    glow: 'shadow-[0_14px_30px_rgba(180,111,31,0.2)]',
    detail: 'bg-white/85',
  },
  sort: {
    base: 'from-[#d8fff2] via-[#77dfc1] to-[#1ca579]',
    glow: 'shadow-[0_14px_30px_rgba(16,185,129,0.2)]',
    detail: 'bg-white/85',
  },
  code: {
    base: 'from-[#e9f2ff] via-[#aecaef] to-[#668dcb]',
    glow: 'shadow-[0_14px_30px_rgba(96,135,190,0.2)]',
    detail: 'bg-white/82',
  },
  python: {
    base: 'from-[#fff3c4] via-[#91d7c6] to-[#5b83d6]',
    glow: 'shadow-[0_14px_30px_rgba(83,128,191,0.2)]',
    detail: 'bg-white/85',
  },
  chart: {
    base: 'from-[#f0e7ff] via-[#d5c6ff] to-[#89b7f6]',
    glow: 'shadow-[0_14px_30px_rgba(112,92,180,0.18)]',
    detail: 'bg-white/82',
  },
  motion: {
    base: 'from-[#ffe3d9] via-[#f0b4a6] to-[#c8d7f6]',
    glow: 'shadow-[0_14px_30px_rgba(210,137,126,0.18)]',
    detail: 'bg-white/85',
  },
  database: {
    base: 'from-[#e8f5ed] via-[#b6d8c2] to-[#7ca98f]',
    glow: 'shadow-[0_14px_30px_rgba(91,128,101,0.18)]',
    detail: 'bg-white/82',
  },
  type: {
    base: 'from-[#f8e8d8] via-[#e9c5a6] to-[#aabed8]',
    glow: 'shadow-[0_14px_30px_rgba(162,126,90,0.18)]',
    detail: 'bg-white/85',
  },
}

export function Soft3DIcon({ variant, size = 'md', className }: Soft3DIconProps) {
  const palette = palettes[variant]

  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br',
        'before:absolute before:inset-x-[18%] before:top-[14%] before:h-[18%] before:rounded-full before:bg-white/50 before:blur-[1px]',
        'after:absolute after:inset-x-[18%] after:bottom-[12%] after:h-[16%] after:rounded-full after:bg-slate-950/10 after:blur-[2px]',
        sizeClasses[size],
        palette.base,
        palette.glow,
        className
      )}
    >
      {variant === 'data' && (
        <span className="relative z-10 flex h-7 w-8 items-end justify-center gap-1">
          <span className={cn('h-3 w-1.5 rounded-full', palette.detail)} />
          <span className={cn('h-5 w-1.5 rounded-full', palette.detail)} />
          <span className={cn('h-7 w-1.5 rounded-full', palette.detail)} />
        </span>
      )}
      {variant === 'stack' && (
        <span className="relative z-10 flex flex-col gap-1">
          {[0, 1, 2].map(item => (
            <span key={item} className={cn('h-1.5 w-8 rounded-full', palette.detail)} />
          ))}
        </span>
      )}
      {variant === 'sort' && (
        <span className="relative z-10 flex h-8 w-8 items-center justify-center">
          <span className={cn('absolute h-1.5 w-7 rotate-45 rounded-full', palette.detail)} />
          <span className={cn('absolute h-1.5 w-7 -rotate-45 rounded-full', palette.detail)} />
        </span>
      )}
      {variant === 'home' && (
        <span className="relative z-10 flex h-7 w-8 flex-col items-center justify-end">
          <span className={cn('h-4 w-6 rounded-t-lg', palette.detail)} />
          <span className={cn('h-1.5 w-8 rounded-full', palette.detail)} />
        </span>
      )}
      {variant === 'code' && (
        <span className="relative z-10 flex w-8 items-center justify-between">
          <span className={cn('h-5 w-1.5 -rotate-12 rounded-full', palette.detail)} />
          <span className={cn('h-7 w-1.5 rotate-12 rounded-full', palette.detail)} />
          <span className={cn('h-5 w-1.5 -rotate-12 rounded-full', palette.detail)} />
        </span>
      )}
      {variant === 'python' && (
        <span className="relative z-10 grid h-8 w-8 grid-cols-2 gap-1">
          <span className={cn('rounded-lg rounded-br-sm', palette.detail)} />
          <span className={cn('rounded-lg rounded-bl-sm', palette.detail)} />
          <span className={cn('rounded-lg rounded-tr-sm', palette.detail)} />
          <span className={cn('rounded-lg rounded-tl-sm', palette.detail)} />
        </span>
      )}
      {variant === 'chart' && (
        <span className="relative z-10 h-8 w-8">
          <span className={cn('absolute bottom-1 left-1 h-3 w-3 rounded-full', palette.detail)} />
          <span className={cn('absolute right-1 top-1 h-5 w-5 rounded-full border-[6px] border-white/80 bg-transparent')} />
        </span>
      )}
      {variant === 'motion' && (
        <span className="relative z-10 h-8 w-8">
          <span className={cn('absolute left-1 top-2 h-3 w-3 rounded-full', palette.detail)} />
          <span className={cn('absolute right-1 top-1 h-4 w-4 rounded-full', palette.detail)} />
          <span className={cn('absolute bottom-1 left-3 h-3 w-3 rounded-full', palette.detail)} />
        </span>
      )}
      {variant === 'database' && (
        <span className="relative z-10 flex flex-col items-center">
          <span className={cn('h-2.5 w-8 rounded-[50%]', palette.detail)} />
          <span className={cn('-mt-1 h-4 w-8 rounded-b-lg', palette.detail)} />
        </span>
      )}
      {variant === 'type' && (
        <span className={cn('relative z-10 text-xl font-black leading-none text-white/90')}>T</span>
      )}
    </span>
  )
}
