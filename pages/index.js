import React, { Component } from 'react'
import css from 'next/css'
import FileInput from '../components/file-input'
import Head from '../components/head'
import MixerControls from '../components/mixer-controls'
import Step from '../components/step'
import Steps from '../components/steps'
import mixer from '../services/mixer'

const fileState = {
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
      file1State: fileState.NULL,
      file2State: fileState.NULL,
      supportsAudioParam: false
    }
  }

  componentWillMount () {
    if (typeof window !== 'undefined') {
      mixer.init()
      this.setState({ supportsAudioParam: mixer.supportsAudioParam })
    }
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
      this.setState({ file1State: fileState.PROCESSING })
      this.processFile(
        file,
        mixer.setSource1.bind(mixer),
        () => {
          this.setState({
            file1State: fileState.READY,
            currentStep: 1
          })
        },
        () => {
          this.setState({
            file1State: fileState.ERROR
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
      this.setState({ file2State: fileState.PROCESSING })
      this.processFile(
        file,
        mixer.setSource2.bind(mixer),
        success => {
          this.setState({
            file2State: fileState.READY,
            currentStep: 2
          })
        },
        () => {
          this.setState({
            file2State: fileState.ERROR
          })
        }
      )
    }
  }

  renderFileStatus (state) {
    return (
      <p className={styles.fileStatus}>
        {state !== fileState.NULL &&
          'Processing... '
        }
        {state === fileState.ERROR &&
          <span>error, please try a different file.</span>
        }
        {state === fileState.READY &&
          <span>done!</span>
        }
      </p>
    )
  }

  render () {
    const { currentStep, file1State, file2State } = this.state
    return (
      <div>
        <Head title='Multi-Track Listening!' />
        <div className={styles.content}>
          <Steps currentStep={currentStep}>
            <Step>
              <p>Choose a track</p>
              <FileInput
                accept='audio/*'
                onChange={this.onFile1Change}
                disabled={file1State === fileState.PROCESSING || file1State === fileState.READY}
              >
                Upload File
              </FileInput>
              {this.renderFileStatus(file1State)}
            </Step>
            <Step>
              <p>Choose another track</p>
              <FileInput
                accept='audio/*'
                onChange={this.onFile2Change}
                disabled={
                  file2State === fileState.PROCESSING || file2State === fileState.READY ||
                  currentStep < 1
                }
                >
                  Upload File
              </FileInput>
              {this.renderFileStatus(file2State)}
            </Step>
            <Step>
              <p>Multi-track listening!</p>

              <MixerControls disabled={currentStep < 2} />
            </Step>
          </Steps>
        </div>
      </div>
    )
  }
}

const styles = {
  content: css({
    padding: '8px 16px',
    fontSize: '15px'
  }),
  fileStatus: css({
    height: '19.5px',
    margin: '12px 0 0 36px',
    fontSize: '14px',
    lineHeight: '1.5',
    color: 'rgba(0, 0, 0, 0.86)'
  })
}
