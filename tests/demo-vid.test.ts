import { expect, test } from '@playwright/test';

test('Beatjie Tutorial Demo', async ({ page }) => {
  // ========================================
  // Scene 1: Introduction
  // ========================================
  await page.goto('http://localhost:5173/?demo=true');

  // VO: "This is beatjie"
  // Wait for initial animations
  await page.waitForTimeout(1000);
  // Click audio context confirm
  // Visual cue: 👍 button pulse
  await page.getByRole('button', { name: '👍' }).click();

  // Wait for loading to complete
  await page.waitForTimeout(1000);

  // ========================================
  // Scene 2: Sample Introduction
  // ========================================

  // VO: "These are your samples"
  // Visual cue: sample button section spotlight, all other UI dimmed
  // VO: "Select one to hear it and get started"
  await page.waitForTimeout(1500);

  // Select kick sample (🥾)
  // Visual cue: selected sample button pulses
  await page.getByRole('button', { name: '🥾' }).click();
  await page.waitForTimeout(800);
  // Visual cue: sample button section unspotlighted

  // ========================================
  // Scene 3: Sequencer Basics
  // ========================================

  // VO: "Each sample has its own 16-step sequencer"
  // Visual cue: sequencer spotlight, all other UI dimmed
  // VO: "Select a step to add the active sample"
  await page.waitForTimeout(1500);

  // Add kick to steps 1, 5, 9, 13 (visually: beats 1, 2, 3, 4)
  await page.locator('.sequencer > button:nth-child(1)').click();
  // Visual cue: selected sequencer step pulses
  await page.waitForTimeout(300);
  await page.locator('.sequencer > button:nth-child(5)').click();
  // Visual cue: selected sequencer step pulses
  await page.waitForTimeout(300);
  await page.locator('.sequencer > button:nth-child(9)').click();
  // Visual cue: selected sequencer step pulses
  await page.waitForTimeout(300);
  await page.locator('.sequencer > button:nth-child(13)').click();
  // Visual cue: selected sequencer step pulses
  await page.waitForTimeout(1000);
  // Visual cue: sequencer unspotlighted

  // VO: "Press play to hear your pattern"
  // Click play button
  await page.getByRole('button', { name: '▶' }).click();

  // Let pattern play
  await page.waitForTimeout(3000);

  // ========================================
  // Scene 4: Adding More Samples
  // ========================================

  // VO: "Let's add more samples"
  // Select clap sample (👏)
  await page.getByRole('button', { name: '👏' }).click();
  // Visual cue: selected sample button pulses
  await page.waitForTimeout(500);

  // Add claps to steps 5 and 13 (on the backbeat)
  await page.locator('.sequencer > button:nth-child(5)').click();
  // Visual cue: selected sequencer step pulses
  await page.waitForTimeout(300);
  await page.locator('.sequencer > button:nth-child(13)').click();
  // Visual cue: selected sequencer step pulses
  await page.waitForTimeout(2000);

  // ========================================
  // Scene 5: Preview Toggle
  // ========================================

  // VO: "We can toggle the audition button if we only want to hear sounds in the sequencer"
  // Visual cue: audition button spotlight, all other UI dimmed
  await page.getByRole('button', { name: 'disable sample preview' }).click();
  // Visual cue: audition button pulses
  await page.waitForTimeout(1500);

  // ========================================
  // Scene 6: Pack Navigation
  // ========================================

  // VO: "We can navigate between sample packs here"
  await page.waitForTimeout(1000);
  // Visual cue: pack navigation spotlight, all other UI dimmed

  // Switch to pack 1
  await page.getByRole('button', { name: '1' }).click();
  // Visual cue: selected pack button pulses
  await page.waitForTimeout(800);

  // Select hi-hat sample (🎩)
  await page.getByRole('button', { name: '🎩' }).click();
  await page.waitForTimeout(500);

  // Add hi-hats to steps 3, 7, 11, 15 (off-beats)
  await page.locator('.sequencer > button:nth-child(3)').click();
  await page.waitForTimeout(300);
  await page.locator('.sequencer > button:nth-child(7)').click();
  await page.waitForTimeout(300);
  await page.locator('.sequencer > button:nth-child(11)').click();
  await page.waitForTimeout(300);
  await page.locator('.sequencer > button:nth-child(15)').click();
  await page.waitForTimeout(2000);

  // ========================================
  // Scene 7: Sample Effects
  // ========================================

  // VO: "Each sample has its own effects rack"
  await page.waitForTimeout(1000);
  // Visual cue: sample effects section spotlight, all other UI dimmed

  // Toggle reverb on hi-hat (😶‍🌫️)
  await page.getByRole('button', { name: '😶‍🌫️' }).click();
  // Visual cue: reverb button pulses
  await page.waitForTimeout(2000);
  // Visual cue: sample effects section unspotlighted

  // ========================================
  // Scene 8: Global Effects & BPM
  // ========================================

  // VO: "You can toggle pattern-wide effects and set the BPM here"
  await page.waitForTimeout(1000);
  // Visual cue: transport/global effects section spotlight, all other UI dimmed

  // Engage pattern high-pass filter (🫴)
  await page.getByRole('button', { name: '🫴' }).click();
  // Visual cue: high-pass filter button pulses
  await page.waitForTimeout(1500);

  // Increase BPM
  // Visual cue: BPM control pulses
  // Note: This might need adjustment based on actual BPM control implementation
  await page.waitForTimeout(1500);
  // Visual cue: transport/global effects section unspotlighted

  // ========================================
  // Scene 9: Pitch Adjustment
  // ========================================

  // Select log sample (🪵)
  await page.getByRole('button', { name: '🪵' }).click();
  // Visual cue: selected sample button pulses
  await page.waitForTimeout(500);

  // Adjust log pitch (🎵 appears to be pitch control in the recorded test)
  // Visual cue: pitch control section spotlight
  await page.getByRole('button', { name: '🎵' }).click();
  // Visual cue: pitch button pulses
  await page.waitForTimeout(300);
  // Visual cue: pitch control unspotlighted

  // Add log steps (1, 4, 7, 11)
  await page.locator('.sequencer > button:nth-child(1)').click();
  // Visual cue: selected sequencer step pulses
  await page.waitForTimeout(300);
  await page.locator('.sequencer > button:nth-child(4)').click();
  // Visual cue: selected sequencer step pulses
  await page.waitForTimeout(300);
  await page.locator('.sequencer > button:nth-child(7)').click();
  // Visual cue: selected sequencer step pulses
  await page.waitForTimeout(300);
  await page.locator('.sequencer > button:nth-child(11)').click();
  // Visual cue: selected sequencer step pulses
  await page.waitForTimeout(2000);

  // ========================================
  // Scene 10: More Effects
  // ========================================

  // Engage hi-hat delay
  // (Need to select hi-hat first)
  await page.getByRole('button', { name: '🎩' }).click();
  // Visual cue: selected sample button pulses
  await page.waitForTimeout(300);
  // Visual cue: sample effects section spotlight
  // Toggle delay (button varies by sample)
  await page.waitForTimeout(2000);
  // Visual cue: delay button pulses
  // Visual cue: sample effects section unspotlighted

  // Disengage global filter (🫴)
  await page.getByRole('button', { name: '🫴' }).click();
  // Visual cue: high-pass filter button pulses
  await page.waitForTimeout(2000);

  // ========================================
  // Scene 11: Color Customization
  // ========================================

  // VO: "Change colour modes here"
  await page.waitForTimeout(1000);
  // Visual cue: color mode buttons spotlight, all other UI dimmed

  // Cycle through color modes (🪞, 🎨, 🤩, 🪩)
  await page.getByRole('button', { name: '🪞' }).click();
  // Visual cue: selected color button pulses, color scheme transitions
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: '🎨' }).click();
  // Visual cue: selected color button pulses, color scheme transitions
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: '🤩' }).click();
  // Visual cue: selected color button pulses, color scheme transitions
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: '🪩' }).click();
  // Visual cue: selected color button pulses, color scheme transitions
  await page.waitForTimeout(1500);
  // Visual cue: color mode buttons unspotlighted

  // ========================================
  // Scene 12: Pattern Sharing
  // ========================================

  // VO: "Share your pattern via URL here"
  await page.waitForTimeout(2000);
  // Visual cue: share button spotlight, all other UI dimmed

  // Click share button (🔗)
  await page.getByRole('button', { name: '🔗' }).click();
  // Visual cue: share button pulses, URL copy confirmation animation
  await page.waitForTimeout(2000);
  // Visual cue: share button unspotlighted

  // ========================================
  // Scene 13: Final Touches
  // ========================================

  // Slowly decrease BPM (implementation depends on BPM controls)
  // Visual cue: BPM control spotlight
  await page.waitForTimeout(3000);
  // Visual cue: BPM value animates downward
  // Visual cue: BPM control unspotlighted

  // VO: "Or delete it and make another one"
  // Visual cue: delete button spotlight
  // Click delete button (🗑)
  await page.getByRole('button', { name: '🗑' }).click();
  // Visual cue: delete button pulses, pattern clears with animation
  await page.waitForTimeout(1500);
  // Visual cue: delete button unspotlighted

  // ========================================
  // Scene 14: Closing
  // ========================================

  // VO: "Have fun, make beats. P.L.U.R."
  // Visual cue: all spotlights off, full UI visible
  // Visual cue: fade to keyboard shortcuts overlay
  await page.waitForTimeout(2000);
});
