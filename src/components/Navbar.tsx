import { AppView, StudentProfile } from '../types/ctf';

interface NavbarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  profile: StudentProfile;
  completedCount: number;
  totalMissions: number;
  onOpenConfig: () => void;
}

const NAV_ITEMS: Array<{ id: AppView; label: string }> = [
  { id: 'hub', label: 'Trilha' },
  { id: 'study', label: 'Estudar' },
  { id: 'lab', label: 'Laboratório' },
  { id: 'ranking', label: 'Placar' },
  { id: 'badges', label: 'Conquistas' },
];

export function Navbar({
  activeView,
  onNavigate,
  profile,
  completedCount,
  totalMissions,
  onOpenConfig,
}: NavbarProps) {
  const buttonLabel = profile.aluno.trim()
    ? `${profile.aluno.trim().split(' ')[0]} · ${completedCount}/${totalMissions}`
    : 'Perfil e Planilha';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:gap-8 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('hub')}
          className="cursor-pointer font-[var(--font-display)] text-lg font-bold tracking-tight text-slate-50 transition-colors hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400 whitespace-nowrap shrink-0"
        >
          Py<span className="text-cyan-400">NetSec</span>
        </button>

        {/* Zone 2: Clean Single-Line Text Navigation Links */}
        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-4 overflow-x-auto sm:gap-7"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative cursor-pointer py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
                  isActive
                    ? 'text-cyan-300'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-400"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenConfig}
            className="cursor-pointer rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200 transition-colors hover:border-cyan-300 hover:bg-cyan-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 whitespace-nowrap shrink-0 max-w-[180px] truncate tabular-nums"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </header>
  );
}
