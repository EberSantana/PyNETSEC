import { useEffect, useRef, useState } from 'react';
import { Download, Eye, EyeOff, Smartphone, X, Check } from 'lucide-react';

export type CardPaletteId = 'cyan' | 'emerald' | 'crimson';

interface CardTheme {
  id: CardPaletteId;
  label: string;
  bgTop: string;
  bgBottom: string;
  accent: string;
  accentSoft: string;
  secondary: string;
}

const CARD_THEMES: CardTheme[] = [
  {
    id: 'cyan',
    label: 'Ciano Terminal',
    bgTop: '#06111F',
    bgBottom: '#090D16',
    accent: '#22D3EE',
    accentSoft: 'rgba(34, 211, 238, 0.16)',
    secondary: '#38BDF8',
  },
  {
    id: 'emerald',
    label: 'Esmeralda Matrix',
    bgTop: '#061A14',
    bgBottom: '#070E0D',
    accent: '#10B981',
    accentSoft: 'rgba(16, 185, 129, 0.16)',
    secondary: '#34D399',
  },
  {
    id: 'crimson',
    label: 'Rubi Red Team',
    bgTop: '#1E0914',
    bgBottom: '#0C0811',
    accent: '#FB7185',
    accentSoft: 'rgba(251, 113, 133, 0.16)',
    secondary: '#F43F5E',
  },
];

export interface LockScreenCardData {
  missionCode: string;
  title: string;
  flag: string;
  studentName: string;
  turma: string;
  points: number;
  rankTitle: string;
  badgeLabel?: string;
  defaultPalette?: CardPaletteId;
}

interface LockScreenCardModalProps {
  open: boolean;
  card: LockScreenCardData | null;
  onClose: () => void;
}

function drawWallpaperCanvas(
  canvas: HTMLCanvasElement,
  card: LockScreenCardData,
  theme: CardTheme
) {
  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Base gradient background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, theme.bgTop);
  grad.addColorStop(0.55, '#090D16');
  grad.addColorStop(1, theme.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle neon radial glow centered below lock-screen clock safe zone
  const radial = ctx.createRadialGradient(width / 2, 1140, 60, width / 2, 1140, 640);
  radial.addColorStop(0, theme.accentSoft);
  radial.addColorStop(1, 'rgba(9, 13, 22, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  // Fine terminal grid lines
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.07)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 72) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 72) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Geometric circuit frame in lower half (keeps top 620px clean for phone clock)
  const cardX = 88;
  const cardY = 760;
  const cardW = width - 176;
  const cardH = 740;

  ctx.fillStyle = 'rgba(13, 20, 34, 0.86)';
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 32);
  ctx.fill();
  ctx.stroke();

  // Inner subtle grid accent bar at top of card
  ctx.fillStyle = theme.accent;
  ctx.fillRect(cardX + 48, cardY + 56, 120, 6);

  // Header caption
  ctx.fillStyle = theme.accent;
  ctx.font = '600 32px "JetBrains Mono", monospace';
  ctx.fillText(`PYNETSEC · TRILHA INTERATIVA`, cardX + 48, cardY + 124);

  // Mission badge / code
  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${card.missionCode}  ·  ${card.rankTitle}`, cardX + 48, cardY + 178);

  // Title (wrapped nicely)
  ctx.fillStyle = '#F8FAFC';
  ctx.font = '700 54px "Bricolage Grotesque", sans-serif';
  const words = card.title.split(' ');
  let line = '';
  let y = cardY + 276;
  const maxWidth = cardW - 96;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, cardX + 48, y);
      line = word;
      y += 66;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, cardX + 48, y);
  }

  // Flag terminal box
  const flagBoxY = cardY + 420;
  ctx.fillStyle = '#060911';
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cardX + 48, flagBoxY, cardW - 96, 118, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = '500 22px "JetBrains Mono", monospace';
  ctx.fillText(card.badgeLabel ?? 'FLAG CAPTURADA', cardX + 76, flagBoxY + 42);

  ctx.fillStyle = theme.accent;
  ctx.font = '600 30px "JetBrains Mono", monospace';
  const flagDisplay = card.flag.length > 36 ? `${card.flag.slice(0, 35)}…` : card.flag;
  ctx.fillText(flagDisplay, cardX + 76, flagBoxY + 88);

  // Footer student metrics inside card
  const footerY = cardY + 628;
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(card.studentName || 'Operador PyNetSec', cardX + 48, footerY);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${card.turma || 'Ensino Médio Técnico'}`, cardX + 48, footerY + 44);

  // XP value right-aligned
  ctx.textAlign = 'right';
  ctx.fillStyle = theme.secondary;
  ctx.font = '700 44px "JetBrains Mono", monospace';
  ctx.fillText(`${card.points} XP`, cardX + cardW - 48, footerY + 14);
  ctx.textAlign = 'left';

  // Bottom discreet branding
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
  ctx.font = '500 24px "JetBrains Mono", monospace';
  ctx.fillText('PYTHON · REDES · SEGURANÇA DA INFORMAÇÃO', width / 2, height - 120);
  ctx.textAlign = 'left';
}

