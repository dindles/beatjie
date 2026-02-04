import type { Sample } from '$lib/audio-classes/sample.svelte';
import type { MainAudioBus } from '$lib/audio-classes/main-audio-bus.svelte';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

const PATTERN_VERSION = 1;
const MIN_BPM = 60;
const MAX_BPM = 300;
const MAX_PACK_INDEX = 3;
const MAX_SAMPLE_ID = 31;
const SEQUENCE_LENGTH = 16;

// Defaults for omitting values during compression
const SAMPLE_DEFAULTS = {
  q: 0, // empty sequence
  t: '0', // default pitch
  e: false, // delay off
  r: false, // reverb off
  m: false // not muted
};

const MAIN_BUS_DEFAULTS = {
  h: false, // highpass off
  d: false // distortion off
};

export interface PatternData {
  version: 1;
  bpm: number;
  selected_pack_index: number;
  main_highpass: boolean;
  main_distortion: boolean;
  samples: Array<{
    id: number;
    sequence: boolean[];
    pitch: string;
    delay_active: boolean;
    reverb_active: boolean;
    muted: boolean;
  }>;
}

interface CompressedPatternData {
  v: 1;
  b: number;
  p: number;
  h?: boolean; // optional, default false
  d?: boolean; // optional, default false
  s: Array<{
    i: number;
    q?: number; // optional, default 0
    t?: string; // optional, default '0'
    e?: boolean; // optional, default false
    r?: boolean; // optional, default false
    m?: boolean; // optional, default false
  }>;
}

// === Compression helpers ===

/**
 * Pack a boolean[16] sequence into a 16-bit number
 */
function packSequence(sequence: boolean[]): number {
  return sequence.reduce((acc, val, i) => acc | ((val ? 1 : 0) << i), 0);
}

/**
 * Unpack a 16-bit number into a boolean[16] sequence
 */
function unpackSequence(packed: number): boolean[] {
  return Array.from({ length: SEQUENCE_LENGTH }, (_, i) => Boolean((packed >> i) & 1));
}

// === Serialization ===

/**
 * Serialize current pattern state into a PatternData object
 */
export function serializePattern(
  bpm: number,
  selected_pack_index: number,
  main_audio_bus: MainAudioBus,
  samples: Sample[]
): PatternData {
  return {
    version: PATTERN_VERSION,
    bpm,
    selected_pack_index,
    main_highpass: main_audio_bus.mainIsHighPassed,
    main_distortion: main_audio_bus.mainIsDistorted,
    samples: samples.map((sample) => ({
      id: sample.id,
      sequence: [...sample.sequence],
      pitch: sample.pitch,
      delay_active: sample.delay_is_active,
      reverb_active: sample.reverb_is_active,
      muted: sample.is_muted
    }))
  };
}

/**
 * Compress PatternData for URL encoding (omits default values)
 */
function compressPattern(pattern: PatternData): CompressedPatternData {
  return {
    v: pattern.version,
    b: pattern.bpm,
    p: pattern.selected_pack_index,
    ...(pattern.main_highpass && { h: true }),
    ...(pattern.main_distortion && { d: true }),
    s: pattern.samples.map((sample) => {
      const q = packSequence(sample.sequence);
      return {
        i: sample.id,
        ...(q !== SAMPLE_DEFAULTS.q && { q }),
        ...(sample.pitch !== SAMPLE_DEFAULTS.t && { t: sample.pitch }),
        ...(sample.delay_active && { e: true }),
        ...(sample.reverb_active && { r: true }),
        ...(sample.muted && { m: true })
      };
    })
  };
}

/**
 * Decompress PatternData from URL encoding (applies defaults)
 */
function decompressPattern(compressed: CompressedPatternData): PatternData {
  return {
    version: compressed.v,
    bpm: compressed.b,
    selected_pack_index: compressed.p,
    main_highpass: compressed.h ?? MAIN_BUS_DEFAULTS.h,
    main_distortion: compressed.d ?? MAIN_BUS_DEFAULTS.d,
    samples: compressed.s.map((sample) => ({
      id: sample.i,
      sequence: unpackSequence(sample.q ?? SAMPLE_DEFAULTS.q),
      pitch: sample.t ?? SAMPLE_DEFAULTS.t,
      delay_active: sample.e ?? SAMPLE_DEFAULTS.e,
      reverb_active: sample.r ?? SAMPLE_DEFAULTS.r,
      muted: sample.m ?? SAMPLE_DEFAULTS.m
    }))
  };
}

