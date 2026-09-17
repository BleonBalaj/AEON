'use client';

type Listener = (playing: boolean) => void;
const listeners = new Set<Listener>();

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isPlaying = false;
let initialized = false;

function notify() {
  for (const l of listeners) l(isPlaying);
}

function initAudio() {
  if (initialized || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    audioCtx = new AudioCtx();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // 1. Planetary Sub-bass Drone (55 Hz A1 fundamental)
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, audioCtx.currentTime);

    const osc2 = audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110.15, audioCtx.currentTime);

    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.35, audioCtx.currentTime);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, audioCtx.currentTime);
    filter.Q.setValueAtTime(1.5, audioCtx.currentTime);

    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.065, audioCtx.currentTime);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(55, audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(masterGain);

    osc1.start();
    osc2.start();
    lfo.start();

    // 2. Stratospheric Wind Pink Noise Texture
    const bufferSize = audioCtx.sampleRate * 4;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(420, audioCtx.currentTime);
    noiseFilter.Q.setValueAtTime(2.2, audioCtx.currentTime);

    const noiseLfo = audioCtx.createOscillator();
    noiseLfo.frequency.setValueAtTime(0.04, audioCtx.currentTime);
    const noiseLfoGain = audioCtx.createGain();
    noiseLfoGain.gain.setValueAtTime(140, audioCtx.currentTime);
    noiseLfo.connect(noiseLfoGain);
    noiseLfoGain.connect(noiseFilter.frequency);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.18, audioCtx.currentTime);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    noiseSource.start();
    noiseLfo.start();

    initialized = true;
  } catch (err) {
    console.warn('Web Audio ambience unavailable', err);
  }
}

export function isAmbiencePlaying(): boolean {
  return isPlaying;
}

export function startAmbience(): void {
  initAudio();
  if (!audioCtx || !masterGain) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
  masterGain.gain.setTargetAtTime(0.22, audioCtx.currentTime, 0.8);
  isPlaying = true;
  notify();
}

export function stopAmbience(): void {
  if (!audioCtx || !masterGain) return;
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
  masterGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.5);
  isPlaying = false;
  notify();
}

export function toggleAmbience(): boolean {
  if (isPlaying) {
    stopAmbience();
  } else {
    startAmbience();
  }
  return isPlaying;
}

export function subscribeAmbience(cb: Listener): () => void {
  listeners.add(cb);
  cb(isPlaying);
  return () => {
    listeners.delete(cb);
  };
}
