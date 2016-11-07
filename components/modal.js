import React from 'react'
import css, { merge } from 'next/css'

export default ({ css, children, active, ...other }) => (
  <div
    {...other}
    className={merge(styles.root, active ? null : styles.hidden)}
  >
    <div className={merge(styles.content, css)}>
      {children}
    </div>
  </div>
)

const styles = {
  root: css({
    position: 'fixed',
    zIndex: '1000',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    overflow: 'auto',
    backgroundColor: 'rgba(0,0,0,0.3)'
  }),
  content: css({
    margin: '7.5% auto',
    padding: '16px',
    border: '1px solid #666',
    width: '80%',
    maxWidth: '600px',
    backgroundColor: '#FFF'
  }),
  hidden: css({
    display: 'none'
  })
}
