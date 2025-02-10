<script lang="ts">
  import * as Tone from 'tone'

  let hue_emoji_rotation = $state(0)
  let user_lightness = $state(0.8) // 0 - 1
  const CHROMA = 0.2 // 0 - 0.4
  let user_hue = $state(250) // 0 - 360
  let user_colour = $derived(`oklch(${user_lightness} ${CHROMA} ${user_hue})`)
  let black_or_white = $state('oklch(0 0 0)')
  let theme = $state('light')
  let disco_toggle = $state(false)

  function changeHue() {
    user_hue = user_hue + 50
    if (user_hue > 300) user_hue = 50
  }

  function changeLightness() {
    user_lightness = user_lightness === 0.8 ? 0.5 : 0.8
  }

  function cycleTheme() {
    theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'disco' : 'light'
    black_or_white = theme === 'light' ? 'oklch(0 0 0)' : 'oklch(1 0 0)'
  }

  $effect(() => {
    if (theme === 'disco') {
      const interval = Tone.getTransport().scheduleRepeat(() => {
        black_or_white =
          black_or_white === 'oklch(0 0 0)' ? 'oklch(1 0 0)' : 'oklch(0 0 0)'
      }, '4n')
      return () => Tone.getTransport().clear(interval)
    }
  })

  $effect(() => {
    document.documentElement.style.setProperty('--user-colour', user_colour)
    document.documentElement.style.setProperty(
      '--black-or-white',
      theme === 'disco'
        ? disco_toggle
          ? user_colour
          : black_or_white
        : black_or_white
    )
  })
</script>

<div class="color-controls">
  <button
    class="hue-control emoji-small"
    style="transform: rotate({hue_emoji_rotation}deg)"
    onclick={() => {
      hue_emoji_rotation += 90
      changeHue()
    }}>🎨</button
  >
  <button class="light-dark emoji-small" onclick={cycleTheme}>
    {theme === 'light' ? '🌞' : theme === 'dark' ? '🌛' : '🪩'}
  </button>
  <button class="emoji-small" onclick={changeLightness}
    >{user_lightness === 0.8 ? '🤩' : '😎'}</button
  >
</div>

<style>
  .color-controls {
    display: flex;
    justify-content: center;
    gap: 10vmin;
  }
  .hue-control {
    transition: transform 0.3s ease;
  }
</style>
