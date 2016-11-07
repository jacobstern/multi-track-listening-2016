import React, { Children } from 'react'
import css, { merge } from 'next/css'

export default ({ children, currentStep }) => {
  const steps = Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      let style = child.props.style
      if (index > currentStep) {
        style = merge(style, styles.later)
      }
      return React.cloneElement(child, { css: style })
    }
  })
  return <ol>{steps}</ol>
}

const styles = ({
  later: css({
    opacity: '0.5'
  })
})
