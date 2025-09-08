import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
