/**
 * Tuner class for detecting musical notes from audio input
 */
export class Tuner {
  constructor(middleA = 440) {
    this.middleA = middleA
    this.semitone = 69
    this.bufferSize = 4096
    this.noteStrings = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
    this.onNoteDetected = null
  }

  /**
   * Initialize the audio context and analyzer
   */
  async init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = this.bufferSize
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.initGetUserMedia(stream)
    } catch (error) {
      console.error('Error accessing audio device:', error)
      throw error
    }
  }

  /**
   * Initialize with user media stream
   */
  initGetUserMedia(stream) {
    this.audioContext.resume()
    this.stream = stream
    const source = this.audioContext.createMediaStreamSource(stream)
    source.connect(this.analyser)
    this.processStream()
  }

  /**
   * Process the audio stream and detect notes
   */
  processStream() {
    const self = this
    
    // Use Aubio library for pitch detection
    aubio().then(function(aubio) {
      // Create pitch detector using Aubio
      const pitchDetector = new aubio.Pitch(
        'default',
        self.bufferSize,
        1,
        self.audioContext.sampleRate
      )
      
      // Create the AudioProcessorNode
      self.scriptProcessor = self.audioContext.createScriptProcessor(
        self.bufferSize,
        1,
        1
      )
      
      // Connect the analyser to the script processor
      self.analyser.connect(self.scriptProcessor)
      self.scriptProcessor.connect(self.audioContext.destination)
      
      self.scriptProcessor.onaudioprocess = function(event) {
        const input = event.inputBuffer.getChannelData(0)
        const frequency = pitchDetector.do(input)
        
        if (frequency && self.onNoteDetected) {
          const note = self.getNote(frequency)
          self.onNoteDetected({
            name: note.name,
            value: note.value,
            cents: note.cents,
            octave: note.octave,
            frequency: frequency
          })
        }
      }
    })
  }

  /**
   * Get musical note information from frequency
   */
  getNote(frequency) {
    const note = {}
    
    // Calculate note information using equal temperament
    const noteNum = 12 * (Math.log(frequency / this.middleA) / Math.log(2))
    const noteNumRounded = Math.round(noteNum)
    const fullNoteNum = noteNumRounded + this.semitone
    
    note.value = fullNoteNum
    note.cents = Math.floor((noteNum - noteNumRounded) * 100)
    note.name = this.noteStrings[fullNoteNum % 12]
    note.octave = Math.floor(fullNoteNum / 12) - 1
    
    return note
  }

  /**
   * Close and clean up resources
   */
  close() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
    }
    
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect()
    }
    
    if (this.analyser) {
      this.analyser.disconnect()
    }
    
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
} 