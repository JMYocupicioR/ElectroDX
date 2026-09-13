/**
 * EmgAudioSimulator.ts — Simulador de Auscultación Neurofisiológica EMG
 * Genera sonidos característicos de electromiografía de aguja usando Web Audio API nativo.
 * Sin dependencias de archivos de audio externos.
 */

class EmgAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private activeOscillators: (OscillatorNode | AudioNode)[] = [];
  private loopTimeout: any = null;

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

  /** Detiene cualquier reproducción de audio en curso */
  stop() {
    this.isPlaying = false;
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }
    this.activeOscillators.forEach(node => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        node.disconnect();
      } catch {}
    });
    this.activeOscillators = [];
  }

  /**
   * Reproduce el sonido correspondiente a un patrón de actividad espontánea
   */
  playPattern(pattern: 'fibrillations' | 'positive_waves' | 'myotonia' | 'fasciculations' | 'normal_mup') {
    this.stop();
    const ctx = this.getContext();
    this.isPlaying = true;

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
        this.playNormalMUP(ctx);
        break;
    }
  }

  /** Fibrilaciones: chasquidos de alta frecuencia tipo "lluvia en techo de zinc" */
  private playFibrillations(ctx: AudioContext) {
    const triggerClick = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;

      // Generar impulso muy breve con filtro pasa-altos
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800 + Math.random() * 800, now);
      filter.Q.setValueAtTime(4, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(3200, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.003); // 3ms

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.004);

      // Ritmo regular-irregular (10 a 25 Hz)
      const nextDelay = 35 + Math.random() * 50;
      this.loopTimeout = setTimeout(triggerClick, nextDelay);
    };

    triggerClick();
  }

  /** Ondas Agudas Positivas (PSW): ruido sordo, chasquido de tono más bajo y amortiguado */
  private playPositiveSharpWaves(ctx: AudioContext) {
    const triggerPSW = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140 + Math.random() * 30, now);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012); // 12ms

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.015);

      const nextDelay = 60 + Math.random() * 80;
      this.loopTimeout = setTimeout(triggerPSW, nextDelay);
    };

    triggerPSW();
  }

  /** Descargas Miotónicas: sonido de "bombardero en picada" con modulación continua */
  private playMyotonicDischarge(ctx: AudioContext) {
    const now = ctx.currentTime;
    const duration = 2.8;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';

    // Barrido de frecuencia ascendente y descendente característico (Dive-bomber)
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.8);
    osc.frequency.exponentialRampToValueAtTime(190, now + 1.8);
    osc.frequency.exponentialRampToValueAtTime(60, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(1800, now + 0.8);
    filter.frequency.linearRampToValueAtTime(400, now + duration);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);

    this.activeOscillators.push(osc);

    this.loopTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.loopTimeout = setTimeout(() => this.playMyotonicDischarge(ctx), 800);
      }
    }, duration * 1000);
  }

  /** Fasciculaciones: chasquido aislado de baja frecuencia e irregular (estilo palomitas de maíz) */
  private playFasciculations(ctx: AudioContext) {
    const triggerFasc = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110 + Math.random() * 40, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);

      // Intervalos largos e irregulares (0.5 a 2.5 seg)
      const nextDelay = 500 + Math.random() * 1800;
      this.loopTimeout = setTimeout(triggerFasc, nextDelay);
    };

    triggerFasc();
  }

  /** PUM Normal con esfuerzo moderado: patrón de interferencia armónico */
  private playNormalMUP(ctx: AudioContext) {
    const now = ctx.currentTime;
    const duration = 2.0;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);

    this.activeOscillators.push(osc);
  }
}

export const emgAudio = new EmgAudioEngine();
