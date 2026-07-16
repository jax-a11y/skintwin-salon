import * as React from 'react'
import { Layout, ServiceCard } from '../components'

import '../styles/global.scss'

const IndexPage = () => {
  return (
    <Layout pageTitle="Services">
      <h1 className="page-title">Our Services</h1>
      <ServiceCard />
    </Layout>
  )
}

export default IndexPage
