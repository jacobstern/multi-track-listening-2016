import React from 'react'
import css, { merge } from 'next/css'

export default ({ css, ...rest }) => (
  <input
    {...rest}
    className={merge(styles.root, css)}
  />
)

const styles = {
  root: css({
    width: '150px',
    border: '1px solid #666',
    borderRadius: '0',
    fontFamily: 'Cousine, Courier New, monospace, serif',
    ':disabled': {
      backgroundColor: 'rgba(0,0,0,0.05)',
      opacity: '0.7'
    }
  })
}
