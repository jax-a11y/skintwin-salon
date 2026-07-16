import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Default / test-environment tests ─────────────────────────────────────────

describe('featureFlags – default state (NODE_ENV = test)', () => {
  let featureFlags: typeof import('./feature-flags').featureFlags
  let isFeatureEnabled: typeof import('./feature-flags').isFeatureEnabled
  let useFeatureFlag: typeof import('./feature-flags').useFeatureFlag

  beforeEach(async () => {
    localStorage.clear()
    vi.resetModules()
    const mod = await import('./feature-flags')
    featureFlags = mod.featureFlags
    isFeatureEnabled = mod.isFeatureEnabled
    useFeatureFlag = mod.useFeatureFlag
  })

  it('getAll should return an object with all expected flag keys', () => {
    const flags = featureFlags.getAll()
    expect(flags).toHaveProperty('newBookingFlow')
    expect(flags).toHaveProperty('providerSelection')
    expect(flags).toHaveProperty('intakeForm')
    expect(flags).toHaveProperty('realTimeAvailability')
    expect(flags).toHaveProperty('skintwinRecommendations')
    expect(flags).toHaveProperty('multiServiceBooking')
    expect(flags).toHaveProperty('rescheduling')
    expect(flags).toHaveProperty('cancellation')
    expect(flags).toHaveProperty('pusherRealtime')
    expect(flags).toHaveProperty('visualRegression')
  })

  it('getAll should return the correct default flag values', () => {
    const flags = featureFlags.getAll()
    expect(flags.newBookingFlow).toBe(true)
    expect(flags.providerSelection).toBe(true)
    expect(flags.intakeForm).toBe(true)
    expect(flags.multiServiceBooking).toBe(true)
    expect(flags.pusherRealtime).toBe(true)
    expect(flags.realTimeAvailability).toBe(false)
    expect(flags.skintwinRecommendations).toBe(false)
    expect(flags.rescheduling).toBe(false)
    expect(flags.cancellation).toBe(false)
    expect(flags.visualRegression).toBe(false)
  })

  it('getAll should return a copy, not the internal reference', () => {
    const flags1 = featureFlags.getAll()
    const flags2 = featureFlags.getAll()
    expect(flags1).not.toBe(flags2)
    expect(flags1).toEqual(flags2)
  })

  it('isEnabled should return true for an enabled flag', () => {
    expect(featureFlags.isEnabled('newBookingFlow')).toBe(true)
  })

  it('isEnabled should return false for a disabled flag', () => {
    expect(featureFlags.isEnabled('realTimeAvailability')).toBe(false)
  })

  it('setFlag should update the flag value', () => {
    featureFlags.setFlag('cancellation', true)
    expect(featureFlags.isEnabled('cancellation')).toBe(true)
  })

  it('setFlag should persist the value to localStorage', () => {
    featureFlags.setFlag('rescheduling', true)
    const stored = JSON.parse(localStorage.getItem('skintwin_feature_flags') || '{}')
    expect(stored.rescheduling).toBe(true)
  })

  it('setFlag should merge with existing localStorage values', () => {
    featureFlags.setFlag('cancellation', true)
    featureFlags.setFlag('rescheduling', true)
    const stored = JSON.parse(localStorage.getItem('skintwin_feature_flags') || '{}')
    expect(stored.cancellation).toBe(true)
    expect(stored.rescheduling).toBe(true)
  })

  it('reset should remove localStorage overrides and restore defaults', () => {
    featureFlags.setFlag('cancellation', true)
    expect(featureFlags.isEnabled('cancellation')).toBe(true)
    featureFlags.reset()
    expect(featureFlags.isEnabled('cancellation')).toBe(false)
    expect(localStorage.getItem('skintwin_feature_flags')).toBeNull()
  })

  it('isFeatureEnabled convenience function should delegate to the singleton', () => {
    expect(isFeatureEnabled('newBookingFlow')).toBe(true)
    expect(isFeatureEnabled('realTimeAvailability')).toBe(false)
  })

  it('useFeatureFlag hook should return the flag value', () => {
    expect(useFeatureFlag('newBookingFlow')).toBe(true)
    expect(useFeatureFlag('cancellation')).toBe(false)
  })
})

// ─── Development environment overrides ────────────────────────────────────────

describe('featureFlags – development environment overrides', () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    localStorage.clear()
    process.env.NODE_ENV = 'development'
    vi.resetModules()
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    localStorage.clear()
    vi.resetModules()
  })

  it('should apply development overrides for feature flags', async () => {
    const { featureFlags: devFlags } = await import('./feature-flags')
    expect(devFlags.isEnabled('realTimeAvailability')).toBe(true)
    expect(devFlags.isEnabled('skintwinRecommendations')).toBe(true)
    expect(devFlags.isEnabled('rescheduling')).toBe(true)
    expect(devFlags.isEnabled('cancellation')).toBe(true)
    expect(devFlags.isEnabled('visualRegression')).toBe(true)
  })

  it('should apply localStorage overrides on top of dev defaults', async () => {
    localStorage.setItem('skintwin_feature_flags', JSON.stringify({ newBookingFlow: false }))
    const { featureFlags: devFlags } = await import('./feature-flags')
    expect(devFlags.isEnabled('newBookingFlow')).toBe(false)
  })

  it('setFlag should warn and return in production mode', async () => {
    process.env.NODE_ENV = 'production'
    vi.resetModules()
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { featureFlags: prodFlags } = await import('./feature-flags')
    prodFlags.setFlag('cancellation', true)
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Cannot override feature flags in production')
    )
    expect(prodFlags.isEnabled('cancellation')).toBe(false)
    consoleSpy.mockRestore()
  })
})

// ─── URL parameter overrides ───────────────────────────────────────────────────

describe('featureFlags – URL parameter overrides', () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    localStorage.clear()
    vi.resetModules()
    // Restore location
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/'),
      writable: true,
      configurable: true,
    })
  })

  it('should override flags via URL search parameters', async () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/?ff_realTimeAvailability=true&ff_cancellation=1'),
      writable: true,
      configurable: true,
    })
    vi.resetModules()
    const { featureFlags: urlFlags } = await import('./feature-flags')
    expect(urlFlags.isEnabled('realTimeAvailability')).toBe(true)
    expect(urlFlags.isEnabled('cancellation')).toBe(true)
  })

  it('should treat ff_* = false as disabled', async () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/?ff_newBookingFlow=false'),
      writable: true,
      configurable: true,
    })
    vi.resetModules()
    const { featureFlags: urlFlags } = await import('./feature-flags')
    expect(urlFlags.isEnabled('newBookingFlow')).toBe(false)
  })
})
