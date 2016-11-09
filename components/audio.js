import React from 'react'
import css, { merge } from 'next/css'

export default ({ css, controls, disabled, ...rest }) => (
  <audio
    {...rest}
    className={controls ? merge(styles.controls, disabled ? styles.disabled : null, css) : ''}
    controls={controls}
    disabled={disabled}
  />
)

const styles = {
  controls: css({
    width: '300px',
    height: '32px',
    border: '1px solid #666',
    '::-webkit-media-controls-panel': {
      background: 'transparent'
    }
  }),
  disabled: css({
    opacity: '0.7'
  })
}
