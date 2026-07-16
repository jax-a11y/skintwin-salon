import React, { useContext, useState } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'

import { BookingContext } from '../../context/booking-context'
import Services from '../../data/services.json'
import './service-card.scss'

interface Service {
  id: string
  name: string
  category: string
  description: string
  durationMinutes: number
  bufferMinutes: number
  price: number
  currency: string
  providerTypes: string[]
  requiresConsultation: boolean
  addOns: string[]
  image: string
}

interface ServiceCardProps {
  category?: string
  showDescription?: boolean
}

const CATEGORIES = ['facials', 'treatments', 'consultations', 'packages', 'add-ons']

const ServiceCard: React.FC<ServiceCardProps> = ({ category, showDescription = false }) => {
  const context = useContext(BookingContext)
  const [activeCategory, setActiveCategory] = useState<string>(category || 'all')

  const data = useStaticQuery(graphql`
    query {
      allFile(filter: { extension: { regex: "/(jpg)|(png)|(jpeg)/" } }) {
        edges {
          node {
            base
            childImageSharp {
              gatsbyImageData(placeholder: BLURRED, formats: [AUTO, WEBP, AVIF])
            }
          }
        }
      }
    }
  `)

  const filterImage = (path: string) => {
    const image = data.allFile.edges.find(
      (edge: { node: { base: string } }) => edge.node.base === path
    )
    return image ? getImage(image.node) : null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      facials: 'Facials',
      treatments: 'Treatments',
      consultations: 'Consultations',
      packages: 'Packages',
      'add-ons': 'Add-Ons',
    }
    return labels[cat] || cat
  }

  const getCategoryCount = (cat: string) => {
    return Services.filter((s: Service) => s.category === cat).length
  }

  const currentCategory = category || activeCategory

  const filteredServices =
    currentCategory === 'all'
      ? Services
      : Services.filter((service: Service) => service.category === currentCategory)

  return (
    <div>
      {!category && (
        <div className="category-filters" data-testid="category-filter">
          <button
            className={`category-filters__button${currentCategory === 'all' ? ' category-filters__button--active active' : ''}`}
            data-testid="category-all"
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-filters__button${currentCategory === cat ? ' category-filters__button--active active' : ''}`}
              data-testid={`category-${cat}`}
              onClick={() => setActiveCategory(cat)}
            >
              {getCategoryLabel(cat)}
              {getCategoryCount(cat) > 0 && (
                <span
                  className="category-filters__count"
                  data-testid={`category-${cat}-count`}
                >
                  {getCategoryCount(cat)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="service-container">
        {filteredServices.map((service: Service) => {
          const image = filterImage(service.image)

          return (
            <div
              key={service.id}
              className="service"
              data-testid={`service-${service.id}`}
              data-category={service.category}
            >
              {image && <GatsbyImage image={image} alt={service.name} className="service__image" />}

              <div className="service__content">
                <span className="service__category">{getCategoryLabel(service.category)}</span>
                <h2 className="service__title" data-testid="service-name">
                  {service.name}
                </h2>

                {showDescription && <p className="service__description">{service.description}</p>}

                <div className="service-meta">
                  <span className="service-meta__price" data-testid="service-price">
                    {formatCurrency(service.price)}
                  </span>
                  <span className="service-meta__duration" data-testid="service-duration">
                    {formatDuration(service.durationMinutes)}
                  </span>
                </div>

                {service.requiresConsultation && (
                  <span className="service__consultation-badge">Consultation Required</span>
                )}

                <div className="service__actions">
                  <button
                    className="service__add-btn"
                    data-testid={`add-service-${service.id}`}
                    onClick={() => context?.addService(service.id)}
                    aria-label={`Add ${service.name} to booking`}
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 1v14M1 8h14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>Add to Booking</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ServiceCard
