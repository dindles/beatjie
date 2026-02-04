import { resolve } from '$app/paths';
import type { Packs } from '$lib/types/audio';

// @ts-expect-error - resolve types are generated from routes, but it accepts any pathname
const audio_path = resolve('/audio');

export const packs: Packs = [
  {
    name: '0',
    samples: [
      {
        id: 0,
        name: 'kick',
        emoji: '🥾',
        url: `${audio_path}/0/0_kick-909.mp3`,
        gain_adjustment: 2
      },
      { id: 1, name: 'clap', emoji: '👏', url: `${audio_path}/0/1_clap.mp3` },
      { id: 2, name: 'snare', emoji: '🪤', url: `${audio_path}/0/2_snare.mp3` },
      { id: 3, name: 'closed hat', emoji: '🪖', url: `${audio_path}/0/3_ch2.mp3` },
      { id: 4, name: 'open hat', emoji: '🧢', url: `${audio_path}/0/4_oh.mp3` },
      { id: 5, name: 'tom', emoji: '👨', url: `${audio_path}/0/5_tom.mp3` },
      { id: 6, name: 'cowbell', emoji: '🐮', url: `${audio_path}/0/6_cow.mp3` },
      { id: 7, name: 'yeah', emoji: '👍', url: `${audio_path}/0/7_yeah.mp3` }
    ]
  },
  {
    name: '1',
    samples: [
      { id: 8, name: 'kick', emoji: '🛼', url: `${audio_path}/1/0_kick-505.mp3` },
      { id: 9, name: 'rim', emoji: '🪵', url: `${audio_path}/1/1_rim.mp3` },
      { id: 10, name: 'closed hat', emoji: '🎩', url: `${audio_path}/1/2_ch.mp3` },
      { id: 11, name: 'shaker', emoji: '🪇', url: `${audio_path}/1/3_shaker.mp3` },
      { id: 12, name: 'crash', emoji: '💥', url: `${audio_path}/1/4_crash.mp3` },
      { id: 13, name: 'droplet', emoji: '💧', url: `${audio_path}/1/5_droplet.mp3` },
      { id: 14, name: 'spring', emoji: '🫨', url: `${audio_path}/1/6_spring.mp3` },
      { id: 15, name: 'mhm', emoji: '💅', url: `${audio_path}/1/7_mhm.mp3`, gain_adjustment: -1 }
    ]
  },
  {
    name: '2',
    samples: [
      { id: 16, name: 'house', emoji: '🏠', url: `${audio_path}/2/0_house.mp3` },
      { id: 17, name: 'hut', emoji: '🛖', url: `${audio_path}/2/1_hut.mp3`, gain_adjustment: 6 },
      { id: 18, name: 'bass', emoji: '🔈', url: `${audio_path}/2/2_bass.mp3` },
      { id: 19, name: 'yoga', emoji: '🧘', url: `${audio_path}/2/3_yoga.mp3` },
      { id: 20, name: 'standup', emoji: '🎸', url: `${audio_path}/2/4_standup.mp3` },
      { id: 21, name: 'flute', emoji: '🪈', url: `${audio_path}/2/5_flute.mp3` },
      { id: 22, name: 'rhodes', emoji: '🚗', url: `${audio_path}/2/6_rhodes.mp3` },
      { id: 23, name: 'climb', emoji: '🧗', url: `${audio_path}/2/7_climb.mp3` }
    ]
  },
  {
    name: '3',
    samples: [
      { id: 24, name: 'i love you', emoji: '🥰', url: `${audio_path}/3/0_i-love-you.mp3` },
      { id: 25, name: 'spaceship', emoji: '🛸', url: `${audio_path}/3/1_spaceship.mp3` },
      { id: 26, name: 'ice', emoji: '🧊', url: `${audio_path}/3/2_ice.mp3` },
      { id: 27, name: 'sonar', emoji: '🐋', url: `${audio_path}/3/3_sonar.mp3` },
      { id: 28, name: 'tink', emoji: '🥂', url: `${audio_path}/3/4_tink.mp3` },
      { id: 29, name: 'woof', emoji: '🐶', url: `${audio_path}/3/5_woof.mp3` },
      { id: 30, name: 'shh', emoji: '🤫', url: `${audio_path}/3/6_shh.mp3` },
      { id: 31, name: 'scream', emoji: '😱', url: `${audio_path}/3/7_scream.mp3` }
    ]
  }
];
