# todo

http://the-veld.local/5173
future: threlte visualiser?

<!-- todo -->

- selected sample and play button big square
- responsiveness should be sizes of div and text, not number grid cols per div

- bpm
- space to start/stop transport

third selected sample settings category is attack/decay time
add settings button
add colour
add messages to display
function displayMessage(message) {
case (sample_prompt) {
displayText = 'choose a sample'
}
}

- styels bois - new approach: it's grids all the way down
  - grid approach in vanilla
  - grid approach in tailwind
- add touch indicator style
- add bpm
- add delay
- try short decay reverb?
- randomise pack on mount
- add const main_analyser_fft = new Tone.Analyser('fft', main_init.analyser_resolution) and add toggles between waveform and fft

## colour

- (check in draw function for canvas bg and stroke colours)
- all backgrounds are black
- set global color variable in js. $state()
- set hue and vibe variables, sliders
- can be global_colour or inverse, which makes background global_colour and foreground black

## samples

- create samples
- load samples

## config

- allow user to set:
  - hp freq
  - lp freq
  - bpm options
  - other fx?
  - easter egg