// === Validation ===

/**
 * Validate a PatternData object
 */
function deserializePattern(data: unknown): PatternData | null {
  try {
    if (!data || typeof data !== 'object') {
      console.error('Pattern data is not an object');
      return null;
    }

    const pattern = data as Partial<PatternData>;

    // Check version
    if (pattern.version !== PATTERN_VERSION) {
      console.error(`Invalid pattern version: ${pattern.version}`);
      return null;
    }

    // Validate BPM
    if (typeof pattern.bpm !== 'number' || pattern.bpm < MIN_BPM || pattern.bpm > MAX_BPM) {
      console.error(`Invalid BPM: ${pattern.bpm}`);
      return null;
    }

    // Validate pack index
    if (
      typeof pattern.selected_pack_index !== 'number' ||
      pattern.selected_pack_index < 0 ||
      pattern.selected_pack_index > MAX_PACK_INDEX
    ) {
      console.error(`Invalid pack index: ${pattern.selected_pack_index}`);
      return null;
    }

    // Validate boolean flags
    if (typeof pattern.main_highpass !== 'boolean') {
      console.error('Invalid main_highpass flag');
      return null;
    }
    if (typeof pattern.main_distortion !== 'boolean') {
      console.error('Invalid main_distortion flag');
      return null;
    }

    // Validate samples array
    if (!Array.isArray(pattern.samples)) {
      console.error('Samples is not an array');
      return null;
    }

    // Validate each sample
    for (const sample of pattern.samples) {
      if (typeof sample.id !== 'number' || sample.id < 0 || sample.id > MAX_SAMPLE_ID) {
        console.error(`Invalid sample ID: ${sample.id}`);
        return null;
      }

      if (!Array.isArray(sample.sequence) || sample.sequence.length !== SEQUENCE_LENGTH) {
        console.error(`Invalid sequence length for sample ${sample.id}`);
        return null;
      }

      if (!sample.sequence.every((v) => typeof v === 'boolean')) {
        console.error(`Sequence contains non-boolean values for sample ${sample.id}`);
        return null;
      }

      if (typeof sample.pitch !== 'string') {
        console.error(`Invalid pitch for sample ${sample.id}`);
        return null;
      }

      if (typeof sample.delay_active !== 'boolean') {
        console.error(`Invalid delay_active for sample ${sample.id}`);
        return null;
      }

      if (typeof sample.reverb_active !== 'boolean') {
        console.error(`Invalid reverb_active for sample ${sample.id}`);
        return null;
      }

      if (typeof sample.muted !== 'boolean') {
        console.error(`Invalid muted for sample ${sample.id}`);
        return null;
      }
    }

    return pattern as PatternData;
  } catch (error) {
    console.error('Error deserializing pattern:', error);
    return null;
  }
}

// === URL Encoding ===

/**
 * Encode PatternData to an lz-string compressed URL-safe string
 */
function encodePatternToURL(pattern: PatternData): string {
  try {
    const compressed = compressPattern(pattern);
    const json = JSON.stringify(compressed);
    return compressToEncodedURIComponent(json);
  } catch (error) {
    console.error('Error encoding pattern to URL:', error);
    throw error;
  }
}

/**
 * Decode an lz-string compressed string to PatternData
 */
function decodePatternFromURL(encoded: string): PatternData | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const compressed = JSON.parse(json) as CompressedPatternData;
    const pattern = decompressPattern(compressed);
    return deserializePattern(pattern);
  } catch (error) {
    console.error('Error decoding pattern from URL:', error);
    return null;
  }
}

// === URL Helpers ===

/**
 * Get pattern from current URL hash fragment
 */
export function getPatternFromURL(): PatternData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const hash = window.location.hash.slice(1); // Remove leading #

    if (!hash) {
      return null;
    }

    return decodePatternFromURL(hash);
  } catch (error) {
    console.error('Error getting pattern from URL:', error);
    return null;
  }
}

/**
 * Create a shareable URL from PatternData
 */
export function createShareURL(pattern: PatternData): string {
  const encoded = encodePatternToURL(pattern);
  const base_url = `${window.location.origin}${window.location.pathname}`;
  return `${base_url}#${encoded}`;
}
