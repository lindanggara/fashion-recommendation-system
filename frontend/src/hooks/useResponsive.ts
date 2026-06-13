import { useState, useEffect } from 'react'

export const breakpoints = { mobile: 640, tablet: 768, laptop: 1024, desktop: 1280, wide: 1536 }

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < breakpoints.tablet,
    isTablet: windowSize.width >= breakpoints.tablet && windowSize.width < breakpoints.laptop,
    isDesktop: windowSize.width >= breakpoints.laptop,
    breakpoint: windowSize.width < breakpoints.mobile ? 'mobile' : windowSize.width < breakpoints.tablet ? 'tablet' : windowSize.width < breakpoints.laptop ? 'laptop' : windowSize.width < breakpoints.desktop ? 'desktop' : 'wide'
  }
}
