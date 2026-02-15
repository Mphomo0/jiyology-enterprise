'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'
import { FacebookIcon } from '@/components/ui/facebook'
import { InstagramIcon } from '@/components/ui/instagram'
import { LinkedinIcon } from '@/components/ui/linkedin'

const footerLinks = {
  services: [
    { name: 'Cleaning & Maintenance', path: '/services#cleaning' },
    { name: 'Plumbing Services', path: '/services#plumbing' },
    { name: 'Construction', path: '/services#construction' },
    { name: 'Office Supplies', path: '/services#supplies' },
  ],
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'Our Team', path: '/about#team' },
    { name: 'Careers', path: '/careers' },
    { name: 'Contact', path: '/contact' },
  ],
  support: [
    { name: 'FAQ', path: '/faq' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Support Center', path: '/support' },
  ],
}

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: FacebookIcon,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: InstagramIcon,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: LinkedinIcon,
  },
]

export default function Footer() {
  return (
    <footer className='bg-foreground text-background'>
      <div className='container mx-auto px-4 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12'>
          {/* Brand */}
          <div className='lg:col-span-2'>
            <Link href='/' className='flex items-center gap-2 mb-6'>
              <div className='w-10 h-10 rounded-xl bg-primary flex items-center justify-center'>
                <span className='text-primary-foreground font-bold text-lg'>
                  PS
                </span>
              </div>
              <span className='font-display font-bold text-xl'>ProServe</span>
            </Link>

            <p className='text-background/70 mb-6 max-w-sm'>
              Your trusted partner for all professional services. From cleaning
              to construction, we deliver excellence every time.
            </p>

            <div className='flex gap-4'>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className='w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors'
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className='font-semibold text-lg mb-4'>Services</h4>
            <ul className='space-y-3'>
              {footerLinks.services.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className='text-background/70 hover:text-primary transition-colors text-sm'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className='font-semibold text-lg mb-4'>Company</h4>
            <ul className='space-y-3'>
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className='text-background/70 hover:text-primary transition-colors text-sm'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className='font-semibold text-lg mb-4'>Contact</h4>
            <ul className='space-y-3'>
              <li className='flex items-center gap-3 text-sm text-background/70'>
                <Phone size={16} className='text-primary' />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className='flex items-center gap-3 text-sm text-background/70'>
                <Mail size={16} className='text-primary' />
                <span>info@proserve.com</span>
              </li>
              <li className='flex items-start gap-3 text-sm text-background/70'>
                <MapPin size={16} className='text-primary mt-0.5' />
                <span>
                  123 Business Ave, Suite 100
                  <br />
                  New York, NY 10001
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className='border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-sm text-background/50'>
            © {new Date().getFullYear()} ProServe. All rights reserved.
          </p>
          <div className='flex gap-6'>
            {footerLinks.support.slice(1, 3).map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className='text-sm text-background/50 hover:text-primary transition-colors'
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
