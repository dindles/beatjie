import type { Packs } from '$lib/audio/audio-models.svelte'

const audio_path = 'src/lib/assets/audio'

const packs_noID: Packs = [
  {
    name: '909-Dirt',
    samples: [
      {
        id: 1,
        name: 'BD',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/909-Dirt/BD.wav`,
      },
      {
        id: 2,
        name: 'Clap',
        emoji: '🎤',
        pitch: 'C2',
        url: `${audio_path}/909-Dirt/Clap.wav`,
      },
      {
        id: 3,
        name: 'OH',
        emoji: '🥁',
        pitch: 'C2',
        url: `${audio_path}/909-Dirt/OH.wav`,
      },
      {
        id: 4,
        name: 'Rim',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/909-Dirt/Rim.wav`,
      },
      {
        id: 5,
        name: 'TomHi',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/909-Dirt/Tom-Hi.wav`,
      },
      {
        id: 6,
        name: 'TomLo',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/909-Dirt/Tom-Lo.wav`,
      },
    ],
  },
  {
    name: 'Fungus',
    samples: [
      {
        id: 7,
        name: 'Breathe',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Fungus/Breathe.wav`,
      },
      {
        id: 8,
        name: 'Climb-Up',
        emoji: '🎤',
        pitch: 'C2',
        url: `${audio_path}/Fungus/Climb-Up.wav`,
      },
      {
        id: 9,
        name: 'Flute-Dub',
        emoji: '🥁',
        pitch: 'C2',
        url: `${audio_path}/Fungus/Flute-Dub.wav`,
      },
      {
        id: 10,
        name: 'Helper',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Fungus/Helper.wav`,
      },
      {
        id: 11,
        name: 'Roads',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Fungus/Roads.wav`,
      },
      {
        id: 12,
        name: 'Soft-Stab',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Fungus/Soft-Stab.wav`,
      },
      {
        id: 13,
        name: 'Stoned',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Fungus/Stoned.wav`,
      },
      {
        id: 14,
        name: 'Swirls',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Fungus/Swirls.wav`,
      },
    ],
  },
  {
    name: 'Glitch',
    samples: [
      {
        id: 15,
        name: 'CH3A',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Glitch/CH3A.wav`,
      },
      {
        id: 16,
        name: 'Glitch2',
        emoji: '🎤',
        pitch: 'C2',
        url: `${audio_path}/Glitch/Glitch2.wav`,
      },
      {
        id: 17,
        name: 'Rev2',
        emoji: '🥁',
        pitch: 'C2',
        url: `${audio_path}/Glitch/Rev2.wav`,
      },
      {
        id: 18,
        name: 'Snap5Glitch',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Glitch/Snap5Glitch.wav`,
      },
      {
        id: 19,
        name: 'SynthNote',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Glitch/SynthNote.wav`,
      },
      {
        id: 20,
        name: 'TomMid',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Glitch/TomMid.wav`,
      },
    ],
  },
  {
    name: 'Kawaii',
    samples: [
      {
        id: 21,
        name: 'Air Bass_C2',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Kawaii/Air-Bass_C2.wav`,
      },
      {
        id: 22,
        name: 'Analog Strings_C3',
        emoji: '🎤',
        pitch: 'C2',
        url: `${audio_path}/Kawaii/Analog-Strings_C3.wav`,
      },
      {
        id: 23,
        name: 'Bell Air_C2',
        emoji: '🥁',
        pitch: 'C2',
        url: `${audio_path}/Kawaii/Bell-Air_C2.wav`,
      },
      {
        id: 24,
        name: 'Drops_C2',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Kawaii/Drops_C2.wav`,
      },
      {
        id: 25,
        name: 'Hologram_C2',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Kawaii/Hologram_C2.wav`,
      },
      {
        id: 26,
        name: 'Jazz Harp_C2',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Kawaii/Jazz-Harp_C2.wav`,
      },
    ],
  },
  {
    name: 'Soviet',
    samples: [
      {
        id: 27,
        name: 'Ataka Bass_C2',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Soviet/Ataka-Bass_C2.wav`,
      },
      {
        id: 28,
        name: 'Troika Pulse_C2',
        emoji: '🎤',
        pitch: 'C2',
        url: `${audio_path}/Soviet/Troika-Pulse_C2.wav`,
      },
      {
        id: 29,
        name: 'Wooden 5th_C2',
        emoji: '🥁',
        pitch: 'C2',
        url: `${audio_path}/Soviet/Wooden-5th_C2.wav`,
      },
      {
        id: 30,
        name: 'Zapoy Bass_C2',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Soviet/Zapoy-Bass_C2.wav`,
      },
      {
        id: 31,
        name: 'Harp_C5',
        emoji: '🎸',
        pitch: 'C2',
        url: `${audio_path}/Soviet/Harp_C5.wav`,
      },
    ],
  },
]

function assignIDs(packs: Packs) {
  packs.forEach((pack) => {
    pack.samples.forEach((sample) => {
      sample.id = crypto.getRandomValues(new Uint32Array(1))[0]
    })
  })
  return packs
}

export const packs = assignIDs(packs_noID)
