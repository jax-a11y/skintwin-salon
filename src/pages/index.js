import * as React from 'react'
import { Link } from 'gatsby'
import { Layout, ServiceCard } from '../components'

import '../styles/global.scss'

const IndexPage = () => {
  return (
    <Layout pageTitle="Services">
      <h1 className="page-title">Our Services</h1>
      <ServiceCard />
      <div className="booking-cta">
        <Link to="/booking" className="booking-cta__btn" data-testid="proceed-to-booking">
          Proceed to Booking
        </Link>
      </div>
    </Layout>
  )
}

export default IndexPage
