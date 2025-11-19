import './globals.css'

export const metadata = {
  title: 'PromptHub - AI Prompt Organizer',
  description: 'Organize and search your AI prompts efficiently',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
