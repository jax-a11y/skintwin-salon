import '@testing-library/jest-dom'
import { vi, beforeAll, afterAll } from 'vitest'

interface GatsbyLinkProps {
  activeClassName?: string
  activeStyle?: Record<string, unknown>
  getProps?: (props: unknown) => unknown
  innerRef?: unknown
  partiallyActive?: boolean
  ref?: unknown
  replace?: boolean
  to: string
  [key: string]: unknown
}

// Mock Gatsby's navigate function
vi.mock('gatsby', async () => {
  const { createElement } = await import('react')
  const gatsby = await vi.importActual<typeof import('gatsby')>('gatsby')

  return {
    ...(gatsby as object),
    graphql: vi.fn(),
    Link: vi
      .fn()
      .mockImplementation(
        ({
          activeClassName: _activeClassName,
          activeStyle: _activeStyle,
          getProps: _getProps,
          innerRef: _innerRef,
          partiallyActive: _partiallyActive,
          ref: _ref,
          replace: _replace,
          to,
          ...rest
        }: GatsbyLinkProps) =>
          createElement('a', {
            ...(rest as Record<string, unknown>),
            href: to,
          })
      ),
    StaticQuery: vi.fn(),
    useStaticQuery: vi.fn(),
    navigate: vi.fn(),
  }
})

// Mock Pusher
vi.mock('pusher-js', () => ({
  default: vi.fn().mockImplementation(() => ({
    subscribe: vi.fn().mockReturnValue({
      bind: vi.fn(),
      unbind: vi.fn(),
    }),
    unsubscribe: vi.fn(),
    disconnect: vi.fn(),
  })),
}))

// Mock environment variables
process.env.GATSBY_PUSHER_KEY = 'test-pusher-key'
process.env.GATSBY_BASE_API = 'https://api.paystack.co'
process.env.GATSBY_AUTH_KEY = 'test-auth-key'
process.env.GATSBY_TERMINAL_ID = 'test-terminal-id'

// Suppress console errors in tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
