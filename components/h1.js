import React from 'react'
import css, { merge } from 'next/css'

export default ({ css, children, ...other }) => (
  <h1
    {...other}
    className={merge(styles.root, css)}
  >
    {children}
  </h1>
)

const styles = {
  root: css({
    margin: '24px 0',
    maxWidth: '600px',
    fontSize: '24px',
    lineHeight: '1.3',
    fontWeight: 'normal'
  })
}
