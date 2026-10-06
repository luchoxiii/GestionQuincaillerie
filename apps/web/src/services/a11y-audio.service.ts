/**
 * Servicio de Audio y Asistente de Voz para Accesibilidad (WCAG 2.1)
 * Utiliza Web Audio API (síntesis de tonos puros sin archivos externos)
 * y Web Speech API (síntesis de voz en español).
 */

import { formatCurrency } from '@/lib/utils';

class A11yAudioService {
  private audioCtx: AudioContext | null = null;
  private isMuted = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  resetContext() {
    this.audioCtx = null;
  }


  /**
   * Genera un tono sintetizado mediante oscilador
   */
  playTone(frequency: number, type: OscillatorType = 'sine', duration = 0.1, gainVal = 0.15) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignorar fallos si el usuario aún no interactuó con el DOM
    }
  }

  /**
   * Sonido de éxito armónico (Tríada ascendente)
   */
  playSuccess() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99]; // Do, Mi, Sol (C5, E5, G5)
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 0.15, 0.12);
        }, idx * 70);
      });
    } catch {}
  }

  /**
   * Sonido de escaneo de código de barras (Bip nítido de mostrador)
   */
  playScan() {
    this.playTone(1046.5, 'sine', 0.08, 0.18); // C6 nítido
  }

  /**
   * Sonido de alerta / advertencia (Doble tono descendente)
   */
  playAlert() {
    if (this.isMuted) return;
    this.playTone(440, 'sawtooth', 0.12, 0.1);
    setTimeout(() => {
      this.playTone(330, 'sawtooth', 0.16, 0.12);
    }, 120);
  }

  /**
   * Sonido de clic sutil / tecla
   */
  playClick() {
    this.playTone(300, 'sine', 0.04, 0.08);
  }

  /**
   * Asistente de Voz: Síntesis de voz en español
   */
  speak(text: string, force = false): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      try {
        if (force) {
          window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.05; // Velocidad ligeramente ágil para mostrador
        utterance.pitch = 1.0;

        // Intentar seleccionar una voz natural en español si está disponible
        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find(
          (v) => v.lang.startsWith('es') && !v.name.includes('Google')
        ) || voices.find((v) => v.lang.startsWith('es'));

        if (spanishVoice) {
          utterance.voice = spanishVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        resolve();
      }
    });
  }

  /**
   * Anuncio vocal de producto, precio y stock (ideal para Consultor F3 o lector láser)
   */
  speakProduct(name: string, price: number, stock?: number) {
    const formattedPrice = formatCurrency(price);

    let message = `${name}. Precio: ${formattedPrice}.`;
    if (stock !== undefined) {
      message += ` Stock disponible: ${stock} unidades.`;
    }
    this.speak(message, true);
  }

  /**
   * Anuncio vocal de cobro en mostrador (POS)
   */
  speakSaleComplete(total: number, change = 0) {
    const totalStr = formatCurrency(total);

    let msg = `Venta cobrada con éxito. Total: ${totalStr}.`;
    if (change > 0) {
      const changeStr = formatCurrency(change);
      msg += ` Vuelto a entregar: ${changeStr}.`;
    }
    this.speak(msg, true);
  }

  /**
   * Cancelar cualquier síntesis de voz en curso
   */
  cancel() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const a11yAudio = new A11yAudioService();
