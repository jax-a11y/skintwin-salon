import React from 'react'
import BookingContextProvider from './src/context/booking-context'

export const wrapRootElement = BookingContextProvider

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <link key="google-fonts-preconnect" rel="preconnect" href="https://fonts.googleapis.com" />,
    <link
      key="google-fonts-preconnect-gstatic"
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />,
    <link
      key="google-fonts"
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap"
    />,
  ])
}
