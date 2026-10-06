import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  useAccessibilityStore,
  HighContrastMode,
  FontSizeMode,
  ColorBlindnessMode,
} from '@/stores/accessibility.store';
import { a11yAudio } from '@/services/a11y-audio.service';
import {
  Eye,
  BookOpen,
  Volume2,
  Keyboard,
  RotateCcw,
  Check,
  MousePointer,
  Sparkles,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AccessibilityModal: React.FC = () => {
  const store = useAccessibilityStore();

  const handleTestVoice = () => {
    a11yAudio.playSuccess();
    a11yAudio.speak(
      'Asistente de voz del sistema Ferretería ERP activado correctamente. Todos los totales y precios se anunciarán con claridad.',
      true
    );
  };

  const handleReadCurrentScreen = () => {
    const title = document.title || 'Sistema Ferretería ERP';
    const mainHeading = document.querySelector('h1')?.textContent || '';
    const message = `Página activa: ${mainHeading || title}. Presione tabulador para navegar por las opciones.`;
    a11yAudio.speak(message, true);
    toast.success('Leyendo pantalla en voz alta...');
  };

  const handleReset = () => {
    store.resetToDefaults();
    a11yAudio.playAlert();
    toast.success('Ajustes de accesibilidad restablecidos a los valores estándar.');
  };

  return (
    <Dialog open={store.isMenuOpen} onOpenChange={(open) => (open ? store.openMenu() : store.closeMenu())}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 shadow-2xl"
        aria-describedby="a11y-dialog-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800">
              <Eye className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-foreground">
                Panel de Accesibilidad y Adaptaciones Universales
              </DialogTitle>
              <DialogDescription id="a11y-dialog-description" className="text-xs text-muted-foreground mt-0.5">
                Configuraciones visuales, cognitivas y motrices para operadores con discapacidades o requerimientos especiales (WCAG 2.1 AA/AAA).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="vision" className="w-full mt-2">
          <TabsList className="grid grid-cols-4 w-full h-11 p-1 bg-muted/60">
            <TabsTrigger value="vision" className="text-xs font-bold gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>Visión</span>
            </TabsTrigger>
            <TabsTrigger value="reading" className="text-xs font-bold gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Lectura</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="text-xs font-bold gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Audio & Voz</span>
            </TabsTrigger>
            <TabsTrigger value="keyboard" className="text-xs font-bold gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-purple-500" />
              <span>Teclado</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: VISIÓN */}
          <TabsContent value="vision" className="space-y-5 pt-3">
            {/* Alto Contraste */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground">
                Modo de Alto Contraste (Para baja visión y fatiga ocular)
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'none', label: 'Estándar', desc: 'Tema habitual del sistema', badge: 'Normal' },
                  { id: 'yellow-black', label: 'Amarillo / Negro', desc: 'WCAG AAA contraste extremo', badge: 'Recomendado' },
                  { id: 'dark', label: 'Oscuro Profundo', desc: 'Fondo negro con bordes cian', badge: '21:1' },
                  { id: 'light', label: 'Blanco Puro', desc: 'Fondo blanco con bordes negros', badge: 'Puro' },
                ].map((mode) => {
                  const isSelected = store.highContrast === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        store.setHighContrast(mode.id as HighContrastMode);
                        a11yAudio.playClick();
                      }}
                      className={`p-3 rounded-lg border-2 text-left transition-all relative ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5 font-bold'
                          : 'border-border hover:border-muted-foreground/30 bg-card'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-primary">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      <div className="text-xs font-bold text-foreground">{mode.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{mode.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tamaño de Tipografía */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground">
                Escala de Tamaño de Letra
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'normal', label: 'Normal', percent: '100%', sample: 'Texto Aa' },
                  { id: 'large', label: 'Grande', percent: '115%', sample: 'Texto Aa' },
                  { id: 'xlarge', label: 'Muy Grande', percent: '130%', sample: 'Texto Aa' },
                  { id: 'huge', label: 'Gigante', percent: '150%', sample: 'Texto Aa' },
                ].map((size) => {
                  const isSelected = store.fontSize === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => {
                        store.setFontSize(size.id as FontSizeMode);
                        a11yAudio.playClick();
                      }}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5 font-bold'
                          : 'border-border hover:border-muted-foreground/30 bg-card'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-foreground">{size.label}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{size.percent}</span>
                      </div>
                      <div className="mt-1 text-muted-foreground text-xs">{size.sample}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtros para Daltonismo */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground">
                Compensación para Daltonismo
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'Ninguno' },
                  { id: 'protanopia', label: 'Protanopía (Rojo)' },
                  { id: 'deuteranopia', label: 'Deuteranopía (Verde)' },
                  { id: 'tritanopia', label: 'Tritanopía (Azul)' },
                  { id: 'achromatopsia', label: 'Monocromo (Acromatopsia)' },
                ].map((cb) => {
                  const isSelected = store.colorBlindness === cb.id;
                  return (
                    <button
                      key={cb.id}
                      type="button"
                      onClick={() => {
                        store.setColorBlindness(cb.id as ColorBlindnessMode);
                        a11yAudio.playClick();
                      }}
                      className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5 font-bold'
                          : 'border-border hover:border-muted-foreground/30 bg-card'
                      }`}
                    >
                      <span className="text-xs font-semibold text-foreground">{cb.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cursor Gigante */}
            <div className="flex items-center justify-between p-3.5 border rounded-xl bg-card">
              <div className="flex items-center gap-3">
                <MousePointer className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-foreground">Cursor Gigante de Alto Contraste</div>
                  <div className="text-[11px] text-muted-foreground">
                    Aumenta el puntero al doble con contorno amarillo brillante para facilitar su ubicación.
                  </div>
                </div>
              </div>
              <Switch
                checked={store.largeCursor}
                onCheckedChange={(checked) => {
                  store.setLargeCursor(checked);
                  a11yAudio.playClick();
                }}
              />
            </div>
          </TabsContent>

          {/* TAB 2: LECTURA Y ENFOQUE */}
          <TabsContent value="reading" className="space-y-4 pt-3">
            {/* Tipografía para Dislexia */}
            <div className="flex items-center justify-between p-3.5 border rounded-xl bg-card">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-xs font-bold text-foreground">Tipografía Optimizada para Dislexia</div>
                  <div className="text-[11px] text-muted-foreground">
                    Amplía el interletreado, interlineado y claridad de caracteres para reducir la confusión de letras.
                  </div>
                </div>
              </div>
              <Switch
                checked={store.dyslexicFont}
                onCheckedChange={(checked) => {
                  store.setDyslexicFont(checked);
                  a11yAudio.playClick();
                }}
              />
            </div>

            {/* Regla de Lectura para Tablas */}
            <div className="flex items-center justify-between p-3.5 border rounded-xl bg-card">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-foreground">Guía / Regla de Lectura Horizontal</div>
                  <div className="text-[11px] text-muted-foreground">
                    Muestra una guía visual que acompaña al ratón para evitar saltarse renglones en inventarios extensos.
                  </div>
                </div>
              </div>
              <Switch
                checked={store.readingGuide}
                onCheckedChange={(checked) => {
                  store.setReadingGuide(checked);
                  a11yAudio.playClick();
                }}
              />
            </div>

            {/* Reducción de Animaciones */}
            <div className="flex items-center justify-between p-3.5 border rounded-xl bg-card">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-xs font-bold text-foreground">Reducir Movimiento y Animaciones</div>
                  <div className="text-[11px] text-muted-foreground">
                    Desactiva transiciones bruscas para personas con fotosensibilidad, epilepsia o problemas vestibulares.
                  </div>
                </div>
              </div>
              <Switch
                checked={store.reducedMotion}
                onCheckedChange={(checked) => {
                  store.setReducedMotion(checked);
                  a11yAudio.playClick();
                }}
              />
            </div>
          </TabsContent>

          {/* TAB 3: AUDIO Y ASISTENCIA VOCAL */}
          <TabsContent value="audio" className="space-y-4 pt-3">
            {/* Asistente de Voz */}
            <div className="flex items-center justify-between p-3.5 border rounded-xl bg-card">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-emerald-500" />
                <div>
                  <div className="text-xs font-bold text-foreground">Lector de Pantalla / Asistente de Voz</div>
                  <div className="text-[11px] text-muted-foreground">
                    Pronuncia automáticamente en voz alta los precios al escanear, el total de la venta y los vueltos.
                  </div>
                </div>
              </div>
              <Switch
                checked={store.textToSpeech}
                onCheckedChange={(checked) => {
                  store.setTextToSpeech(checked);
                  if (checked) handleTestVoice();
                }}
              />
            </div>

            {/* Sonidos de Confirmación */}
            <div className="flex items-center justify-between p-3.5 border rounded-xl bg-card">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-xs font-bold text-foreground">Efectos Sonoros de Confirmación</div>
                  <div className="text-[11px] text-muted-foreground">
                    Tonos armónicos audibles al escanear códigos de barra, cobrar ventas o registrar alertas.
                  </div>
                </div>
              </div>
              <Switch
                checked={store.soundFeedback}
                onCheckedChange={(checked) => {
                  store.setSoundFeedback(checked);
                  a11yAudio.setMuted(!checked);
                  if (checked) a11yAudio.playSuccess();
                }}
              />
            </div>

            {/* Acciones directas de voz */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={handleTestVoice}
                className="gap-2 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50"
              >
                <Volume2 className="w-4 h-4" />
                <span>Probar Asistente de Voz</span>
              </Button>

              <Button
                variant="outline"
                type="button"
                onClick={handleReadCurrentScreen}
                className="gap-2 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50"
              >
                <BookOpen className="w-4 h-4" />
                <span>Leer Resumen de Pantalla</span>
              </Button>
            </div>
          </TabsContent>

          {/* TAB 4: TECLADO Y MOVILIDAD */}
          <TabsContent value="keyboard" className="space-y-4 pt-3">
            {/* Enfoque Ultra-Visible */}
            <div className="flex items-center justify-between p-3.5 border rounded-xl bg-card">
              <div className="flex items-center gap-3">
                <Keyboard className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-xs font-bold text-foreground">Resaltador de Foco Ultra-Visible</div>
                  <div className="text-[11px] text-muted-foreground">
                    Marca con un borde amarillo fosforescente el botón o campo activo al pulsar Tabulador.
                  </div>
                </div>
              </div>
              <Switch
                checked={store.keyboardHelper}
                onCheckedChange={(checked) => {
                  store.setKeyboardHelper(checked);
                  a11yAudio.playClick();
                }}
              />
            </div>

            {/* Tabla de atajos de teclado accesibles */}
            <div className="border rounded-xl p-3 bg-muted/30 space-y-2">
              <div className="text-xs font-bold text-foreground">Atajos de Teclado Universales:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded bg-background border">
                  <span>Abrir Accesibilidad:</span>
                  <kbd className="px-2 py-0.5 bg-muted rounded font-mono text-[11px] font-bold">Alt + A</kbd>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-background border">
                  <span>Consultar Precio (F3):</span>
                  <kbd className="px-2 py-0.5 bg-muted rounded font-mono text-[11px] font-bold">F3</kbd>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-background border">
                  <span>Cobrar Venta (POS):</span>
                  <kbd className="px-2 py-0.5 bg-muted rounded font-mono text-[11px] font-bold">F4</kbd>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-background border">
                  <span>Buscador de Productos:</span>
                  <kbd className="px-2 py-0.5 bg-muted rounded font-mono text-[11px] font-bold">F2</kbd>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-background border">
                  <span>Cerrar Ventana:</span>
                  <kbd className="px-2 py-0.5 bg-muted rounded font-mono text-[11px] font-bold">Esc</kbd>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-background border">
                  <span>Saltar entre elementos:</span>
                  <kbd className="px-2 py-0.5 bg-muted rounded font-mono text-[11px] font-bold">Tab / Shift+Tab</kbd>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-3 border-t mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer todo</span>
          </Button>

          <Button
            size="sm"
            onClick={store.closeMenu}
            className="text-xs font-bold px-6"
          >
            Aceptar y Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
