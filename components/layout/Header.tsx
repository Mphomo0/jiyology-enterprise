'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const navLinkClass = (isActive: boolean) =>
    `relative px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? isScrolled
          ? 'text-black bg-black/10'
          : 'text-white bg-white/20'
        : isScrolled
          ? 'text-black hover:text-black/80 hover:bg-black/10'
          : 'text-white hover:text-white/80 hover:bg-white/10'
    }`

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-border shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className='container mx-auto px-4 flex items-center justify-between'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-2'>
          <div className='w-10 h-10 rounded-lg bg-primary flex items-center justify-center'>
            <span className='text-primary-foreground font-bold text-lg'>
              PS
            </span>
          </div>
          <span
            className={`font-bold text-xl transition-colors ${
              isScrolled ? 'text-black' : 'text-white'
            }`}
          >
            ProServe
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className='hidden lg:flex items-center gap-1'>
          {navLinks.map((link) => {
            const isActive = pathname === link.path
            return (
              <Link
                key={link.path}
                href={link.path}
                className={navLinkClass(isActive)}
              >
                {link.name}
                {isActive && (
                  <span
                    className={`absolute left-1/2 -bottom-0.5 -translate-x-1/2 h-0.5 w-6 rounded-full ${
                      isScrolled ? 'bg-primary' : 'bg-primary'
                    }`}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Button (Get Quote) */}
        <div className='hidden lg:flex items-center gap-3'>
          <Button
            size='sm'
            className={`${
              !isScrolled
                ? 'bg-white/20 text-white hover:bg-white/30 px-6 py-5' // highlighted like active nav link before scroll
                : 'bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-5' // primary style after scroll
            } transition-colors`}
          >
            Get Quote
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`lg:hidden p-2 rounded-md transition-colors ${
            isScrolled
              ? 'text-black hover:bg-black/10'
              : 'text-white hover:bg-white/10'
          }`}
          aria-label='Toggle menu'
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`lg:hidden ${
              isScrolled ? 'bg-white/95' : 'bg-transparent'
            } backdrop-blur-md border-t border-border`}
          >
            <nav className='container mx-auto px-4 py-4 flex flex-col gap-1'>
              {navLinks.map((link) => {
                const isActive = pathname === link.path
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? isScrolled
                          ? 'text-black bg-black/10'
                          : 'text-white bg-white/20'
                        : isScrolled
                          ? 'text-black hover:text-black/80 hover:bg-black/10'
                          : 'text-white hover:text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}

              {/* Mobile Get Quote Button */}
              <div className='flex flex-col gap-2 mt-4 pt-4 border-t border-border'>
                <Button
                  size='sm'
                  className={`w-full transition-colors ${
                    !isScrolled
                      ? 'bg-white/20 text-white hover:bg-white/30 px-6 py-3'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3'
                  }`}
                >
                  Get Quote
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
