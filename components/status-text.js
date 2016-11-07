import React from 'react'
import css, { merge } from 'next/css'

export default ({ css, label = '', status = '', error = false, ...other }) => (
  <p
    {...other}
    className={merge(styles.root, css)}
  >
    {label + ' '}
    <span>{status}</span>
  </p>
)

const styles = {
  root: css({
    height: '19.5px',
    margin: '12px 0 0 36px',
    fontSize: '14px',
    lineHeight: '1.5',
    color: 'rgba(0, 0, 0, 0.86)'
  })
}
