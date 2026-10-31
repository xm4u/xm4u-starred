import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages cannot set custom HTTP response headers. This CSP is injected
// into production HTML only, leaving Vite's dev-server/HMR behavior untouched.
// Inline styles are used by Radix (including injected style tags) and category colors.
const contentSecurityPolicy = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "style-src-elem 'self' 'unsafe-inline'",
  "style-src-attr 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "frame-src 'none'",
  "upgrade-insecure-requests",
].join('; ')

export default defineConfig({
  base: '/xm4u-starred/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'initial-theme',
      // Inject after Vite's HTML processing so a synchronous public script is
      // not treated as a bundled module; it runs before the React entrypoint.
      transformIndexHtml: {
        order: 'post' as const,
        handler(html: string) {
          return html.replace(
            '</title>',
            '</title>\n    <script src="/xm4u-starred/theme-init.js"></script>',
          )
        },
      },
    },
    {
      name: 'production-csp',
      apply: 'build',
      transformIndexHtml(html: string) {
        if (!html.includes('<meta charset="UTF-8" />')) {
          throw new Error('CSP injection requires the charset meta tag')
        }
        return html.replace(
          '<meta charset="UTF-8" />',
          '<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="' + contentSecurityPolicy + '" />',
        )
      },
    },
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[/](@?react|react-dom|scheduler)[/]/, priority: 20 },
            { name: 'ui-vendor', test: /node_modules[/](radix-ui|@radix-ui)[/]/, priority: 10 },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
