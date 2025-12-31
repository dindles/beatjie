// pattern-sharing.ts
import type { Sample } from '$lib/classes/audio-models.svelte';
import type { AudioChain } from '$lib/classes/audio-chain.svelte';

const PATTERN_VERSION = 1;
const MIN_BPM = 60;
const MAX_BPM = 300;
const MAX_PACK_INDEX = 3;
const MAX_SAMPLE_ID = 31;
const SEQUENCE_LENGTH = 16;

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
  h: boolean;
  d: boolean;
  s: Array<{
    i: number;
    q: number;
    t: string;
    e: boolean;
    r: boolean;
    m: boolean;
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
  audio_chain: AudioChain,
  samples: Sample[]
): PatternData {
  return {
    version: PATTERN_VERSION,
    bpm,
    selected_pack_index,
    main_highpass: audio_chain.mainIsHighPassed,
    main_distortion: audio_chain.mainIsDistorted,
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
 * Compress PatternData for URL encoding
 */
function compressPattern(pattern: PatternData): CompressedPatternData {
  return {
    v: pattern.version,
    b: pattern.bpm,
    p: pattern.selected_pack_index,
    h: pattern.main_highpass,
    d: pattern.main_distortion,
    s: pattern.samples.map((sample) => ({
      i: sample.id,
      q: packSequence(sample.sequence),
      t: sample.pitch,
      e: sample.delay_active,
      r: sample.reverb_active,
      m: sample.muted
    }))
  };
}

/**
 * Decompress PatternData from URL encoding
 */
function decompressPattern(compressed: CompressedPatternData): PatternData {
  return {
    version: compressed.v,
    bpm: compressed.b,
    selected_pack_index: compressed.p,
    main_highpass: compressed.h,
    main_distortion: compressed.d,
    samples: compressed.s.map((sample) => ({
      id: sample.i,
      sequence: unpackSequence(sample.q),
      pitch: sample.t,
      delay_active: sample.e,
      reverb_active: sample.r,
      muted: sample.m
    }))
  };
}

// === Validation ===

/**
 * Validate a PatternData object
 */
export function deserializePattern(data: unknown): PatternData | null {
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
    if (
      typeof pattern.bpm !== 'number' ||
      pattern.bpm < MIN_BPM ||
      pattern.bpm > MAX_BPM
    ) {
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
 * Encode PatternData to a base64url string
 */
export function encodePatternToURL(pattern: PatternData): string {
  try {
    const compressed = compressPattern(pattern);
    const json = JSON.stringify(compressed);

    // Convert to base64url (URL-safe variant)
    const base64 = btoa(json);
    const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return base64url;
  } catch (error) {
    console.error('Error encoding pattern to URL:', error);
    throw error;
  }
}

/**
 * Decode a base64url string to PatternData
 */
export function decodePatternFromURL(encoded: string): PatternData | null {
  try {
    // Convert from base64url to base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    const json = atob(base64);
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
 * Get pattern from current URL query parameters
 */
export function getPatternFromURL(): PatternData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('pattern');

    if (!encoded) {
      return null;
    }

    return decodePatternFromURL(encoded);
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
  return `${base_url}?pattern=${encoded}`;
}
