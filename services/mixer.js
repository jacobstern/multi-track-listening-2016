import {
  MIX_GAIN,
  DEFAULT_MIX_DURATION,
  MIX_FADEOUT_DURATION,
  DRIFT_DURATION,
  DRIFT_RADIUS,
  DRIFT_RESOLUTION,
  DRIFT_Y
} from '../common/constants'

const createAudioContext = (key, type) => {
  // Keep audio context singleton in the global namespace for efficiency and to avoid errors when
  // hot reloading
  if (typeof window === 'undefined') {
    return null
  }

  if (key in window) {
    window[key].close() // Clean up the current audio context
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) {
    return null
  }

  window[key] = new AudioContext()
  return window[key]
}

class Mixer {

  constructor () {
    if (typeof window === 'undefined') {
      return
    }

    this._previewContext = createAudioContext('_Mixer_previewContext')
    this._previewGain = this._previewContext.createGain()
    this._previewGain.connect(this._previewContext.destination)

    this._previewPanner1 = this._previewContext.createPanner()
    this._previewPanner1.connect(this._previewGain)
    this._previewPanner2 = this._previewContext.createPanner()
    this._previewPanner2.connect(this._previewGain)

    this.supportsAudioParam = !!this._previewPanner1.orientationX

    this._configurePanner(this._previewPanner1)
    this._configurePanner(this._previewPanner2)
    this._configureListener(this._previewContext.listener)

    this._source1 = null
    this._source2 = null
    this._previewSource1 = null
    this._previewSource2 = null

    this._playingPreview = false

    this.mixDuration = DEFAULT_MIX_DURATION
    this.track1Start = 0
    this.track2Start = 0
  }

  _configurePanner (panner) {
    panner.panningModel = 'HRTF'
    panner.distanceModel = 'exponential'
    panner.refDistance = 1
    panner.maxDistance = 10000
    panner.rolloffFactor = 1.65
    panner.coneInnerAngle = 360
    panner.coneOuterAngle = 0
    panner.coneOuterGain = 0

    if (this.supportsAudioParam) {
      panner.orientationX.value = 1
      panner.orientationY.value = 0
      panner.orientationZ.value = 0
    } else {
      panner.setOrientation(1, 0, 0)
    }
  }

  _configureListener (listener) {
    listener.setOrientation(0, 0, -1, 0, 1, 0)
  }

  setSource1 (buffer, success, error) {
    this._previewContext.decodeAudioData(
      buffer,
      audioBuffer => {
        this.source1 = audioBuffer
        success()
      },
      error
    )
  }

  setSource2 (buffer, success, error) {
    this._previewContext.decodeAudioData(
      buffer,
      audioBuffer => {
        this.source2 = audioBuffer
        success()
      },
      error
    )
  }

  _createValueArrays (duration, resolution, radius) {
    const pointsCount = duration * resolution
    const half = Math.ceil(pointsCount / 2)
    const sourceArrayX = new Float32Array(pointsCount + half)
    const sourceArrayZ = new Float32Array(pointsCount + half)

    for (let i = 0; i < pointsCount; i++) {
      const angle = i * 2 * Math.PI / pointsCount

      sourceArrayX[i] = radius * Math.cos(angle)
      sourceArrayZ[i] = radius * Math.sin(angle)
    }

    sourceArrayX.copyWithin(pointsCount, 0, half)
    sourceArrayZ.copyWithin(pointsCount, 0, half)

    return {
      left: {
        x: sourceArrayX.slice(half, pointsCount + half),
        z: sourceArrayZ.slice(half, pointsCount + half)
      },
      right: {
        x: sourceArrayX.slice(0, pointsCount),
        z: sourceArrayZ.slice(0, pointsCount)
      }
    }
  }

  startPreview () {
    if (this._playingPreview || this._source1 === null || this._source2 === null ||
        !this.supportsAudioParam) {
      // TODO: Fallback using requestAnimationFrame for browsers that don't have AudioParam
      // support, i.e. everything that is not Chrome
      return
    }

    this.previewSource1 = this._previewContext.createBufferSource()
    this._previewSource1.buffer = this._source1
    this._previewSource1.connect(this._previewPanner1)

    this.previewSource2 = this._previewContext.createBufferSource()
    this._previewSource2.buffer = this._source2
    this._previewSource2.connect(this._previewPanner2)

    const currentTime = this._previewContext.currentTime
    this._startGain(this._previewGain, currentTime)
    this._startPanners(this._previewPanner1, this._previewPanner2, currentTime)
    this._startSources(this._previewSource1, this._previewSource2, currentTime)

    this.playingPreview = true
  }

