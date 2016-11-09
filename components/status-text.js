import React from 'react'
import css, { merge } from 'next/css'

export default ({
    css,
    label = '',
    statusText = '',
    errorText = '',
    active = false,
    error = false,
    status = false,
    style,
    ...other
}) => (
  <p
    {...other}
    className={merge(styles.root, css)}
    style={{ visibility: active ? 'visible' : 'hidden', ...style }}
  >
    {label + '... '}
    <span>{error ? errorText : (status ? statusText : '')}</span>
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
