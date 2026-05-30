'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Hero from '@/components/home/Hero'
import Navbar from '@/components/home/NavBar'
import Features from '@/components/home/Features'
import HowItWorks from '@/components/home/HowItWorks'
import Pricing from '@/components/home/Pricing'
import Testimonials from '@/components/home/Testimonials'
import CTA from '@/components/home/CTA'
import Contact from '@/components/home/Contact'
import { Footer } from 'react-day-picker'

export default function Home() {
  const router = useRouter()

  // useEffect(() => {
  //   router.push('/dashboard')
  // }, [router])

  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTA />
      <Contact />
      <Footer />
    </main>
  )
}
