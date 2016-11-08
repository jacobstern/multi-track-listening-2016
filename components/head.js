import React from 'react'
import Head from 'next/head'

export default ({ title }) => (
  <Head>
    <title>{title}</title>
    <meta charset='UTF-8' />
    <meta name='viewport' content='initial-scale=1.0, width=device-width' />
    <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Cousine' />
    <link rel='stylesheet' type='text/css' href='https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css' />
    <style>
      {
        `body {
          font-family: Cousine, Courier New, monospace, serif;
        }`
      }
    </style>
  </Head>
)
