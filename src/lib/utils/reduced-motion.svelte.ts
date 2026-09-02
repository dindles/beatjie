// reactive prefers-reduced-motion: follows the OS setting if it changes while the app is open
let reduced_motion = $state(false)

if (typeof window !== 'undefined') {
  const media_query = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduced_motion = media_query.matches
  media_query.addEventListener('change', (event) => {
    reduced_motion = event.matches
  })
}

export function prefersReducedMotion(): boolean {
  return reduced_motion
}
