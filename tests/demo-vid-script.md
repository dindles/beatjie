# Beatjie Tutorial Video Script

This script outlines the voiceover, actions, and visual highlights for the tutorial demo video.

**Legend:**
- 💬 Voiceover narration
- 🎬 Action to perform
- ✨ Visual highlight/spotlight cue
- ⏸️ Pause for effect

---

## Scene 1: Introduction

💬 "This is beatjie"

🎬 Click audio context confirm button (👍)

⏸️ Wait for loading to complete

---

## Scene 2: Sample Introduction

💬 "These are your samples"

✨ Highlight visible sample area

💬 "Select one to hear it and get started"

🎬 Select kick sample (first sample in pack)

---

## Scene 3: Sequencer Basics

💬 "Each sample has its own 16-step sequencer"

✨ Highlight sequencer

💬 "Select a step to add the active sample"

🎬 Add kick to steps 1, 5, 9, and 13

✨ Highlight the four steps as they're added

💬 "Press play to hear your pattern"

✨ Highlight play button

🎬 Click play button (▶)

⏸️ Let pattern play for a moment

---

## Scene 4: Adding More Samples

💬 "Let's add more samples"

🎬 Select clap sample (👏)

🎬 Add claps to steps 5 and 13

---

## Scene 5: Preview Toggle

💬 "We can toggle the preview button if we only want to hear sounds in the sequencer"

🎬 Click "disable sample preview" button

---

## Scene 6: Pack Navigation

💬 "We can navigate between sample packs here"

✨ Highlight pack selector

🎬 Click pack 1 button

🎬 Select hi-hat sample (🎩)

🎬 Add hi-hats to steps 3, 7, 11, and 15

---

## Scene 7: Sample Effects

💬 "Each sample has its own effects rack"

✨ Highlight sample effects section

🎬 Toggle reverb on hi-hat (😶‍🌫️ button)

⏸️ Let it play with reverb

---

## Scene 8: Global Effects & BPM

💬 "You can toggle pattern-wide effects and set the BPM here"

✨ Highlight global effects and BPM controls

🎬 Engage pattern high-pass filter (🫴 button)

🎬 Increase BPM (adjust slider or click + button)

⏸️ Let pattern play at new tempo

---

## Scene 9: Pitch Adjustment

🎬 Select log sample (🪵)

🎬 Adjust log pitch (move pitch slider)

🎬 Add log steps to sequencer (steps 4, 7, 11)

---

## Scene 10: More Effects

🎬 Engage hi-hat delay (🎵 button)

🎬 Disengage global high-pass filter (🫴 button)

⏸️ Let pattern play with new effects

---

## Scene 11: Color Customization

💬 "Change colour modes here"

✨ Highlight color mode buttons

🎬 Cycle through color modes (🪞, 🎨, 🤩, 🪩 buttons)

---

## Scene 12: Pattern Sharing

💬 "Share your pattern via URL here"

✨ Highlight sharing button

🎬 Click share button (🔗)

⏸️ Brief pause to show share confirmation

---

## Scene 13: Final Touches

🎬 Slowly decrease BPM (adjust slider down)

🎬 Select mmhmm sample

🎬 Add mmhmm to pattern

💬 "Or delete it and make another one"

🎬 Click delete button (🗑)

---

## Scene 14: Closing Screen

✨ Display keyboard shortcuts overlay

💬 "Have fun, make beats"

Text on screen: "P.L.U.R." (Peace, Love, Unity, Respect)

---

## Notes for Implementation

- Demo mode active: `?demo=true` (tooltips hidden, pack 0 selected)
- Use `page.waitForTimeout()` between major sections (1-2 seconds)
- Audio playback continues during actions - timing is important
- Visual highlights will need to be added post-production or via spotlight mode (future feature)
- Consider adding subtle mouse movements for emphasis using Playwright's `page.mouse.move()`
