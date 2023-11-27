import type { Metadata } from 'next'
/* import { Inter } from 'next/font/google'
 */
/* const inter = Inter({ subsets: ['latin'] }) */
import './globals.css'

export const metadata: Metadata = {
  title: 'Accout Abstraction Wallet App',
  description: 'Account Abstraction Social Login App with Safe SDK' ,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body >{children}</body>
    </html>
  )
}
