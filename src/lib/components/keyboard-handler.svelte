<script lang="ts">
  import * as Tone from 'tone'

  import type { Packs } from '$lib/types/audio-types'
  import type { Sample } from '$lib/audio-classes/sample.svelte'
  import type { MainAudioBus } from '$lib/audio-classes/main-audio-bus.svelte'
  import type { AudioSequencer } from '$lib/audio-classes/audio-sequencer.svelte'

  interface Props {
    sequencer: AudioSequencer
    main_audio_bus: MainAudioBus
    samples: Sample[]
    packs: Packs
    pitches: string[]
    selected_sample: Sample | undefined
    selected_pack_index: number
    preview_samples_active: boolean
  }

  let {
    sequencer,
    main_audio_bus,
    samples,
    packs,
    pitches,
    selected_sample = $bindable(),
    selected_pack_index = $bindable(),
    preview_samples_active = $bindable()
  }: Props = $props()

  const KEY_MAP: Record<string, number> = {
    q: 0,
    w: 1,
    e: 2,
    r: 3,
    a: 4,
    s: 5,
    d: 6,
    f: 7
  }

  async function handleKeydown(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault()
      await sequencer.togglePlayback()
    }

    // 1-4: pack selection
    const pack_number = parseInt(event.key)
    if (pack_number >= 1 && pack_number <= 4) {
      selected_pack_index = pack_number - 1
      return
    }

    // qwer/asdf: sample selection
    const sample_index = KEY_MAP[event.key.toLowerCase()]
    if (sample_index !== undefined) {
      const visible_samples = samples.filter((s) => s.pack === packs[selected_pack_index].name)
      const sample = visible_samples[sample_index]
      if (sample) {
        sample.play(Tone.now())
        selected_sample = sample
      }
    }

    // p: preview toggle
    if (event.key.toLowerCase() === 'p') {
      preview_samples_active = !preview_samples_active
      return
    }

    // zxcv: sample effects (mute, pitch, delay, reverb)
    if (selected_sample) {
      switch (event.key.toLowerCase()) {
        case 'z':
          selected_sample.toggleMute(!selected_sample.is_muted)
          break
        case 'x': {
          const current_index = pitches.indexOf(selected_sample.pitch)
          const next_index = (current_index + 1) % pitches.length
          selected_sample.pitch = pitches[next_index] as typeof selected_sample.pitch
          break
        }
        case 'c':
          selected_sample.toggleDelay(!selected_sample.delay_is_active)
          break
        case 'v':
          selected_sample.toggleReverb(!selected_sample.reverb_is_active)
          break
      }
    }

    // bn: global effects (highpass, distortion)
    if (event.key.toLowerCase() === 'b') {
      main_audio_bus.toggleMainHighPass(!main_audio_bus.mainIsHighPassed)
    }
    if (event.key.toLowerCase() === 'n') {
      main_audio_bus.toggleMainDistortion(!main_audio_bus.mainIsDistorted)
    }

    // arrows: BPM
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const new_bpm = Math.min(200, sequencer.getBPM() + 1)
      sequencer.setBPM(new_bpm)
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const new_bpm = Math.max(60, sequencer.getBPM() - 1)
      sequencer.setBPM(new_bpm)
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
