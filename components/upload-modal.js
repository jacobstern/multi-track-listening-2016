import React, { Component } from 'react'
import css from 'next/css'
import uuid from 'node-uuid'
import Button from './button'
import H1 from './h1'
import Input from './input'
import Modal from './modal'
import StatusText from './status-text'
import firebase from '../services/firebase'

const UploadingStatus = {
  NONE: 'NONE',
  UPLOADING: 'UPLOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
}

export default class extends Component {

  constructor (props) {
    super(props)
    this.state = {
      song1Name: this.parseSongName(props.file1Name),
      song2Name: this.parseSongName(props.file2Name),
      uploadingStatus: UploadingStatus.NONE,
      uploadingProgress: 0
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.song1Name !== this.props.song1Name) {
      this.setState({ song1Name: this.parseSongName(nextProps.file1Name) })
    }
    if (nextProps.song2Name !== this.props.song2Name) {
      this.setState({ song2Name: this.parseSongName(nextProps.file2Name) })
    }
  }

  parseSongName (fileName) {
    if (!fileName) {
      return ''
    }
    return fileName.split('.')[0]
  }

  onSubmit = event => {
    event.preventDefault()
    this.setState({ uploadingStatus: UploadingStatus.UPLOADING })
    const onError = () => {
      this.setState({ uploadingStatus: UploadingStatus.ERROR })
    }
    firebase.auth().signInAnonymously()
      .then(user => {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', this.props.objectURL, true)
        xhr.responseType = 'blob'
        xhr.onload = () => {
          if (xhr.status === 200) {
            const blob = xhr.response
            const fileName = uuid.v1()
            const uploadTask = firebase.storage().ref(`rawAudio/${fileName}`).put(blob)
            uploadTask
              .on('state_changed', snapshot => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                this.setState({ uploadingProgress: Math.floor(progress) })
              })
            uploadTask
              .then(() => {
                this.setState({ uploadingStatus: UploadingStatus.SUCCESS })
              })
              .catch(onError)
          } else {
            onError()
          }
        }
        xhr.send()
      })
      .catch(onError)
  }

  onSong1NameChange = event => {
    this.setState({ song1Name: event.target.value })
  }

  onSong1NameChange = event => {
    this.setState({ song2Name: event.target.value })
  }

  onCancelClick = event => {
    event.preventDefault()
    if (typeof this.props.onClose === 'function') {
      this.props.onClose()
    }
  }

  render () {
    const { active } = this.props
    const { song1Name, song2Name, uploadingStatus, uploadingProgress } = this.state
    return (
      <Modal active={active}>
        <H1>Share This Mix</H1>
        <form onSubmit={this.onSubmit}>
          <label
            className={styles.label}
            htmlFor='song-1-name'
          >
            Song 1 name
          </label>
          <Input
            css={styles.input}
            id='song-1-name'
            value={song1Name}
            onChange={this.onSong1NameChange}
          />
          <label
            className={styles.label}
            htmlFor='song-2-name'
          >
            Song 2 name
          </label>
          <Input
            css={styles.input}
            id='song-2-name'
            value={song2Name}
            onChange={this.onSong2NameChange}
          />
          <Button
            css={styles.uploadButton}
            type='submit'
            disabled={uploadingStatus === UploadingStatus.UPLOADING}
          >
            Upload
          </Button>
          <Button
            css={styles.cancelButton}
            onClick={this.onCancelClick}
            disabled={uploadingStatus === UploadingStatus.UPLOADING}
           >
           Cancel
          </Button>
        </form>
        <StatusText
          label={uploadingStatus === UploadingStatus.NONE ? '' : 'Uploading...'}
          status={uploadingStatus === UploadingStatus.ERROR
            ? 'error.'
            : (uploadingStatus === UploadingStatus.UPLOADING
                ? uploadingProgress + '%'
                : ''
              )
          }
          error={uploadingStatus === UploadingStatus.ERROR}
        />
      </Modal>
    )
  }
}

const styles = {
  input: css({
    display: 'block',
    marginBottom: '12px',
    width: '215px'
  }),
  label: css({
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px'
  }),
  uploadButton: css({
    marginTop: '12px'
  }),
  cancelButton: css({
    marginLeft: '12px'
  })
}
