import React from 'react'
import { merge } from 'next/css'
import buttonStyles from '../common/styles/button'

export default ({ css, children, ...rest }) => (
  <button
    {...rest}
    className={merge(buttonStyles.button, css)}
  >
    {children}
  </button>
)
