import React, { useEffect, useState, useContext } from 'react'
import Pusher from 'pusher-js'

import { CartContext } from '../context/cart-context'
import { Layout, Basket, Receipt } from '../components'

import Services from '../data/services.json'
import '../styles/global.scss'
import '../components/Cart/cart.scss'

const Cart = () => {
  const [event, setEvent] = useState('Not Paid')
  const [products, setProducts] = useState([])
  const [invoiceId, setInvoiceId] = useState(null)
  const context = useContext(CartContext)

  useEffect(() => {
    const PusherClient = typeof window !== 'undefined' && window.Pusher ? window.Pusher : Pusher

    const pusher = new PusherClient(process.env.GATSBY_PUSHER_KEY || 'test-key', {
      cluster: 'eu',
    })

    const channel = pusher.subscribe('my-channel')
    channel.bind('my-event', function (data) {
      if (data.event === 'paymentrequest.pending') {
        setEvent('Pending')
      }

      if (data.event === 'paymentrequest.success') {
        setEvent('Paid')
      }

      if (data.event === 'paymentrequest.failed') {
        setEvent('Failed')
      }
    })

    const handlePusherEvent = (e) => {
      const { event: eventType } = e.detail || {}
      if (eventType === 'paymentrequest.pending') setEvent('Pending')
      if (eventType === 'paymentrequest.success') setEvent('Paid')
      if (eventType === 'paymentrequest.failed') setEvent('Failed')
    }

    window.addEventListener('pusher:payment-event', handlePusherEvent)
    window.addEventListener('pusher:payment', handlePusherEvent)

    return () => {
      pusher.disconnect()
      window.removeEventListener('pusher:payment-event', handlePusherEvent)
      window.removeEventListener('pusher:payment', handlePusherEvent)
    }
  }, [])

  useEffect(() => {
    const ids = context?.productIds || []
    setProducts(fetchServices(ids))
  }, [context?.productIds])

  const fetchServices = (ids) => {
    return Services.filter((service) => ids.includes(service.id))
  }

  const handleRetry = () => {
    setEvent('Not Paid')
  }

  return (
    <Layout pageTitle="Cart">
      <div className="cart" data-testid="booking-summary">
        <h1 className="cart__header">Your Cart</h1>
        {event === 'Paid' ? (
          <>
            <div data-testid="payment-status-success" style={{ display: 'none' }} />
            <Receipt invoiceId={invoiceId} />
          </>
        ) : event === 'Failed' ? (
          <div className="cart__failed">
            <div
              data-testid="payment-status-failed"
              className="cart__payment-status cart__payment-status--failed"
            >
              <p>Payment failed or was declined. Please try again.</p>
            </div>
            <button
              data-testid="retry-payment-button"
              className="cart__retry-btn"
              onClick={handleRetry}
            >
              Retry Payment
            </button>
            <div className="cart__items">
              <Basket
                products={products}
                status={event}
                onInvoiceCreated={(id) => setInvoiceId(id)}
              />
            </div>
          </div>
        ) : (
          <div className="cart__content">
            <span className="pill" data-testid="payment-status">
              {event}
            </span>
            {event === 'Pending' && (
              <div
                data-testid="payment-status-pending"
                className="cart__payment-status cart__payment-status--pending"
              >
                Kindly complete your payment on the Terminal
              </div>
            )}
            <div className="cart__items">
              <Basket
                products={products}
                status={event}
                onInvoiceCreated={(id) => setInvoiceId(id)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Cart