  stopPreview () {
    if (!this._playingPreview) {
      return
    }

    this._previewSource1.stop()
    this._previewSource2.stop()

    this.playingPreview = false
  }

  _startGain (gain, currentTime) {
    gain.gain.cancelScheduledValues(currentTime)
    gain.gain.setValueAtTime(MIX_GAIN, currentTime)

    if (this.mixDuration > MIX_FADEOUT_DURATION) {
      const end = currentTime + this.mixDuration

      gain.gain.setValueAtTime(MIX_GAIN, end - MIX_FADEOUT_DURATION)
      gain.gain.exponentialRampToValueAtTime(0.01, end)
    }
  }

  _startPanners (panner1, panner2, currentTime) {
    panner1.positionY.value = DRIFT_Y
    panner2.positionY.value = DRIFT_Y

    panner1.positionX.cancelScheduledValues(currentTime)
    panner1.positionZ.cancelScheduledValues(currentTime)
    panner2.positionX.cancelScheduledValues(currentTime)
    panner2.positionZ.cancelScheduledValues(currentTime)

    const { left, right } = this._createValueArrays(DRIFT_DURATION, DRIFT_RESOLUTION, DRIFT_RADIUS)

    for (let i = 0; i < this.mixDuration / DRIFT_DURATION; i++) {
      const offset = (DRIFT_DURATION + 0.01) * i // Fudge factor of 0.01 to avoid collision

      panner1.positionX.setValueCurveAtTime(left.x, currentTime + offset, DRIFT_DURATION)
      panner1.positionZ.setValueCurveAtTime(left.z, currentTime + offset, DRIFT_DURATION)
      panner2.positionX.setValueCurveAtTime(right.x, currentTime + offset, DRIFT_DURATION)
      panner2.positionZ.setValueCurveAtTime(right.z, currentTime + offset, DRIFT_DURATION)
    }
  }

  startSource (source, start, currentTime) {
    if (!source.buffer) {
      throw new Error('Attempt to start source with no buffer')
    }

    const duration = source.buffer.duration
    if (start >= duration) {
      // TODO: Should we validate this?
      return
    }

    source.loop = true
    source.loopEnd = duration
    source.loopStart = start
    source.start(currentTime, start)
    source.stop(currentTime + this.mixDuration)
  }

  _startSources (source1, source2, currentTime) {
    this.startSource(source1, this.track1Start, currentTime)
    this.startSource(source2, this.track2Start, currentTime)
  }

  render (success, error, progress) {
    if (!this.supportsAudioParam) {
      error(new Error('Rendering not supported on browsers without the new PannerNode properties'))
    }

    if (this._source1 === null || this._source2 === null && typeof error === 'function') {
      error(new Error('Mixer sources are not ready'))
    }

    const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext
    if (!OfflineAudioContext && typeof error === 'function') {
      error(new Error('OfflineAudioContext not supported'))
    }

    const offlineContext = new OfflineAudioContext(2, 44100 * this.mixDuration, 44100)
    const offlinePanner1 = offlineContext.createPanner()
    const offlineSource1 = offlineContext.createBufferSource()
    const offlinePanner2 = offlineContext.createPanner()
    const offlineSource2 = offlineContext.createBufferSource()

    const offlineGain = offlineContext.createGain()
    offlineGain.connect(offlineContext.destination)

    this._configurePanner(offlinePanner1)
    this._configurePanner(offlinePanner2)
    this._configureListener(offlineContext.listener)

    offlineSource1.buffer = this._source1
    offlineSource1.connect(offlinePanner1)
    offlinePanner1.connect(offlineGain)

    offlineSource2.buffer = this._source2
    offlineSource2.connect(offlinePanner2)
    offlinePanner2.connect(offlineGain)

    const currentTime = offlineContext.currentTime
    this._startGain(offlineGain, currentTime)
    this._startPanners(offlinePanner1, offlinePanner2, currentTime)
    this._startSources(offlineSource1, offlineSource2, currentTime)

    offlineContext.oncomplete = event => {
      const buffer = event.renderedBuffer
      const worker = new Worker('static/js/recorder-worker.js')

      worker.onmessage = event => {
        if (typeof success === 'function') {
          success(event.data)
        }
      }
      worker.onerror = event => {
        if (typeof error === 'function') {
          error(event.error)
        }
      }
      worker.postMessage({
        command: 'init',
        config: { sampleRate: 44100, numChannels: 2 }
      })
      worker.postMessage({
        command: 'record',
        buffer: [
          buffer.getChannelData(0),
          buffer.getChannelData(1)
        ]
      })
      worker.postMessage({
        command: 'exportWAV',
        type: 'audio/wav'
      })
    }

    offlineContext.startRendering()
  }
}

export default new Mixer()
