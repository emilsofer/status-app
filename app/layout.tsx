import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Team Status',
  description: 'Live team status board',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
