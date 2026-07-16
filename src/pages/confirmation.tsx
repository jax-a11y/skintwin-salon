import React from 'react'
import { Link } from 'gatsby'
import { Layout } from '../components'
import { useBooking } from '../context/booking-context'
import Services from '../data/services.json'

import '../components/Confirmation/confirmation.scss'

const ConfirmationPage = () => {
  const { services, appointment, client, checkout, resetBooking } = useBooking()
  const serviceById = React.useMemo(
    () => new Map(Services.map((service) => [service.id, service])),
    []
  )

  const selectedServices = (services || [])
    .map((selection) => {
      const details = serviceById.get(selection.serviceId)
      if (!details) return null
      return { ...details, quantity: selection.quantity }
    })
    .filter(
      (service): service is (typeof Services)[number] & { quantity: number } => service !== null
    )

  // Calculate total duration and price
  const totalDuration = selectedServices.reduce((sum, service) => {
    return sum + ((service.durationMinutes || 0) + (service.bufferMinutes || 0)) * service.quantity
  }, 0)

  const totalPrice = selectedServices.reduce(
    (sum, service) => sum + service.price * service.quantity,
    0
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not scheduled'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleNewBooking = () => {
    resetBooking()
  }

  const appointmentDetails = appointment || { date: '', startTime: '', endTime: '', providerId: '' }
  const clientDetails = client || { firstName: '', lastName: '', email: '', phone: '' }
  const clientName =
    clientDetails.firstName || clientDetails.lastName
      ? `${clientDetails.firstName} ${clientDetails.lastName}`.trim()
      : 'Not provided'

  return (
    <Layout pageTitle="Booking Confirmed">
      <main className="confirmation" role="main" aria-labelledby="confirmation-heading">
        <div className="confirmation__header">
          <div className="confirmation__icon" aria-hidden="true">
            ✓
          </div>
          <h1 id="confirmation-heading" className="confirmation__title">
            Booking Confirmed!
          </h1>
          <p className="confirmation__subtitle">
            Your appointment has been successfully booked. We&apos;ve sent a confirmation to your
            email.
          </p>
        </div>

        <div className="confirmation__details">
          <section className="confirmation__section" aria-labelledby="appointment-details">
            <h2 id="appointment-details" className="confirmation__section-title">
              Appointment Details
            </h2>

            <dl className="confirmation__list">
              <div className="confirmation__item">
                <dt>Confirmation Number</dt>
                <dd data-testid="confirmation-number">
                  {checkout.invoiceId || `APT-${Date.now()}`}
                </dd>
              </div>

              <div className="confirmation__item">
                <dt>Date</dt>
                <dd data-testid="confirmation-date">{formatDate(appointmentDetails.date)}</dd>
              </div>

              <div className="confirmation__item">
                <dt>Time</dt>
                <dd data-testid="confirmation-time">
                  {appointmentDetails.startTime || 'Not scheduled'} -{' '}
                  {appointmentDetails.endTime || ''}
                </dd>
              </div>

              {appointmentDetails.providerId && (
                <div className="confirmation__item">
                  <dt>Provider</dt>
                  <dd data-testid="confirmation-provider">{appointmentDetails.providerId}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="confirmation__section" aria-labelledby="services-heading">
            <h2 id="services-heading" className="confirmation__section-title">
              Services
            </h2>

            <ul className="confirmation__services" data-testid="confirmation-services">
              {selectedServices.map((service) => (
                <li key={service.id} className="confirmation__service">
                  <span className="confirmation__service-name">
                    {service.name}
                    {service.quantity > 1 && ` (x${service.quantity})`}
                  </span>
                  <span className="confirmation__service-details">
                    {service.durationMinutes} min •{' '}
                    {formatCurrency(service.price * service.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            {selectedServices.length === 0 && (
              <p role="status" aria-live="polite">
                No services selected.
              </p>
            )}

            <div className="confirmation__totals">
              <div className="confirmation__total-row">
                <span>Total Duration</span>
                <span data-testid="confirmation-duration">{totalDuration} minutes</span>
              </div>
              <div className="confirmation__total-row confirmation__total-row--final">
                <span>Total Paid</span>
                <span data-testid="confirmation-total">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </section>

          <section className="confirmation__section" aria-labelledby="client-heading">
            <h2 id="client-heading" className="confirmation__section-title">
              Client Information
            </h2>

            <dl className="confirmation__list">
              <div className="confirmation__item">
                <dt>Name</dt>
                <dd data-testid="confirmation-client-name">{clientName}</dd>
              </div>

              <div className="confirmation__item">
                <dt>Email</dt>
                <dd data-testid="confirmation-email">{clientDetails.email || 'Not provided'}</dd>
              </div>

              <div className="confirmation__item">
                <dt>Phone</dt>
                <dd data-testid="confirmation-phone">{clientDetails.phone || 'Not provided'}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="confirmation__actions">
          <button
            type="button"
            className="confirmation__action confirmation__action--secondary"
            onClick={() => window.print()}
          >
            Print Receipt
          </button>

          <Link
            to="/"
            className="confirmation__action confirmation__action--primary"
            onClick={handleNewBooking}
            data-testid="new-booking-button"
          >
            Book Another Appointment
          </Link>
        </div>

        <div className="confirmation__info">
          <h3>Important Information</h3>
          <ul>
            <li>Please arrive 10 minutes before your scheduled appointment time.</li>
            <li>
              If you need to reschedule or cancel, please contact us at least 24 hours in advance.
            </li>
            <li>
              A confirmation email has been sent to{' '}
              {clientDetails.email || 'the email address you provided during booking'}.
            </li>
          </ul>
        </div>
      </main>
    </Layout>
  )
}

export default ConfirmationPage

export const Head = () => <title>Booking Confirmed | SkinTwin Salon</title>
