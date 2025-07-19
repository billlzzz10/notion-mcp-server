import '../styles/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export default function App({ Component, pageProps }) {
  return (
    <div className={`${inter.className} thai-text`}>
      <Component {...pageProps} />
    </div>
  )
}
