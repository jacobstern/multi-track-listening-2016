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
const TranscodingStatus = {
  NONE: 'NONE',
  TRANSCODING: 'TRANSCODING',
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
      uploadingProgress: 0,
      transcodingStatus: TranscodingStatus.NONE,
      transcodingProgress: 0
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.file1Name !== this.props.file1Name) {
      this.setState({ song1Name: this.parseSongName(nextProps.file1Name) })
    }
    if (nextProps.file2Name !== this.props.file2Name) {
      this.setState({ song2Name: this.parseSongName(nextProps.file2Name) })
    }
  }

  parseSongName (fileName) {
    if (!fileName) {
      return ''
    }
    return fileName.split('.')[0]
  }

  transcodeFile (uid) {
    const database = firebase.database()
    const ref = database.ref('queue/tasks')
    ref.push({ uid })
      .on('value', snapshot => {
        const val = snapshot.val()
        if (val) {
          const { _progress, _error } = val
          if (_error) {
            this.setState({ transcodingStatus: TranscodingStatus.ERROR })
          } else {
            this.setState({ transcodingProgress: _progress ? Math.floor(_progress) : 0 })
          }
        }
      })
    database.ref(`mixes/${uid}`)
      .on('value', snapshot => {
        const val = snapshot.val()
        if (val && typeof this.props.onNavigate === 'function') {
          this.props.onNavigate(`listen/${uid}`)
        }
      })
    this.setState({ transcodingStatus: TranscodingStatus.TRANSCODING })
  }

  onSubmit = event => {
    event.preventDefault()

    const onError = e => {
      console.log(e)
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
            const uid = uuid.v1()
            const filePath = `raw/${uid}`
            const uploadTask = firebase.storage().ref(filePath).put(blob)

            uploadTask
              .on('state_changed', snapshot => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                this.setState({ uploadingProgress: Math.floor(progress) })
              })
            uploadTask
              .then(() => {
                this.setState({ uploadingStatus: UploadingStatus.SUCCESS })
                this.transcodeFile(uid)
              })
              .catch(onError)
          } else {
            onError()
          }
        }
        xhr.send()
      })
      .catch(onError)

    this.setState({ uploadingStatus: UploadingStatus.UPLOADING })
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

  renderProgress (progress) {
    return (progress < 10 ? '\xa0' : '') + progress + '%'
  }

  render () {
    const { active } = this.props
    const {
      song1Name,
      song2Name,
      uploadingStatus,
      uploadingProgress,
      transcodingStatus,
      transcodingProgress
    } = this.state
    return (
      <Modal
        active={active}
        css={styles.modal}
      >
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
          <StatusText
            label='Uploading'
            active={uploadingStatus !== UploadingStatus.NONE}
            status={
              uploadingStatus === UploadingStatus.UPLOADING ||
              uploadingStatus === UploadingStatus.SUCCESS
            }
            statusText={
              uploadingStatus === UploadingStatus.UPLOADING
                ? this.renderProgress(uploadingProgress)
                : 'done!'
            }
            errorText='error.'
            error={uploadingStatus === UploadingStatus.ERROR}
          />
          <StatusText
            label='Transcoding'
            active={transcodingStatus !== TranscodingStatus.NONE}
            status={
              transcodingStatus === TranscodingStatus.TRANSCODING ||
              transcodingStatus === TranscodingStatus.SUCCESS
            }
            statusText={
              transcodingStatus === TranscodingStatus.TRANSCODING
                ? this.renderProgress(transcodingProgress)
                : 'done!'
            }
            errorText='error.'
            error={transcodingStatus === TranscodingStatus.ERROR}
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
      </Modal>
    )
  }
}

const styles = {
  modal: css({
    maxWidth: '225px'
  }),
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
