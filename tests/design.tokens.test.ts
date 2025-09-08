import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

describe('design tokens and theme wiring', () => {
  it('defines required CSS variables in globals.css', () => {
    const css = readFileSync(join(root, 'app', 'globals.css'), 'utf8')
    // Core tokens
    expect(css).toMatch(/--background:/)
    expect(css).toMatch(/--foreground:/)
    expect(css).toMatch(/--border:/)
    expect(css).toMatch(/\.dark\s*\{/)
  })

  it('Tailwind maps tokens via hsl(var(--token))', () => {
    const cfg = readFileSync(join(root, 'tailwind.config.ts'), 'utf8')
    expect(cfg).toMatch(/background:\s*'hsl\(var\(--background\)\)'/)
    expect(cfg).toMatch(/primary:\s*'hsl\(var\(--primary\)\)'/)
  })

  it('does not accidentally include unknown tokens', () => {
    const css = readFileSync(join(root, 'app', 'globals.css'), 'utf8')
    expect(css.includes('--nonexistent-token')).toBe(false)
  })
})

