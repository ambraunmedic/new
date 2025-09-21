import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import appleTouchIconUrl from '@/assets/brand/favicon/apple-touch-icon.png'
import favicon16Url from '@/assets/brand/favicon/favicon-16x16.png'
import favicon32Url from '@/assets/brand/favicon/favicon-32x32.png'
import { PostHogProvider } from 'posthog-js/react'
import './index.css'

function upsertLink(attrs: Record<string, string>) {
  const selectorAttrs = Object.entries(attrs).filter(([key]) => key !== 'href')
  const selector = 'link' + selectorAttrs.map(([key, value]) => `[${key}="${value}"]`).join('')
  const existing = document.head.querySelector<HTMLLinkElement>(selector)
  if (existing) {
    if (attrs.href) existing.href = attrs.href
    return existing
  }
  const link = document.createElement('link')
  Object.entries(attrs).forEach(([k, v]) => link.setAttribute(k, v))
  document.head.appendChild(link)
  return link
}

// Inject brand favicons
upsertLink({ rel: 'icon', type: 'image/png', sizes: '32x32', href: favicon32Url })
upsertLink({ rel: 'icon', type: 'image/png', sizes: '16x16', href: favicon16Url })
upsertLink({ rel: 'apple-touch-icon', sizes: '180x180', href: appleTouchIconUrl })

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

createRoot(rootElement).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: '2025-05-24',
        capture_exceptions: true,
        debug: false, // Disabled console logging
        disable_session_recording: import.meta.env.MODE === 'development',
      }}
    >
      <App />
    </PostHogProvider>
  </StrictMode>,
)