export function LockScreenCardModal({ open, card, onClose }: LockScreenCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paletteId, setPaletteId] = useState<CardPaletteId>('cyan');
  const [showClockOverlay, setShowClockOverlay] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (card?.defaultPalette) {
      setPaletteId(card.defaultPalette);
    }
  }, [card]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open || !card || !canvasRef.current) return;
    const activeTheme = CARD_THEMES.find((t) => t.id === paletteId) ?? CARD_THEMES[0];
    drawWallpaperCanvas(canvasRef.current, card, activeTheme);
  }, [open, card, paletteId]);

  if (!open || !card) return null;

  const formattedTime = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedDate = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `pynetsec-${card.missionCode.toLowerCase()}-wallpaper.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lockscreen-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#111827] shadow-2xl md:flex-row">
        {/* Left: 9:16 Phone Preview with Live Lock-Screen Clock Overlay */}
        <div className="flex flex-1 items-center justify-center bg-[#060911] p-6">
          <div className="relative aspect-[9/16] w-[240px] overflow-hidden rounded-[2rem] border-4 border-slate-700 bg-[#090D16] shadow-2xl sm:w-[270px]">
            <canvas
              ref={canvasRef}
              className="h-full w-full object-cover"
              aria-label={`Prévia do papel de parede 9:16 da conquista ${card.title}`}
            />

            {/* Live Phone Lock-Screen Clock & Date Overlay */}
            {showClockOverlay && (
              <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center px-4 pt-7 text-center">
                <div className="mb-3 h-1.5 w-14 rounded-full bg-slate-950/75" />
                <p className="text-[11px] font-medium capitalize text-slate-200/90 drop-shadow">
                  {formattedDate}
                </p>
                <p className="mt-0.5 font-[var(--font-display)] text-5xl font-bold tracking-tight text-white drop-shadow-md tabular-nums">
                  {formattedTime}
                </p>
              </div>
            )}

            {/* Home bar indicator */}
            {showClockOverlay && (
              <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center">
                <div className="h-1 w-24 rounded-full bg-white/50" />
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls & Export */}
        <div className="flex w-full flex-col justify-between p-6 md:w-[320px]">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-cyan-300">
                  Papel de Parede 9:16 · 1080×1920
                </p>
                <h2
                  id="lockscreen-modal-title"
                  className="mt-1 text-xl font-bold text-slate-50"
                >
                  Cartão Lock-Screen CTF
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar prévia lock-screen"
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Visualize como sua conquista e sua Flag ficam na tela de bloqueio do celular e
              baixe em PNG sem marca d&apos;água do relógio.
            </p>

            {/* Theme Selector */}
            <div className="mt-6">
              <p className="text-xs font-medium text-slate-300">Estilo visual</p>
              <div className="mt-2 grid grid-cols-1 gap-2">
                {CARD_THEMES.map((theme) => {
                  const selected = theme.id === paletteId;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setPaletteId(theme.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                        selected
                          ? 'border-cyan-400 bg-cyan-400/10 text-slate-50'
                          : 'border-slate-800 bg-[#090D16] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{theme.label}</span>
                      <span
                        className="h-3.5 w-3.5 rounded-sm"
                        style={{ backgroundColor: theme.accent }}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lock-Screen Clock Toggle */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowClockOverlay((prev) => !prev)}
                className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-800 bg-[#090D16] px-3.5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-cyan-400" />
                  <span>Relógio de bloqueio</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  {showClockOverlay ? (
                    <>
                      <Eye className="h-3.5 w-3.5 text-cyan-300" />
                      Visível
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                      Oculto
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDownload}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-[#05131C] transition-colors hover:bg-cyan-300"
            >
              {downloaded ? (
                <>
                  <Check className="h-4 w-4" />
                  PNG baixado!
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Baixar Papel de Parede (PNG)
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full cursor-pointer rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
