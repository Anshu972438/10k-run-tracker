import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MapsErrorBoundary from './MapsErrorBoundary'

function BrokenMap() {
  throw new Error('InvalidKeyMapError')
}

describe('MapsErrorBoundary', () => {
  it('shows the fallback instead of crashing when a child throws', () => {
    // React logs caught render errors to the console; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MapsErrorBoundary fallback={<p>The map could not load.</p>}>
        <BrokenMap />
      </MapsErrorBoundary>,
    )

    expect(screen.getByText('The map could not load.')).toBeInTheDocument()
  })
})
