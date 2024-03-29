import React, { Component } from 'react'
import css from 'next/css'
import Audio from '../components/audio'
import Button from '../components/button'
import FileInput from '../components/file-input'
import H1 from '../components/h1'
import PageHead from '../components/page-head'
import MixerControls from '../components/mixer-controls'
import StatusText from '../components/status-text'
import Step from '../components/step'
import Steps from '../components/steps'
import UploadModal from '../components/upload-modal'
import mixer from '../services/mixer'

const FileStatus = {
  NULL: 'NULL',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  ERROR: 'ERROR'
}

export default class extends Component {

  constructor (props) {
    super(props)
    this.state = {
      currentStep: 0,
      file1Name: '',
      file2Name: '',
      file1Status: FileStatus.NULL,
      file2Status: FileStatus.NULL,
      supportsAudioParam: false,
      playbackURL: null,
      showModal: false
    }
  }

  componentWillMount () {
    this.setState({ supportsAudioParam: mixer.supportsAudioParam })
  }

  loadFile (file, success, error) {
    const reader = new FileReader()
    reader.onload = event => success(event.target.result)
    reader.onerror = event => error(event.target.error)
    reader.readAsArrayBuffer(file)
  }

  processFile (file, uploadFunction, success, error) {
    this.loadFile(
      file,
      buffer => {
        uploadFunction(buffer, success, error)
      },
      error
    )
  }

  onFile1Change = event => {
    event.preventDefault()

    const file = event.target.files[0]
    this.file1 = file

    if (file) {
      this.setState({ file1Status: FileStatus.PROCESSING })
      this.processFile(
        file,
        mixer.setSource1.bind(mixer),
        () => {
          this.setState({
            file1Status: FileStatus.READY,
            file1Name: file.name,
            currentStep: 1
          })
        },
        () => {
          this.setState({
            file1Status: FileStatus.ERROR
          })
        }
      )
    }
  }

  onFile2Change = event => {
    event.preventDefault()

    const file = event.target.files[0]
    this.file2 = file

    if (file) {
      this.setState({ file2Status: FileStatus.PROCESSING })
      this.processFile(
        file,
        mixer.setSource2.bind(mixer),
        success => {
          this.setState({
            file2Status: FileStatus.READY,
            file2Name: file.name,
            currentStep: 2
          })
        },
        () => {
          this.setState({
            file2Status: FileStatus.ERROR
          })
        }
      )
    }
  }

  onRenderComplete = blob => {
    if (this.state.playbackURL) {
      URL.revokeObjectURL(this.state.playbackURL)
    }
    this.setState({ playbackURL: URL.createObjectURL(blob) })
  }

  onModalClose = () => {
    this.setState({ showModal: false })
  }

  onModalNavigate = url => {
    this.props.url.pushTo(url)
  }

  onShareClick = event => {
    event.preventDefault()
    this.setState({ showModal: true })
  }

  renderFileStatus (state) {
    return (
      <StatusText
        active={state !== FileStatus.NULL}
        error={state === FileStatus.ERROR}
        status={state === FileStatus.READY}
        label='Processing'
        statusText='done!'
        errorText='error, please try a different file.'
      />
    )
  }

  render () {
    const {
      currentStep,
      file1Status,
      file2Status,
      file1Name,
      file2Name,
      playbackURL,
      showModal
    } = this.state
    return (
      <div>
        <PageHead pageTitle='New Mix' />
        <div className={styles.content}>
          <H1>New Mix</H1>
          <Steps currentStep={currentStep}>
            <Step>
              <p>Choose a track</p>
              <FileInput
                accept='audio/*'
                onChange={this.onFile1Change}
                disabled={file1Status === FileStatus.PROCESSING || file1Status === FileStatus.READY}
              >
                Upload File
              </FileInput>
              {this.renderFileStatus(file1Status)}
            </Step>
            <Step>
              <p>Choose another track</p>
              <FileInput
                accept='audio/*'
                onChange={this.onFile2Change}
                disabled={
                  file2Status === FileStatus.PROCESSING || file2Status === FileStatus.READY ||
                  currentStep < 1
                }
                >
                  Upload File
              </FileInput>
              {this.renderFileStatus(file2Status)}
            </Step>
            <Step>
              <p>Multi-track listening!</p>
              <MixerControls
                disabled={currentStep < 2}
                onRenderComplete={this.onRenderComplete}
              />
              <Audio
                css={styles.audio}
                disabled={!playbackURL}
                style={{visibility: playbackURL ? 'visible' : 'hidden'}}
                controls
                src={playbackURL}
              />
              <Button
                css={styles.shareButton}
                style={{visibility: playbackURL ? 'visible' : 'hidden'}}
                onClick={this.onShareClick}
              >
                Upload and Share
              </Button>
            </Step>
          </Steps>
        </div>
        <UploadModal
          active={playbackURL && showModal}
          objectURL={playbackURL}
          file1Name={file1Name}
          file2Name={file2Name}
          onClose={this.onModalClose}
          onNavigate={this.onModalNavigate}
        />
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
  audio: css({
    display: 'block',
    marginTop: '12px'
  }),
  shareButton: css({
    margin: '12px 0'
  })
}
