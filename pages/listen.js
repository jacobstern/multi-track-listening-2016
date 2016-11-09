import React, { Component } from 'react'
import Audio from '../components/audio'
import H1 from '../components/h1'
import PageHead from '../components/page-head'

export default class extends Component {

  static async getInitialProps (context) {
    try {
      const id = context.query.id
      const res = await fetch(`https://multi-track-listening.firebaseio.com/mixes/${id}.json`)
      const val = await res.json()
      if (val) {
        return { playbackUrl: val.url, song1Name: val.song1Name, song2Name: val.song2Name }
      } else {
        throw new Error('Not found')
      }
    } catch (e) {
      return { error: true }
    }
  }

  render () {
    const { playbackUrl, song1Name, song2Name } = this.props
    return (
      <div>
        <PageHead title='Listen – Multi-Track Listening!' />
        <H1>Mix: {song1Name} x {song2Name}</H1>
        {playbackUrl &&
          <Audio controls src={playbackUrl} />
        }
      </div>
    )
  }
}
