import React, { Component } from 'react'
import css, { merge } from 'next/css'
import Audio from './audio'
import Button from './button'
import Input from './input'
import StatusText from './status-text'
import { DEFAULT_MIX_DURATION, MAX_MIX_DURATION } from '../common/constants'
import mixer from '../services/mixer'

const RenderingStatus = {
  NONE: 'NONE',
  RENDERING: 'RENDERING',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS'
}

export default class extends Component {

  constructor (props) {
    super(props)
    this.state = {
      playingPreview: false,
      track1Start: 0,
      track2Start: 0,
      mixDuration: DEFAULT_MIX_DURATION,
      showValidationText: false,
      renderingStatus: RenderingStatus.NONE
    }
  }

  componentDidMount () {
    // TODO: The mixer should probably have a value change event
    mixer.track1Start = this.state.track1Start
    mixer.track2Start = this.state.track2Start
    mixer.mixDuration = this.state.mixDuration
  }

  validateDuration (value, min = 0, max = Number.POSITIVE_INFINITY, defaultValue = 0) {
    const parsed = parseInt(value)
    let validated = defaultValue
    if (parsed >= min && parsed <= max) {
      validated = parsed
    }
    return { parsed, validated }
  }

  setPreview (preview) {
    if (preview) {
      mixer.startPreview()
    } else {
      mixer.stopPreview()
    }
    this.setState({ playingPreview: preview })
  }

  onPlayPauseButtonClick = event => {
    event.preventDefault()
    this.setPreview(!this.state.playingPreview)
  }

  onFormSubmit = event => {
    event.preventDefault()
    this.setState({ renderingStatus: RenderingStatus.RENDERING })
    mixer.render(
      blob => {
        this.setState({
          renderingStatus: RenderingStatus.SUCCESS
        })
        if (this.props.onRenderComplete) {
          this.props.onRenderComplete(blob)
        }
      },
      () => {
        this.setState({ renderingStatus: RenderingStatus.ERROR })
      }
    )
  }

  onTrack1StartBlur = event => {
    const { validated } = this.validateDuration(event.target.value)
    mixer.track1Start = validated
    this.setState({ track1Start: validated })
  }

  onTrack1StartChange = event => {
    this.setState({ track1Start: event.target.value })
  }

  onTrack2StartBlur = event => {
    const { validated } = this.validateDuration(event.target.value)
    mixer.track2Start = validated
    this.setState({ track2Start: validated })
  }

  onTrack2StartChange = event => {
    this.setState({ track2Start: event.target.value })
  }

  onMixDurationBlur = event => {
    const { validated, parsed } = this.validateDuration(
      event.target.value,
      5,
      MAX_MIX_DURATION,
      DEFAULT_MIX_DURATION
    )
    mixer.mixDuration = validated
    this.setState({
      mixDuration: validated,
      showValidationText: parsed > MAX_MIX_DURATION
    })
  }

  onMixDurationChange = event => {
    this.setState({ mixDuration: event.target.value })
  }

  renderPlayPauseImage () {
    return this.state.playingPreview
      ? (
        <img
          className={styles.playPauseImage}
          src='/static/images/ic_stop_black_24px.svg'
          alt='pause'
        />
      )
      : (
        <img
          className={styles.playPauseImage}
          src='/static/images/ic_play_arrow_black_24px.svg'
          alt='play'
        />
      )
  }

  renderRenderingStatus () {
    const { renderingStatus } = this.state
    return (
      <StatusText
        active={renderingStatus !== RenderingStatus.NONE}
        error={renderingStatus === RenderingStatus.ERROR}
        status={renderingStatus === RenderingStatus.SUCCESS}
        label='Rendering'
        statusText='done!'
        errorText='hmm, something went wrong...'
      />
    )
  }

  render () {
    const { css, disabled } = this.props
    const {
      track1Start,
      track2Start,
      mixDuration,
      showValidationText,
      renderingStatus
    } = this.state
    return (
      <div className={merge(styles.root, css)}>
        <form onSubmit={this.onFormSubmit}>
          <div className={styles.durationFieldsRoot}>
            <span className={styles.durationField}>
              <Input
                id='track-one-start'
                type='number'
                css={styles.durationInput}
                disabled={disabled}
                onBlur={this.onTrack1StartBlur}
                onChange={this.onTrack1StartChange}
                value={track1Start}
                min='0'
              />
              <label
                className={styles.durationLabel}
                htmlFor='track-one-start'
              >
                Track 1 start
              </label>
            </span>
            <span className={styles.durationField}>
              <Input
                id='track-two-start'
                type='number'
                css={styles.durationInput}
                disabled={disabled}
                onBlur={this.onTrack2StartBlur}
                onChange={this.onTrack2StartChange}
                value={track2Start}
                min='0'
              />
              <label
                className={styles.durationLabel}
                htmlFor='track-two-start'
              >
                Track 2 start
              </label>
            </span>
            <span className={styles.durationField}>
              <Input
                id='mix-duration'
                type='number'
                css={styles.durationInput}
                disabled={disabled}
                onBlur={this.onMixDurationBlur}
                onChange={this.onMixDurationChange}
                value={mixDuration}
                min='0'
                max={MAX_MIX_DURATION}
              />
              <label
                className={styles.durationLabel}
                htmlFor='mix-duration'
              >
                Mix duration
              </label>
            </span>
          </div>
          <div className={merge(styles.info, showValidationText ? null : styles.hidden)}>
            {`Mixes are limited to ${MAX_MIX_DURATION} seconds.`}
          </div>
          <Button
            css={styles.playPauseButton}
            disabled={disabled}
            onClick={this.onPlayPauseButtonClick}
          >
            {this.renderPlayPauseImage()}
            <span className={styles.playPauseText}>
              Preview
            </span>
          </Button>
          <Button
            css={styles.renderButton}
            disabled={disabled || renderingStatus === RenderingStatus.RENDERING}
            type='submit'
          >
            Render It!
          </Button>
          {this.renderRenderingStatus()}
        </form>
      </div>
    )
  }
}

const styles = {
  root: css({
    maxWidth: '600px'
  }),
  playPauseButton: css({
    position: 'relative',
    marginTop: '8px',
    paddingRight: '10px'
  }),
  playPauseImage: css({
    position: 'absolute',
    height: '18px',
    width: '18px',
    top: '1.5px'
  }),
  playPauseText: css({
    marginLeft: '18px'
  }),
  durationFieldsRoot: css({
    margin: '8px 0'
  }),
  durationField: css({
    display: 'inline-block',
    margin: '0 16px 8px 0'
  }),
  durationInput: css({
    width: '38px',
    verticalAlign: 'middle'
  }),
  durationLabel: css({
    fontSize: '13px',
    marginLeft: '6px',
    color: 'rgba(0, 0, 0, 0.86)',
    whiteSpace: 'nowrap'
  }),
  info: css({
    fontSize: '13px',
    marginTop: '4px',
    color: 'rgba(0, 0, 0, 0.67)'
  }),
  hidden: css({
    visibility: 'hidden'
  }),
  renderButton: css({
    marginLeft: '8px'
  })
}
