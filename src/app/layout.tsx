// Root layout - minimal pass-through since [locale]/layout.tsx handles the actual layout with i18n
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
