let ctx: AudioContext | null = null;

export function unlockAudio() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
}

function noiseBuffer(duration: number) {
  if (!ctx) return null;
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * duration);
  const buffer = ctx.createBuffer(1, len, rate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function playBoom(power: number) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(180 + power * 2, t);
  const src = ctx.createBufferSource();
  const buf = noiseBuffer(0.9);
  if (!buf) return;
  src.buffer = buf;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  const amp = Math.min(0.55, 0.12 + power / 400);
  gain.gain.setValueAtTime(amp, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

  const osc = ctx.createOscillator();
  const og = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(48 + power * 0.15, t);
  osc.frequency.exponentialRampToValueAtTime(28, t + 0.5);
  og.gain.setValueAtTime(amp * 0.7, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
  osc.connect(og);
  og.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.6);
  src.start(t);
  src.stop(t + 0.9);
}

export function playRumble(intensity: number) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 22 + intensity * 8;
  g.gain.setValueAtTime(Math.min(0.18, 0.04 + intensity * 0.08), t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 1.7);
}

export function playWhoosh() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  const buf = noiseBuffer(0.5);
  if (!buf) return;
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(400, t);
  filter.frequency.exponentialRampToValueAtTime(1400, t + 0.4);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
  src.connect(filter);
  filter.connect(g);
  g.connect(ctx.destination);
  src.start(t);
  src.stop(t + 0.5);
}

export function playClick() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = 720;
  g.gain.setValueAtTime(0.04, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.07);
}
