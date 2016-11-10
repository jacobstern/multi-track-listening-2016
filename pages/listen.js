import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import css from 'next/css'
import Audio from '../components/audio'
import H1 from '../components/h1'
import Input from '../components/input'
import PageHead from '../components/page-head'
import 'isomorphic-fetch'

export default class extends Component {

  static async getInitialProps (context) {
    try {
      const id = context.query.id
      if (!id) {
        throw new Error('Not found')
      }
      const res = await fetch(`https://multi-track-listening.firebaseio.com/mixes/${id}.json`)
      const val = await res.json()
      if (val) {
        return {
          playbackUrl: val.url,
          song1Name: val.song1Name,
          song2Name: val.song2Name
        }
      } else {
        throw new Error('Not found')
      }
    } catch (e) {
      return { error: true }
    }
  }

  setInputRef = ref => {
    // TODO: Get URL from server in getInitialProps
    if (ref) {
      ReactDOM.findDOMNode(ref).value = window.location.href
    }
  }

  render () {
    const { playbackUrl, song1Name, song2Name, error } = this.props
    return (
      <div className={styles.content}>
        <PageHead pageTitle='Listen' />
        <H1>{error ? 'Not Found' : 'Listen'}</H1>
        {!error &&
          <div className={styles.subheader}>
            <p className={styles.subheaderPara}>{song1Name}</p>
            <p className={styles.subheaderPara}>x</p>
            <p className={styles.subheaderPara}>{song2Name}</p>
          </div>
        }
        {playbackUrl &&
          <Audio
            css={styles.audio}
            controls
            src={playbackUrl}
          />
        }
        {!error &&
          <div>
            Copy this URL to share!
            <Input
              ref={this.setInputRef}
              css={styles.locationInput}
              readOnly
            />
          </div>
        }
      </div>
    )
  }
}

const styles = {
  content: css({
    padding: '8px 16px',
    fontSize: '15px',
    maxWidth: '600px'
  }),
  subheader: css({
    marginBottom: '24px'
  }),
  subheaderPara: css({
    margin: '0',
    lineHeight: '1.2'
  }),
  audio: css({
    marginBottom: '12px'
  }),
  locationInput: css({
    display: 'block',
    width: '300px',
    marginTop: '8px',
    verticalAlign: 'middle'
  })
}
