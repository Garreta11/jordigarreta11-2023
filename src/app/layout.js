import './globals.scss'
import { Inter } from 'next/font/google'

// improt header and footer
import Nav from './components/Nav/Nav'
import Navigation from './components/Navigation/Navigation'
import Footer from './components/Footer/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Jordi Garreta',
  description: 'Creative developer',
}

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <Nav />
        {/* <Navigation /> */}
          {children}
        {/* <Footer /> */}
      </body>
    </html>
  )
}
