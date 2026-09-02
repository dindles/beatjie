// prints the rendered sRGB colour and WCAG contrast for every hue preset in both themes,
// mirroring calculateChroma() in src/lib/utils/colour.ts. run with: pnpm contrast
const HUES = [30, 90, 140, 200, 280, 330]
const THEMES = [
  { label: 'light theme (colour on black)', lightness: 0.9, background_y: 0 },
  { label: 'dark theme  (colour on white)', lightness: 0.45, background_y: 1 }
]

function calculateChroma(lightness) {
  return 0.15 + 0.1 * (1 - Math.abs(lightness - 0.5) * 2)
}

function oklchToLinearSrgb(lightness, chroma, hue) {
  const a = chroma * Math.cos((hue * Math.PI) / 180)
  const b = chroma * Math.sin((hue * Math.PI) / 180)
  const lms_l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const lms_m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const lms_s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * lms_l - 3.3077115913 * lms_m + 0.2309699292 * lms_s,
    -1.2684380046 * lms_l + 2.6097574011 * lms_m - 0.0041960863 * lms_s,
    -0.0041960863 * lms_l - 0.7034186147 * lms_m + 1.707614701 * lms_s
  ]
}

const clamp = (value) => Math.min(1, Math.max(0, value))

function luminance(linear_rgb) {
  const [r, g, b] = linear_rgb.map(clamp)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(y1, y2) {
  const [lighter, darker] = y1 > y2 ? [y1, y2] : [y2, y1]
  return (lighter + 0.05) / (darker + 0.05)
}

function toHex(linear_rgb) {
  return (
    '#' +
    linear_rgb
      .map((channel) =>
        Math.round(clamp(channel) ** (1 / 2.2) * 255)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  )
}

for (const { label, lightness, background_y } of THEMES) {
  console.log(`\n${label}, L=${lightness}, C=${calculateChroma(lightness).toFixed(3)}`)
  for (const hue of HUES) {
    const rgb = oklchToLinearSrgb(lightness, calculateChroma(lightness), hue)
    const in_gamut = rgb.every((channel) => channel >= -0.005 && channel <= 1.005)
    const ratio = contrast(luminance(rgb), background_y)
    console.log(
      `  hue ${String(hue).padStart(3)}  ${toHex(rgb)}  ${ratio.toFixed(2)}:1  ${in_gamut ? 'in gamut' : 'clipped'}`
    )
  }
}
