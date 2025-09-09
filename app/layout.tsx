import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Container from './components/Container'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="py-6">
          <Container>
            {children}
          </Container>
        </main>
        <Footer />
      </body>
    </html>
  )
}
