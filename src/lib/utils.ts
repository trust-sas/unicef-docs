import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
)

export const BREAKPOINTS = {
  0: 'xs',
  640: 'sm',
  768: 'md',
  1024: 'lg',
  1280: 'xl',
  1536: '2xl',
} as const
