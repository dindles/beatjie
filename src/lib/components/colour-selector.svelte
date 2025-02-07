<script lang="ts">
  // Colour
  let hue_emoji_rotation = $state(0)

  let user_lightness = $state(0.8) //0-1
  const CHROMA = 0.2 //0-0.4
  let user_hue = $state(250) //0-360

  let user_colour = $derived(`oklch(${user_lightness} ${CHROMA} ${user_hue})`)

  let black_or_white = $state('oklch(0 0 0)') // black

  function changeHue() {
    user_hue = user_hue + 50
    if (user_hue > 300) {
      user_hue = 50
    }
  }

  function changeLightness() {
    user_lightness = user_lightness === 0.8 ? 0.5 : 0.8
  }

  function switchLightDark() {
    black_or_white =
      black_or_white === 'oklch(1 0 0)' ? 'oklch(0 0 0)' : 'oklch(1 0 0)'
  }

  // sets css variables (defined in app.css)
  $effect(() => {
    document.documentElement.style.setProperty('--user-colour', user_colour)
    document.documentElement.style.setProperty(
      '--black-or-white',
      black_or_white
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
  <button class="light-dark emoji-small" onclick={() => switchLightDark()}>
    {black_or_white === 'oklch(1 0 0)' ? '🌞' : '🌛'}
  </button>
  <button class="emoji-small" onclick={() => changeLightness()}
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
