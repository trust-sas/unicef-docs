import { useEffect, useState } from 'react'

import { BREAKPOINTS } from '@/lib/utils'

type BreakpointValueType = keyof typeof BREAKPOINTS
type BreakpointType = (typeof BREAKPOINTS)[BreakpointValueType]

export function useBreakpoint() {
  const [breakpoint, setBreakPoint] = useState<BreakpointType>('xs')
  const [windowSize, setWindowSize] = useState<{ width?: number; height?: number }>({
    width: undefined,
    height: undefined,
  })

  const handleResize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    handleResize()

    if (!windowSize.width) {
      return
    }

    if (0 < windowSize.width && windowSize.width < 640) {
      setBreakPoint(BREAKPOINTS[0])
    }
    if (640 < windowSize.width && windowSize.width < 768) {
      setBreakPoint(BREAKPOINTS[640])
    }
    if (768 < windowSize.width && windowSize.width < 1024) {
      setBreakPoint(BREAKPOINTS[768])
    }
    if (1024 < windowSize.width && windowSize.width < 1280) {
      setBreakPoint(BREAKPOINTS[1024])
    }
    if (1280 < windowSize.width && windowSize.width < 1536) {
      setBreakPoint(BREAKPOINTS[1280])
    }
    if (windowSize.width >= 1536) {
      setBreakPoint(BREAKPOINTS[1536])
    }

    return () => window.removeEventListener('resize', handleResize)
  }, [windowSize.width])

  return breakpoint
}
