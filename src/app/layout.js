import './globals.scss'
import { Inter } from 'next/font/google'

// improt header and fotoer
import Navigation from './components/Navigation/Navigation'
import Footer from './components/Footer/Footer'

import PageWrapper from './components/PageWrapper/PageWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Jordi Garreta',
  description: 'Creative developer',
}

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {/* <PageWrapper> */}
          {children}
        {/* </PageWrapper> */}
        <Footer />
      </body>
    </html>
  )
}
