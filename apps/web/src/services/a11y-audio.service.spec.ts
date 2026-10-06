import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { a11yAudio } from './a11y-audio.service';

describe('A11yAudioService', () => {
  let mockAudioContext: any;
  let mockOscillator: any;
  let mockGain: any;
  let mockSpeechSynthesis: any;

  beforeEach(() => {
    mockOscillator = {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockAudioContext = {
      state: 'running',
      currentTime: 10,
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGain),
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
    };

    (window as any).AudioContext = vi.fn(() => mockAudioContext);

    mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => [
        { name: 'Spanish Voice', lang: 'es-ES' },
      ]),
    };

    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      writable: true,
      configurable: true,
    });

    (window as any).SpeechSynthesisUtterance = class {
      text: string;
      lang = '';
      rate = 1;
      pitch = 1;
      voice: any = null;
      onend: any = null;
      onerror: any = null;
      constructor(text: string) {
        this.text = text;
      }
    };

    a11yAudio.setMuted(false);
    a11yAudio.resetContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Síntesis de Audio Web (Tonos Puros)', () => {
    it('debería reproducir un tono con frecuencia y duración especificadas', () => {
      a11yAudio.playTone(880, 'triangle', 0.2, 0.1);

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockOscillator.type).toBe('triangle');
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(880, 10);
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalledWith(10.2);
    });

    it('debería reproducir el sonido de escaneo (Bip)', () => {
      a11yAudio.playScan();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(1046.5, 10);
    });

    it('debería reproducir sonido de alerta descendente', () => {
      vi.useFakeTimers();
      a11yAudio.playAlert();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440, 10);

      vi.advanceTimersByTime(120);
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(330, 10);
      vi.useRealTimers();
    });

    it('debería reproducir sonido armónico de éxito', () => {
      vi.useFakeTimers();
      a11yAudio.playSuccess();

      // Las 3 notas armónicas se ejecutan en 0ms, 70ms y 140ms
      vi.advanceTimersByTime(250);
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
      vi.useRealTimers();
    });


    it('no debería reproducir ningún tono cuando está silenciado (muted)', () => {
      a11yAudio.setMuted(true);
      a11yAudio.playScan();
      a11yAudio.playSuccess();
      a11yAudio.playAlert();
      a11yAudio.playClick();

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });
  });

  describe('Asistente y Síntesis de Voz en Español', () => {
    it('debería invocar window.speechSynthesis con texto en español', async () => {
      const promise = a11yAudio.speak('Bienvenido al sistema');
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();

      const lastCallUtterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(lastCallUtterance.text).toBe('Bienvenido al sistema');
      expect(lastCallUtterance.lang).toBe('es-ES');

      // Trigger utterance finish
      lastCallUtterance.onend();
      await promise;
    });

    it('debería cancelar el habla previa cuando force = true', () => {
      a11yAudio.speak('Mensaje urgente', true);
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });

    it('debería vocalizar un producto con formato de precio y stock en ARS', () => {
      a11yAudio.speakProduct('Amoladora Angular Bosch 750W', 45000, 12);

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.text).toContain('Amoladora Angular Bosch 750W');
      expect(utterance.text).toContain('Precio:');
      expect(utterance.text).toContain('Stock disponible: 12 unidades.');
    });

    it('debería vocalizar la confirmación de venta con total y vuelto', () => {
      a11yAudio.speakSaleComplete(15000, 5000);

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.text).toContain('Venta cobrada con éxito.');
      expect(utterance.text).toContain('Vuelto a entregar:');
    });

    it('debería cancelar cualquier reproducción al llamar a11yAudio.cancel()', () => {
      a11yAudio.cancel();
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });
  });
});
