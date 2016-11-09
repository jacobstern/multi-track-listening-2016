import React, { Component } from 'react'
import css, { merge } from 'next/css'
import buttonStyles from '../common/styles/button'

export default class extends Component {

  constructor (props) {
    super(props)
    this.state = { file: null }
  }

  onChange = event => {
    const that = event.target
    this.setState({ file: that.files[0] })
    if (this.props.onChange) {
      this.props.onChange(event)
    }
  }

  render () {
    const { children, disabled, value, ...rest } = this.props
    const { file } = this.state
    return (
      <div className={styles.root}>
        <label className={merge(styles.label, disabled ? styles.labelDisabled : null)}>
          <input
            {...rest}
            className={styles.input}
            disabled={disabled}
            type='file'
            onChange={this.onChange}
            value={value || ''}
          />
          {children}
        </label>
        {file &&
          <span className={styles.name}>{file.name + ' '}&#10003;</span>
        }
      </div>
    )
  }
}

const styles = {
  root: css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#247ec5'
  }),
  label: buttonStyles.button,
  labelDisabled: buttonStyles.buttonDisabled,
  input: css({
    display: 'none'
  }),
  name: css({
    marginLeft: '14px',
    verticalAlign: 'text-top',
    color: '#247ec5',
    fontSize: '13px'
  })
}
