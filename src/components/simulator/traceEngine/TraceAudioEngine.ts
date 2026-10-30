// src/components/simulator/traceEngine/TraceAudioEngine.ts
// Motor Web Audio nativo para auscultación neurofisiológica en electromiografía de aguja

class TraceAudioEngine {
  private ctx: AudioContext | null = null;
  private isAudioPlaying: boolean = false;
  private activeNodes: (OscillatorNode | AudioNode)[] = [];
  private loopTimer: any = null;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'suspended') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  get isPlaying(): boolean {
    return this.isAudioPlaying;
  }

  playMuapWindow(signal: number[], samplingRate: number, startIndex: number, endIndex: number): void {
    this.stop();
    if (!signal.length) return;
    const ctx = this.getContext();
    const from = Math.max(0, Math.min(startIndex, endIndex));
    const to = Math.min(signal.length - 1, Math.max(startIndex, endIndex));
    const slice = signal.slice(from, to + 1);
    const duration = Math.max(0.02, slice.length / Math.max(1, samplingRate));
    const outLen = Math.max(32, Math.floor(duration * ctx.sampleRate));
    const buffer = ctx.createBuffer(1, outLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let peak = 1e-6;
    for (const v of slice) peak = Math.max(peak, Math.abs(v));
    for (let i = 0; i < outLen; i++) {
      const src = (i / Math.max(1, outLen - 1)) * (slice.length - 1);
      const i0 = Math.floor(src);
      const i1 = Math.min(slice.length - 1, i0 + 1);
      const f = src - i0;
      const v = slice[i0] * (1 - f) + slice[i1] * f;
      data[i] = (v / peak) * 0.6;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(20, ctx.currentTime);
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(10000, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.85, ctx.currentTime);

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(ctx.destination);

    this.activeNodes.push(source, highpass, lowpass, gain);
    this.isAudioPlaying = true;
    source.onended = () => {
      this.isAudioPlaying = false;
    };
    source.start();
  }

  stop(): void {
    this.isAudioPlaying = false;
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        node.disconnect();
      } catch {}
    });
    this.activeNodes = [];
  }

  playPattern(
    pattern:
      | 'normal_silence'
      | 'fibrillations'
      | 'positive_waves'
      | 'myotonia'
      | 'fasciculations'
      | 'normal_mup'
      | 'neurogenic_mup'
      | 'myopathic_mup'
  ): void {
    this.stop();
    if (pattern === 'normal_silence') return;

    const ctx = this.getContext();
    this.isAudioPlaying = true;

    switch (pattern) {
      case 'fibrillations':
        this.playFibrillations(ctx);
        break;
      case 'positive_waves':
        this.playPositiveSharpWaves(ctx);
        break;
      case 'myotonia':
        this.playMyotonicDischarge(ctx);
        break;
      case 'fasciculations':
        this.playFasciculations(ctx);
        break;
      case 'normal_mup':
        this.playNormalMup(ctx);
        break;
      case 'neurogenic_mup':
        this.playNeurogenicMup(ctx);
        break;
      case 'myopathic_mup':
        this.playMyopathicMup(ctx);
        break;
    }
  }

  /** Fibrilaciones: chasquidos agudos rítmicos tipo "lluvia fina en techo metálico" (10-25 Hz) */
  private playFibrillations(ctx: AudioContext): void {
    const trigger = () => {
      if (!this.isAudioPlaying) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2900 + Math.random() * 600, now);
      filter.Q.setValueAtTime(4.5, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(3200, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.003);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.004);

      const nextDelay = 35 + Math.random() * 45;
      this.loopTimer = setTimeout(trigger, nextDelay);
    };
    trigger();
  }

  /** Ondas Agudas Positivas (PSW): chasquido sordo más grave y apagado */
  private playPositiveSharpWaves(ctx: AudioContext): void {
    const trigger = () => {
      if (!this.isAudioPlaying) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280 + Math.random() * 80, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.015);

      const nextDelay = 55 + Math.random() * 80;
      this.loopTimer = setTimeout(trigger, nextDelay);
    };
    trigger();
  }

  /** Descarga Miotónica: sonido característico de motor en aceleración y desaceleración ("bombardero en picada") */
  private playMyotonicDischarge(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const dur = 4.5; // 4.5 segundos de salva miotónica

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 1.2);
    filter.frequency.exponentialRampToValueAtTime(250, now + dur);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(50, now + dur);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + dur);
    this.activeNodes.push(osc, gain, filter);

    this.loopTimer = setTimeout(() => {
      if (this.isAudioPlaying) this.playMyotonicDischarge(ctx);
    }, dur * 1000 + 400);
  }

  /** Fasciculaciones: chasquidos aislados irregulares de baja frecuencia */
  private playFasciculations(ctx: AudioContext): void {
    const trigger = () => {
      if (!this.isAudioPlaying) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160 + Math.random() * 80, now);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);

      const nextDelay = 350 + Math.random() * 800; // muy espaciadas e irregulares
      this.loopTimer = setTimeout(trigger, nextDelay);
    };
    trigger();
  }

  /** PUM Normal: golpe rítmico nítido de frecuencia media */
  private playNormalMup(ctx: AudioContext): void {
    const trigger = () => {
      if (!this.isAudioPlaying) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.018);

      const nextDelay = 80 + Math.random() * 40;
      this.loopTimer = setTimeout(trigger, nextDelay);
    };
    trigger();
  }

  /** PUM Neurógeno: chasquido resonante grave gigante de larga duración */
  private playNeurogenicMup(ctx: AudioContext): void {
    const trigger = () => {
      if (!this.isAudioPlaying) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);

      const nextDelay = 130 + Math.random() * 50;
      this.loopTimer = setTimeout(trigger, nextDelay);
    };
    trigger();
  }

  /** PUM Miopático: chasquido de alta frecuencia y sonido crepitante breve */
  private playMyopathicMup(ctx: AudioContext): void {
    const trigger = () => {
      if (!this.isAudioPlaying) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1800, now);

      osc.type = 'square';
      osc.frequency.setValueAtTime(1200 + Math.random() * 400, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.006);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.008);

      const nextDelay = 45 + Math.random() * 30; // reclutamiento precoz rápido
      this.loopTimer = setTimeout(trigger, nextDelay);
    };
    trigger();
  }
}

export const traceAudioEngine = new TraceAudioEngine();

