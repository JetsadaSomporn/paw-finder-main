import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('combines conditional classes', () => {
    expect(cn('a', null, undefined, 'b')).toBe('a b')
  })
})
