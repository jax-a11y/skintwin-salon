import React, { useState, useContext, useEffect } from 'react'
import { navigate } from 'gatsby'

import { BookingContext } from '../context/booking-context'
import { Layout } from '../components'

import '../styles/global.scss'
import '../components/Intake/intake.scss'

interface ClientData {
  firstName: string
  lastName: string
  email: string
  phone: string
  previousVisits?: number
}

const SIMULATED_CLIENTS: ClientData[] = [
  {
    firstName: 'Adaeze',
    lastName: 'Obi',
    email: 'adaeze.obi@example.com',
    phone: '+2348012345678',
    previousVisits: 3,
  },
]

const IntakePage: React.FC = () => {
  const context = useContext(BookingContext)

  const [activeTab, setActiveTab] = useState<'new' | 'returning'>('new')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    consentAccepted: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [lookupEmail, setLookupEmail] = useState('')
  const [lookupPhone, setLookupPhone] = useState('')
  const [clientFound, setClientFound] = useState<ClientData | null>(null)
  const [lookupNotFound, setLookupNotFound] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        navigate('/cart')
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [submitted])

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePhone = (phone: string) => {
    return /^\+?[\d\s-]{10,}$/.test(phone)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleLookup = async () => {
    const emailToSearch = lookupEmail.trim()
    const phoneToSearch = lookupPhone.trim()

    if (!emailToSearch && !phoneToSearch) {
      setErrors({ lookup: 'Please enter an email or phone number' })
      return
    }

    if (emailToSearch && !validateEmail(emailToSearch)) {
      setErrors({ lookup: 'Please enter a valid email address' })
      return
    }

    setIsLookingUp(true)
    setErrors({})
    setLookupNotFound(false)
    setClientFound(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const found = SIMULATED_CLIENTS.find(
        (c) =>
          (emailToSearch && c.email === emailToSearch) ||
          (phoneToSearch && c.phone === phoneToSearch)
      )

      if (found) {
        setClientFound(found)
        setLookupNotFound(false)
      } else {
        setClientFound(null)
        setLookupNotFound(true)
      }
    } catch {
      setErrors({ lookup: 'Error looking up client' })
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleUseClient = (client: ClientData) => {
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      consentAccepted: true,
    })
    setActiveTab('new')
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.consentAccepted) {
      newErrors.consent = 'You must accept the consent to continue'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    context?.setClient({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      consentAccepted: formData.consentAccepted,
      intakeCompleted: true,
    })

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Layout pageTitle="Client Information">
        <div className="intake">
          <div className="intake__success" data-testid="client-saved-message">
            ✓ Your information has been saved. Redirecting to checkout...
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout pageTitle="Client Information">
      <div className="intake">
        <h1 className="intake__title">Client Information</h1>

        <div className="intake__tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'new'}
            className={`intake__tab${activeTab === 'new' ? ' intake__tab--active' : ''}`}
            data-testid="new-client-tab"
            onClick={() => setActiveTab('new')}
          >
            New Client
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'returning'}
            className={`intake__tab${activeTab === 'returning' ? ' intake__tab--active' : ''}`}
            data-testid="returning-client-tab"
            onClick={() => setActiveTab('returning')}
          >
            Returning Client
          </button>
        </div>

        {activeTab === 'returning' && (
          <section className="intake__section" aria-label="Returning client lookup">
            <h2>Find Your Profile</h2>
            <p>Enter your email or phone number to find your existing profile</p>
            <div className="intake__lookup">
              <input
                type="email"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                placeholder="Email address"
                data-testid="lookup-email"
                aria-label="Lookup email"
              />
              <input
                type="tel"
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                placeholder="Phone number (e.g. +2348012345678)"
                data-testid="lookup-phone"
                aria-label="Lookup phone"
              />
              <button
                type="button"
                onClick={handleLookup}
                disabled={isLookingUp}
                data-testid="lookup-button"
              >
                {isLookingUp ? 'Looking up...' : 'Look Up'}
              </button>
            </div>
            {errors.lookup && (
              <span className="intake__error" data-testid="error-lookup">
                {errors.lookup}
              </span>
            )}
            {lookupNotFound && (
              <div className="intake__not-found" data-testid="client-not-found-message">
                Client not found. Please register as a new client.
              </div>
            )}
            {clientFound && (
              <div className="intake__found" data-testid="client-found-message">
                <p>
                  ✓ Welcome back, {clientFound.firstName} {clientFound.lastName}!
                </p>
                {clientFound.previousVisits !== undefined && (
                  <p data-testid="previous-visits">Previous visits: {clientFound.previousVisits}</p>
                )}
                <button
                  type="button"
                  data-testid="use-client-button"
                  onClick={() => handleUseClient(clientFound)}
                  className="intake__use-client"
                >
                  Use This Profile
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === 'new' && (
          <form onSubmit={handleSubmit} className="intake__form" data-testid="client-form">
            <div className="intake__row">
              <div className="intake__field">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  data-testid="first-name"
                />
                {errors.firstName && (
                  <span
                    className="intake__error"
                    data-error-for="firstName"
                    data-testid="error-firstName"
                  >
                    {errors.firstName}
                  </span>
                )}
              </div>

              <div className="intake__field">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  data-testid="last-name"
                />
                {errors.lastName && (
                  <span
                    className="intake__error"
                    data-error-for="lastName"
                    data-testid="error-lastName"
                  >
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>

            <div className="intake__row">
              <div className="intake__field">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  data-testid="email"
                />
                {errors.email && (
                  <span className="intake__error" data-error-for="email" data-testid="error-email">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="intake__field">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+234..."
                  data-testid="phone"
                />
                {errors.phone && (
                  <span className="intake__error" data-error-for="phone" data-testid="error-phone">
                    {errors.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="intake__consent">
              <label className="intake__checkbox">
                <input
                  type="checkbox"
                  name="consentAccepted"
                  checked={formData.consentAccepted}
                  onChange={handleInputChange}
                  data-testid="consent-checkbox"
                />
                <span>
                  I consent to receive treatment and understand the salon policies. I confirm that
                  all information provided is accurate. *
                </span>
              </label>
              {errors.consent && (
                <span
                  className="intake__error"
                  data-error-for="consent"
                  data-testid="error-consent"
                >
                  {errors.consent}
                </span>
              )}
            </div>

            <div className="intake__actions">
              <button
                type="button"
                className="intake__back"
                onClick={() => navigate('/booking')}
                data-testid="back-to-booking"
              >
                Back to Scheduling
              </button>
              <button type="submit" className="intake__continue" data-testid="continue-to-checkout">
                Continue to Checkout
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  )
}

export default IntakePage
