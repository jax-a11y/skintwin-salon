import React, { useEffect, useContext } from 'react'
import { Link } from 'gatsby'
import { CartContext } from '../../context/cart-context'

const Receipt = ({ invoiceId }) => {
  const { resetCart } = useContext(CartContext)

  useEffect(() => {
    resetCart()
  }, [resetCart])

  const confirmationNumber = invoiceId || `APT-${Date.now()}`

  return (
    <div className="success-prompt">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
        <circle
          fill="none"
          stroke="#146428"
          strokeWidth="6"
          strokeMiterlimit="10"
          cx="65.1"
          cy="65.1"
          r="62.1"
          className="circle"
        ></circle>
        <polyline
          fill="none"
          stroke="#146428"
          strokeWidth="6"
          strokeLinecap="round"
          strokeMiterlimit="10"
          points="100.2,40.2 51.5,88.8 29.8,67.5 "
        ></polyline>
      </svg>
      <h1>Payment Confirmed! 🚀</h1>
      <p>Your booking is confirmed. Kindly head over to the counter.</p>
      <p>Receipt: Your booking receipt has been noted.</p>
      <p data-testid="confirmation-number">Confirmation Number: {confirmationNumber}</p>
      <Link to="/">Go Home</Link>
    </div>
  )
}

export default Receipt
