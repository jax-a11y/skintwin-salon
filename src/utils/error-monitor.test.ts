import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Production-mode tests (NODE_ENV = 'test', isDevelopment = false) ──────────

describe('ErrorMonitor – production / non-development mode', () => {
  let errorMonitor: typeof import('./error-monitor').errorMonitor
  let captureError: typeof import('./error-monitor').captureError
  let captureMessage: typeof import('./error-monitor').captureMessage
  let setUser: typeof import('./error-monitor').setUser
  let addBreadcrumb: typeof import('./error-monitor').addBreadcrumb

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('./error-monitor')
    errorMonitor = mod.errorMonitor
    captureError = mod.captureError
    captureMessage = mod.captureMessage
    setUser = mod.setUser
    addBreadcrumb = mod.addBreadcrumb
  })

  it('init should return early when no Sentry DSN is configured', () => {
    expect(() => errorMonitor.init()).not.toThrow()
  })

  it('init should return early when already initialized', () => {
    errorMonitor.init()
    expect(() => errorMonitor.init()).not.toThrow()
  })

  it('captureError should not throw in production mode', () => {
    expect(() => errorMonitor.captureError(new Error('boom'))).not.toThrow()
  })

  it('captureError should not throw when context is provided', () => {
    expect(() =>
      errorMonitor.captureError(new Error('boom'), {
        user: { id: 'u1', email: 'a@b.com' },
        tags: { env: 'prod' },
        extra: { detail: 'extra info' },
      })
    ).not.toThrow()
  })

  it('captureMessage should not throw in production mode', () => {
    expect(() => errorMonitor.captureMessage('hello')).not.toThrow()
    expect(() => errorMonitor.captureMessage('warn', 'warning')).not.toThrow()
    expect(() => errorMonitor.captureMessage('err', 'error')).not.toThrow()
  })

  it('setUser should not throw in production mode', () => {
    expect(() => errorMonitor.setUser({ id: 'u1', email: 'a@b.com', name: 'Alice' })).not.toThrow()
    expect(() => errorMonitor.setUser(null)).not.toThrow()
  })

  it('addBreadcrumb should not throw in production mode', () => {
    expect(() =>
      errorMonitor.addBreadcrumb({ category: 'nav', message: 'page loaded', level: 'info' })
    ).not.toThrow()
  })

  it('startTransaction should return an object with finish and setTag in production mode', () => {
    const tx = errorMonitor.startTransaction('test-tx', 'pageload')
    expect(tx).toBeDefined()
    expect(typeof tx!.finish).toBe('function')
    expect(typeof tx!.setTag).toBe('function')
    expect(() => tx!.finish()).not.toThrow()
    expect(() => tx!.setTag('key', 'value')).not.toThrow()
  })

  it('wrapAsync should resolve with the function result', async () => {
    const result = await errorMonitor.wrapAsync(() => Promise.resolve(42))
    expect(result).toBe(42)
  })

  it('wrapAsync should re-throw errors after capturing', async () => {
    const err = new Error('async fail')
    await expect(errorMonitor.wrapAsync(() => Promise.reject(err))).rejects.toThrow('async fail')
  })

  it('wrapAsync should accept an optional context string', async () => {
    await expect(
      errorMonitor.wrapAsync(() => Promise.reject(new Error('ctx err')), 'myContext')
    ).rejects.toThrow('ctx err')
  })

  it('exported captureError convenience function should not throw', () => {
    expect(() => captureError(new Error('test'))).not.toThrow()
  })

  it('exported captureMessage convenience function should not throw', () => {
    expect(() => captureMessage('test message')).not.toThrow()
  })

  it('exported setUser convenience function should not throw', () => {
    expect(() => setUser({ id: 'u2' })).not.toThrow()
  })

  it('exported addBreadcrumb convenience function should not throw', () => {
    expect(() => addBreadcrumb({ category: 'ui', message: 'clicked button' })).not.toThrow()
  })
})

// ─── Development-mode tests (NODE_ENV = 'development', isDevelopment = true) ──

describe('ErrorMonitor – development mode', () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    vi.resetModules()
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    vi.resetModules()
  })

  it('init should log when no Sentry DSN is configured', async () => {
    delete process.env.GATSBY_SENTRY_DSN
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { errorMonitor: devMonitor } = await import('./error-monitor')
    devMonitor.init()
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Sentry DSN not configured'))
    consoleSpy.mockRestore()
  })

  it('captureError should log to console in development mode', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { errorMonitor: devMonitor } = await import('./error-monitor')
    const err = new Error('dev error')
    devMonitor.captureError(err)
    expect(consoleSpy).toHaveBeenCalledWith('[ErrorMonitor] Error captured:', err)
    consoleSpy.mockRestore()
  })

  it('captureError should log context when provided in development mode', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { errorMonitor: devMonitor } = await import('./error-monitor')
    const ctx = { tags: { env: 'dev' } }
    devMonitor.captureError(new Error('with ctx'), ctx)
    expect(consoleSpy).toHaveBeenCalledWith('[ErrorMonitor] Context:', ctx)
    consoleSpy.mockRestore()
  })

  it('captureMessage should log to console in development mode', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { errorMonitor: devMonitor } = await import('./error-monitor')
    devMonitor.captureMessage('hello dev', 'warning')
    expect(consoleSpy).toHaveBeenCalledWith('[ErrorMonitor] WARNING: hello dev')
    consoleSpy.mockRestore()
  })

  it('setUser should log to console in development mode', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { errorMonitor: devMonitor } = await import('./error-monitor')
    const user = { id: 'u1', email: 'dev@test.com' }
    devMonitor.setUser(user)
    expect(consoleSpy).toHaveBeenCalledWith('[ErrorMonitor] User set:', user)
    consoleSpy.mockRestore()
  })

  it('addBreadcrumb should log to console in development mode', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { errorMonitor: devMonitor } = await import('./error-monitor')
    devMonitor.addBreadcrumb({ category: 'nav', message: 'navigated' })
    expect(consoleSpy).toHaveBeenCalledWith('[ErrorMonitor] Breadcrumb: nav - navigated')
    consoleSpy.mockRestore()
  })

  it('startTransaction should log and return object with finish/setTag in development mode', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { errorMonitor: devMonitor } = await import('./error-monitor')
    const tx = devMonitor.startTransaction('dev-tx', 'navigation')
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Transaction started: dev-tx'))
    expect(typeof tx!.finish).toBe('function')
    expect(typeof tx!.setTag).toBe('function')
    tx!.finish()
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Transaction finished: dev-tx'))
    tx!.setTag('key', 'val')
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Transaction tag: key=val'))
    consoleSpy.mockRestore()
  })
})
