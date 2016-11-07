import css from 'next/css'

const disabledOpacity = 0.7

export default {
  button: css({
    display: 'inline-block',
    border: '1px solid #666',
    padding: '4px',
    cursor: 'pointer',
    fontFamily: 'Cousine, Courier New, monospace, serif',
    fontSize: '14px',
    backgroundColor: 'transparent',
    color: 'rgb(0,0,0)',
    ':hover': {
      backgroundColor: 'rgba(0,0,0,0.017)'
    },
    ':disabled': {
      opacity: disabledOpacity,
      cursor: 'default'
    },
    ':disabled:hover': {
      backgroundColor: 'transparent'
    },
    ':focus': {
      outline: 'none'
    }
  }),
  buttonDisabled: css({
    opacity: disabledOpacity,
    cursor: 'default',
    ':hover': {
      backgroundColor: 'transparent'
    }
  })
}
