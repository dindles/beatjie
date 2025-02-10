// audio-packs.ts
import type { Packs } from '$lib/audio/audio-models.svelte'

const audio_path = '/audio'

export const packs: Packs = [
  {
    name: '0',
    samples: [
      { id: 0, emoji: '🥾', url: `${audio_path}/0/1_kick.mp3` },
      { id: 1, emoji: '👏', url: `${audio_path}/0/2_clap.mp3` },
      { id: 2, emoji: '🪤', url: `${audio_path}/0/3_snare.mp3` },
      { id: 3, emoji: '🪖', url: `${audio_path}/0/5_ch.mp3` },
      { id: 4, emoji: '🧢', url: `${audio_path}/0/6_oh.mp3` },
      { id: 5, emoji: '🪵', url: `${audio_path}/1/4_wood.mp3` },
      { id: 6, emoji: '🪇', url: `${audio_path}/1/2_shaker.mp3` },
      { id: 7, emoji: '🐮', url: `${audio_path}/1/1_cow.mp3` },
    ],
  },
  {
    name: '1',
    samples: [
      { id: 8, emoji: '👟', url: `${audio_path}/0/0_kick.mp3` },
      { id: 9, emoji: '🔊', url: `${audio_path}/0/7_808.mp3` },
      { id: 10, emoji: '💥', url: `${audio_path}/1/0_crash.mp3` },
      { id: 11, emoji: '🎩', url: `${audio_path}/0/4_ch.mp3` },
      { id: 12, emoji: '👨', url: `${audio_path}/1/3_tom.mp3` },
      { id: 13, emoji: '🧊', url: `${audio_path}/1/5_tink.mp3` },
      { id: 14, emoji: '💧', url: `${audio_path}/1/6_drop.mp3` },
      { id: 15, emoji: '🥂', url: `${audio_path}/1/7_tink.mp3` },
    ],
  },
  {
    name: '2',
    samples: [
      { id: 16, emoji: '🏠', url: `${audio_path}/2/0_house.mp3` },
      { id: 17, emoji: '🎸', url: `${audio_path}/2/1_guitar.mp3` },
      { id: 18, emoji: '🎻', url: `${audio_path}/2/2_cello.mp3` },
      { id: 19, emoji: '🪈', url: `${audio_path}/2/3_flute.mp3` },
      { id: 20, emoji: '🛣️', url: `${audio_path}/2/4_rhodes.mp3` },
      { id: 21, emoji: '🧘‍♀️', url: `${audio_path}/2/5_yoga.mp3` },
      { id: 22, emoji: '💅', url: `${audio_path}/2/6_mhm.mp3` },
      { id: 23, emoji: '👍', url: `${audio_path}/2/7_yeah.mp3` },
    ],
  },
  {
    name: '3',
    samples: [
      { id: 27, emoji: '🛸', url: `${audio_path}/3/3_spaceship.mp3` },
      { id: 28, emoji: '📡', url: `${audio_path}/3/4_satellite.mp3` },
      { id: 29, emoji: '🐋', url: `${audio_path}/3/5_sonar.mp3` },
      { id: 30, emoji: '🐶', url: `${audio_path}/3/6_woof.mp3` },
      { id: 31, emoji: '😱', url: `${audio_path}/3/7_scream.mp3` },
    ],
  },
]
