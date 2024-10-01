<script lang="ts">
  import * as Tone from 'tone'

  const NOTES = [
    'D0',
    'D1',
    'A1',
    'D2',
    'A2',
    'D3',
    'A3',
    'D4',
    'A4',
    'D5',
    'F#5',
  ]

  function getRandomInt(min: number, max: number) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
  }

  const frequencies = NOTES.map((note) => ({
    // Random note between G3 and G4
    start: getRandomInt(200, 400),
    end: Tone.Frequency(note).toFrequency(),
  }))
  frequencies.forEach((freq) => {
    // Create a synthesizer with a "fatsawtooth"
    // oscillator for that rich, full sound.
    const sawtoothSynth = new Tone.Synth({
      oscillator: {
        type: 'fatsawtooth',
      },
      envelope: {
        attack: 3,
        decay: 0.8,
        sustain: 1.0,
        release: 2.0,
      },
      // Randomly detune the oscillator to give it a more analog sound
      detune: getRandomInt(-2, 2),
    })

    // Apply a vibrato effect for a slight oscillation in pitch,
    // adding to the richness of the sound.
    const vib = new Tone.Vibrato(freq.end, 0.1)

    // Use a gain node to control the volume.
    const gain = new Tone.Gain()

    // Add a reverb effect for spatial depth.
    const reverb = new Tone.Reverb(1)

    // Add a low pass filter to cut off the high frequencies.
    // Frequencies above 11,000 Hz will be gradually reduced in volume,
    // creating a smoother and less harsh sound
    // by removing high-frequency noise or harshness from the output audio
    const filter = new Tone.Filter(11000, 'lowpass', -12)

    // Create an envelope to control the frequency
    // and gain of the synthesizer.
    // This is the source of the sweeping sound
    // that is characteristic of the THX Deep Note.
    const envelope = new Tone.Envelope({
      attack: 10,
      decay: 9,
      sustain: 1.0,
      release: 0.0,
    })

    // Normalize the frequency and gain values to the desired range
    // This allows the envelope to control the frequency and gain of the synthesizer
    const freqScale = new Tone.Scale(freq.start, freq.end)
    const gainScale = new Tone.Scale(0.05, 0.7)

    // Connect the synthesizer to the gain node, vibrato, reverb, and filter
    sawtoothSynth.connect(gain)
    gain.connect(vib)
    vib.connect(reverb)
    reverb.connect(filter)

    // Connect the envelope to the frequency and gain scales
    envelope.connect(freqScale)
    envelope.connect(gainScale)
    freqScale.connect(sawtoothSynth.frequency)
    gainScale.connect(gain.gain)

    // Connect the filter to the main output
    filter.toDestination()

    // Start the synthesizer
    sawtoothSynth.triggerAttackRelease(freq.start, 16)

    // Start the envelope
    envelope.triggerAttackRelease(5)
  })
</script>
