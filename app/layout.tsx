import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'WaselGo',
  description: 'WaselGo is a delivery tracking system that allows users to track their packages in real-time. With WaselGo, you can easily monitor the status of your deliveries and receive notifications when your package is on its way or has been delivered.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logo/logodark .png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo/logodark .png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logo/logodark .png',
        type: 'image/png',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
