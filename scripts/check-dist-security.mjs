import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1]
assert.ok(csp, 'production HTML must declare a CSP')
assert.match(csp, /script-src 'self'/, 'scripts must be restricted to same origin')
assert.doesNotMatch(csp, /script-src[^;]*unsafe-inline/, 'inline scripts must be blocked')
assert.match(csp, /object-src 'none'/)
assert.match(csp, /base-uri 'self'/)
assert.match(csp, /connect-src 'self'/)
assert.match(html, /<script src="\/xm4u-starred\/theme-init.js"><\/script>/)
assert.doesNotMatch(html, /<script(?:\s[^>]*)?>(?!\s*<\/script>)[\s\S]*?<\/script>/)
await stat(new URL('../dist/theme-init.js', import.meta.url))
console.log('Production CSP and external initialization script verified.')
