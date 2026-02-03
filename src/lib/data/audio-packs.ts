import { resolve } from '$app/paths';
import type { Packs } from '$lib/types/audio';

// @ts-expect-error - resolve types are generated from routes, but it accepts any pathname
const audio_path = resolve('/audio');

export const packs: Packs = [
  {
    name: '0',
    samples: [
      { id: 0, emoji: '🥾', url: `${audio_path}/0/0_kick-909.mp3` },
      { id: 1, emoji: '👏', url: `${audio_path}/0/1_clap.mp3` },
      { id: 2, emoji: '🪤', url: `${audio_path}/0/2_snare.mp3` },
      { id: 3, emoji: '🪖', url: `${audio_path}/0/3_ch2.mp3` },
      { id: 4, emoji: '🧢', url: `${audio_path}/0/4_oh.mp3` },
      { id: 5, emoji: '👨', url: `${audio_path}/0/5_tom.mp3` },
      { id: 6, emoji: '🐮', url: `${audio_path}/0/6_cow.mp3` },
      { id: 7, emoji: '👍', url: `${audio_path}/0/7_yeah.mp3` }
    ]
  },
  {
    name: '1',
    samples: [
      { id: 8, emoji: '🛼', url: `${audio_path}/1/0_kick-505.mp3` },
      { id: 9, emoji: '🪵', url: `${audio_path}/1/1_rim.mp3` },
      { id: 10, emoji: '🎩', url: `${audio_path}/1/2_ch.mp3` },
      { id: 11, emoji: '🪇', url: `${audio_path}/1/3_shaker.mp3` },
      { id: 12, emoji: '💥', url: `${audio_path}/1/4_crash.mp3` },
      { id: 13, emoji: '💧', url: `${audio_path}/1/5_droplet.mp3` },
      { id: 14, emoji: '🫨', url: `${audio_path}/1/6_spring.mp3` },
      { id: 15, emoji: '💅', url: `${audio_path}/1/7_mhm.mp3` }
    ]
  },
  {
    name: '2',
    samples: [
      { id: 16, emoji: '🏠', url: `${audio_path}/2/0_house.mp3` },
      { id: 17, emoji: '🛖', url: `${audio_path}/2/1_hut.mp3` },
      { id: 18, emoji: '🔈', url: `${audio_path}/2/2_bass.mp3` },
      { id: 19, emoji: '🧘', url: `${audio_path}/2/3_yoga.mp3` },
      { id: 20, emoji: '🎸', url: `${audio_path}/2/4_standup.mp3` },
      { id: 21, emoji: '🪈', url: `${audio_path}/2/5_flute.mp3` },
      { id: 22, emoji: '🚗', url: `${audio_path}/2/6_rhodes.mp3` },
      { id: 23, emoji: '🧗', url: `${audio_path}/2/7_climb.mp3` }
    ]
  },
  {
    name: '3',
    samples: [
      { id: 24, emoji: '🥰', url: `${audio_path}/3/0_i-love-you.mp3` },
      { id: 25, emoji: '🛸', url: `${audio_path}/3/1_spaceship.mp3` },
      { id: 26, emoji: '🧊', url: `${audio_path}/3/2_ice.mp3` },
      { id: 27, emoji: '🐋', url: `${audio_path}/3/3_sonar.mp3` },
      { id: 28, emoji: '🥂', url: `${audio_path}/3/4_tink.mp3` },
      { id: 29, emoji: '🐶', url: `${audio_path}/3/5_woof.mp3` },
      { id: 30, emoji: '🤫', url: `${audio_path}/3/6_shh.mp3` },
      { id: 31, emoji: '😱', url: `${audio_path}/3/7_scream.mp3` }
    ]
  }
];
