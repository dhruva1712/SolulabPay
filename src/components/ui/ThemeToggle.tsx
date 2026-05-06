'use client'

import { useEffect, useState, useRef } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Read initial state from html class (set by the inline script)
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = async () => {
    const next = !isDark

    // Get the button's position for the radial origin
    const button = buttonRef.current
    const rect = button?.getBoundingClientRect()
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2

    // Calculate the max radius needed to cover the entire screen from this point
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const applyTheme = () => {
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
      setIsDark(next)
    }

    // Check for View Transitions API support
    if (!document.startViewTransition) {
      // Fallback: apply directly (instant, as before)
      applyTheme()
      return
    }

    // Use View Transitions API for the radial wipe
    const transition = document.startViewTransition(() => {
      applyTheme()
    })

    // Wait for the pseudo-elements to be created
    await transition.ready

    // Animate: clip-path circle from button position outward
    const clipPathStart = `circle(0px at ${x}px ${y}px)`
    const clipPathEnd = `circle(${radius}px at ${x}px ${y}px)`

    document.documentElement.animate(
      {
        clipPath: [clipPathStart, clipPathEnd],
      },
      {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    )
  }

  return (
    <button
      ref={buttonRef}
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 flex items-center justify-center rounded-sm
        text-ink-muted hover:text-ink hover:bg-ink/5
        transition-colors duration-150
        focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--focus-ring)]"
    >
      {isDark
        ? <Sun size={14} aria-hidden="true" />
        : <Moon size={14} aria-hidden="true" />}
    </button>
  )
}
