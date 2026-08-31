#!/usr/bin/env node

/**
 * Deterministically generates the original ROYAL ORACLE sound library.
 *
 * No samples, recordings, game audio, or third-party sound libraries are used.
 * Every waveform is assembled below from oscillators, shaped noise, and envelopes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SAMPLE_RATE = 24_000;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'assets', 'audio', 'royal-oracle');
const TAU = Math.PI * 2;

function rng(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function createScene(name, duration, seed, compose) {
  const samples = new Float64Array(Math.ceil(duration * SAMPLE_RATE));
  const random = rng(seed);
  const helpers = makeHelpers(samples, random);
  compose(helpers);
  const peak = samples.reduce((maximum, sample) => Math.max(maximum, Math.abs(sample)), 0) || 1;
  const scale = 0.91 / Math.max(0.91, peak);
  for (let index = 0; index < samples.length; index += 1) {
    const value = Math.tanh(samples[index] * scale * 1.12) / Math.tanh(1.12);
    samples[index] = Math.max(-1, Math.min(1, value * 0.91));
  }
  return { name, duration, samples };
}

function makeHelpers(samples, random) {
  const length = samples.length;
  const sampleIndex = seconds => Math.max(0, Math.floor(seconds * SAMPLE_RATE));
  const envelope = (position, total, attack = 0.06, release = 0.2) => {
    const attackSamples = Math.max(1, Math.floor(total * attack));
    const releaseSamples = Math.max(1, Math.floor(total * release));
    if (position < attackSamples) return position / attackSamples;
    if (position > total - releaseSamples) return Math.max(0, (total - position) / releaseSamples);
    return 1;
  };

  function tone(start, duration, frequency, endFrequency = frequency, gain = 0.2, options = {}) {
    const from = sampleIndex(start);
    const total = Math.max(1, sampleIndex(duration));
    let phase = options.phase || 0;
    for (let offset = 0; offset < total && from + offset < length; offset += 1) {
      const progress = offset / total;
      const currentFrequency = frequency > 0 && endFrequency > 0
        ? frequency * ((endFrequency / frequency) ** progress)
        : frequency;
      const vibrato = options.vibratoDepth
        ? Math.sin(TAU * (options.vibratoRate || 5) * offset / SAMPLE_RATE) * options.vibratoDepth
        : 0;
      phase += TAU * (currentFrequency + vibrato) / SAMPLE_RATE;
      const fundamental = options.wave === 'triangle'
        ? (2 / Math.PI) * Math.asin(Math.sin(phase))
        : options.wave === 'square'
          ? Math.sign(Math.sin(phase))
          : Math.sin(phase);
      const harmonic = options.harmonic ? Math.sin(phase * 2.01) * options.harmonic : 0;
      const shape = envelope(offset, total, options.attack ?? 0.04, options.release ?? 0.28);
      samples[from + offset] += (fundamental + harmonic) * gain * shape;
    }
  }

  function noise(start, duration, gain = 0.16, options = {}) {
    const from = sampleIndex(start);
    const total = Math.max(1, sampleIndex(duration));
    let low = 0;
    let previousLow = 0;
    const cutoffStart = options.cutoffStart || 1_800;
    const cutoffEnd = options.cutoffEnd || cutoffStart;
    for (let offset = 0; offset < total && from + offset < length; offset += 1) {
      const progress = offset / total;
      const cutoff = cutoffStart + (cutoffEnd - cutoffStart) * progress;
      const coefficient = Math.min(0.98, Math.max(0.005, TAU * cutoff / SAMPLE_RATE));
      const white = random() * 2 - 1;
      previousLow = low;
      low += coefficient * (white - low);
      const high = white - low;
      const band = low - previousLow;
      const value = options.mode === 'highpass' ? high : options.mode === 'bandpass' ? band * 8 : low;
      const pulse = options.pulseRate
        ? 0.45 + Math.max(0, Math.sin(TAU * options.pulseRate * offset / SAMPLE_RATE)) * 0.55
        : 1;
      samples[from + offset] += value * gain * envelope(offset, total, options.attack ?? 0.04, options.release ?? 0.28) * pulse;
    }
  }

  function click(time, gain = 0.35, pitch = 180) {
    tone(time, 0.085, pitch, 46, gain, { wave: 'triangle', attack: 0.005, release: 0.88, harmonic: 0.2 });
    noise(time, 0.045, gain * 0.38, { cutoffStart: 5_000, cutoffEnd: 900, mode: 'highpass', attack: 0.005, release: 0.9 });
  }

  function bubble(time, size = 0.5, gain = 0.14) {
    const duration = 0.09 + size * 0.14;
    const base = 360 + (1 - size) * 420;
    tone(time, duration, base, base * 2.5, gain, { attack: 0.03, release: 0.62, vibratoDepth: 10, vibratoRate: 9 });
  }

  function bell(time, base = 440, gain = 0.18, duration = 1.2) {
    tone(time, duration, base, base * 0.998, gain, { attack: 0.008, release: 0.86, harmonic: 0.28 });
    tone(time + 0.008, duration * 0.86, base * 1.5, base * 1.495, gain * 0.54, { attack: 0.008, release: 0.9 });
    tone(time + 0.014, duration * 0.72, base * 2.03, base * 2.01, gain * 0.33, { attack: 0.008, release: 0.92 });
  }

  function chord(time, frequencies, gain = 0.12, duration = 1.4, spread = 0.045) {
    frequencies.forEach((frequency, index) => bell(time + index * spread, frequency, gain / Math.sqrt(frequencies.length), duration));
  }

  return { tone, noise, click, bubble, bell, chord };
}

const scenes = [
  createScene('normal-underwater-spin.wav', 4.0, 0x0cea4810, ({ tone, noise, click, bubble, bell }) => {
    noise(0, 4, 0.09, { cutoffStart: 420, cutoffEnd: 1_300, pulseRate: 0.42, attack: 0.12, release: 0.18 });
    noise(0.2, 3.55, 0.055, { cutoffStart: 2_600, cutoffEnd: 720, mode: 'bandpass', pulseRate: 0.27 });
    bell(0.12, 330, 0.11, 1.45);
    bell(2.08, 392, 0.09, 1.25);
    [0.46, 1.18, 1.66, 2.48, 3.12, 3.55].forEach((time, index) => bubble(time, 0.22 + (index % 3) * 0.22, 0.09));
    [0.76, 1.56, 2.36, 3.18].forEach((time, index) => click(time, 0.13, 310 + index * 30));
    tone(0.3, 3.3, 92, 118, 0.045, { wave: 'triangle', attack: 0.2, release: 0.28, vibratoDepth: 2, vibratoRate: 0.55 });
  }),
  createScene('crown-goal.wav', 3.45, 0x600a11, ({ tone, noise, click, bell, chord }) => {
    tone(0.06, 0.42, 1_480, 1_720, 0.18, { vibratoDepth: 44, vibratoRate: 10, attack: 0.05, release: 0.28 });
    tone(0.06, 0.42, 1_900, 1_760, 0.09, { vibratoDepth: 31, vibratoRate: 10, attack: 0.05, release: 0.28 });
    [0.58, 0.82, 1.03, 1.22, 1.39].forEach((time, index) => click(time, 0.2 + index * 0.025, 145 + index * 8));
    click(1.58, 0.62, 128);
    noise(1.58, 0.72, 0.16, { cutoffStart: 550, cutoffEnd: 4_800, mode: 'bandpass', attack: 0.01, release: 0.45 });
    tone(1.6, 0.56, 240, 1_180, 0.11, { wave: 'triangle', attack: 0.01, release: 0.3 });
    noise(2.14, 0.43, 0.24, { cutoffStart: 4_800, cutoffEnd: 1_300, mode: 'highpass', pulseRate: 18, attack: 0.01, release: 0.65 });
    bell(2.23, 760, 0.16, 0.82);
    chord(2.42, [330, 415, 494, 659], 0.25, 0.94, 0.036);
  }),
  createScene('naoking-race.wav', 3.7, 0x7ace4810, ({ tone, noise, click, bell, chord }) => {
    [0.08, 0.48, 0.88].forEach(time => tone(time, 0.16, 620, 620, 0.2, { wave: 'triangle', attack: 0.02, release: 0.45 }));
    tone(1.24, 0.42, 860, 1_260, 0.24, { attack: 0.02, release: 0.4 });
    noise(1.22, 2.05, 0.12, { cutoffStart: 320, cutoffEnd: 3_800, mode: 'bandpass', pulseRate: 1.6, attack: 0.04, release: 0.22 });
    let time = 1.28;
    let gap = 0.21;
    let step = 0;
    while (time < 3.12) {
      click(time, 0.19 + (step % 3) * 0.025, 175 + (step % 2) * 60);
      time += gap;
      gap = Math.max(0.095, gap * 0.93);
      step += 1;
    }
    tone(2.4, 0.72, 190, 1_260, 0.1, { wave: 'triangle', attack: 0.03, release: 0.34 });
    bell(3.02, 988, 0.19, 0.68);
    chord(3.09, [294, 392, 494], 0.16, 0.58, 0.025);
  }),
  createScene('power-cut.wav', 0.92, 0x0ff4810, ({ tone, noise, click }) => {
    tone(0, 0.45, 118, 93, 0.18, { wave: 'triangle', attack: 0.05, release: 0.18, harmonic: 0.24 });
    noise(0, 0.38, 0.12, { cutoffStart: 620, cutoffEnd: 180, pulseRate: 22, attack: 0.04, release: 0.12 });
    [0.32, 0.365, 0.42].forEach((time, index) => click(time, 0.46 - index * 0.08, 310 + index * 170));
    tone(0.37, 0.39, 1_260, 42, 0.24, { wave: 'square', attack: 0.005, release: 0.82 });
    noise(0.38, 0.33, 0.22, { cutoffStart: 5_600, cutoffEnd: 90, mode: 'bandpass', attack: 0.005, release: 0.8 });
  }),
  createScene('distant-signal.wav', 1.45, 0x51a1a1, ({ tone, noise, bell }) => {
    noise(0, 1.45, 0.025, { cutoffStart: 190, cutoffEnd: 280, pulseRate: 0.6, attack: 0.2, release: 0.22 });
    bell(0.22, 660, 0.07, 0.72);
    tone(0.36, 0.46, 96, 142, 0.045, { wave: 'triangle', attack: 0.12, release: 0.54 });
    bell(0.94, 784, 0.055, 0.44);
  }),
  createScene('restart-surge.wav', 2.35, 0x7e57a7, ({ tone, noise, click, bell, chord }) => {
    [0.04, 0.24, 0.43].forEach((time, index) => click(time, 0.32 + index * 0.07, 120 + index * 85));
    noise(0.34, 1.46, 0.15, { cutoffStart: 110, cutoffEnd: 4_200, mode: 'bandpass', pulseRate: 4.5, attack: 0.02, release: 0.26 });
    tone(0.42, 1.25, 54, 280, 0.18, { wave: 'triangle', attack: 0.04, release: 0.3, harmonic: 0.18 });
    [0.72, 0.96, 1.17, 1.36].forEach((time, index) => bell(time, [196, 247, 330, 440][index], 0.1 + index * 0.015, 0.72));
    chord(1.5, [196, 294, 392, 588], 0.21, 0.82, 0.04);
  }),
  createScene('revival-rise.wav', 2.85, 0x7e1a1, ({ tone, noise, click, bubble, bell, chord }) => {
    [0.08, 0.48, 0.86].forEach((time, index) => click(time, 0.22 + index * 0.06, 78 + index * 13));
    noise(0.56, 1.65, 0.15, { cutoffStart: 120, cutoffEnd: 5_200, mode: 'bandpass', pulseRate: 1.2, attack: 0.05, release: 0.25 });
    tone(0.54, 1.46, 72, 620, 0.15, { wave: 'triangle', attack: 0.04, release: 0.28, harmonic: 0.2 });
    [0.92, 1.16, 1.4, 1.62].forEach((time, index) => bubble(time, 0.28 + index * 0.12, 0.12));
    bell(1.42, 330, 0.14, 1.18);
    chord(1.68, [196, 247, 330, 494], 0.25, 1.08, 0.06);
  }),
  createScene('jackpot-burst.wav', 3.65, 0x1ac48010, ({ tone, noise, click, bubble, bell, chord }) => {
    click(0.04, 0.82, 92);
    noise(0.03, 1.7, 0.21, { cutoffStart: 130, cutoffEnd: 6_800, mode: 'bandpass', pulseRate: 6, attack: 0.015, release: 0.32 });
    tone(0.04, 1.08, 54, 510, 0.22, { wave: 'triangle', attack: 0.015, release: 0.28, harmonic: 0.25 });
    [0.16, 0.28, 0.43, 0.59, 0.78, 1.02, 1.3].forEach((time, index) => bubble(time, 0.18 + (index % 4) * 0.18, 0.13));
    chord(0.38, [196, 247, 294, 392, 494], 0.32, 2.25, 0.065);
    [1.18, 1.48, 1.82, 2.24, 2.68].forEach((time, index) => bell(time, 659 + index * 82, 0.11, 0.72));
    [2.1, 2.34, 2.58, 2.82, 3.04].forEach((time, index) => tone(time, 0.34, [392, 494, 588, 784, 988][index], [494, 588, 784, 988, 1_176][index], 0.085, { attack: 0.02, release: 0.48 }));
  }),
  createScene('premium-crown.wav', 3.25, 0xc70a4810, ({ tone, noise, bubble, bell, chord }) => {
    noise(0, 3.25, 0.035, { cutoffStart: 2_100, cutoffEnd: 3_400, mode: 'bandpass', pulseRate: 0.48, attack: 0.16, release: 0.2 });
    [0.08, 0.38, 0.68, 0.98, 1.3].forEach((time, index) => bell(time, [330, 415, 494, 659, 784][index], 0.12, 1.05));
    chord(1.42, [247, 330, 415, 554], 0.2, 1.62, 0.085);
    [1.68, 1.94, 2.24, 2.54, 2.88].forEach((time, index) => bubble(time, 0.22 + (index % 3) * 0.2, 0.075));
    tone(1.52, 1.55, 196, 247, 0.055, { wave: 'triangle', attack: 0.18, release: 0.35, harmonic: 0.12 });
  })
];

function encodeWav(samples) {
  const dataLength = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataLength);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    buffer.writeInt16LE(Math.round(sample < 0 ? sample * 32_768 : sample * 32_767), 44 + index * 2);
  }
  return buffer;
}

fs.mkdirSync(OUTPUT, { recursive: true });
for (const scene of scenes) {
  fs.writeFileSync(path.join(OUTPUT, scene.name), encodeWav(scene.samples));
}

const manifest = {
  version: 1,
  generatedBy: 'tools/generate-royal-oracle-audio.mjs',
  source: 'Original deterministic synthesis; no external recordings or third-party samples.',
  format: { codec: 'PCM', channels: 1, sampleRate: SAMPLE_RATE, bitDepth: 16 },
  assets: scenes.map(scene => ({ file: scene.name, durationSeconds: scene.duration }))
};
fs.writeFileSync(path.join(OUTPUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Generated ${scenes.length} original ROYAL ORACLE audio assets in ${OUTPUT}`);
