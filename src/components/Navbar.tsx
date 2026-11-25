import { AppView, StudentProfile } from '../types/ctf';
import logoHub from '../assets/logo-hub-escuro.png';

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
  { id: 'badges', label: 'Selos' },
];

/** Endereços do Trilha Rali HUB (mesma origem do PyNetSec no GitHub Pages). */
const URL_ESTUDOS = '../disciplinas/';
const URL_PORTAL = '../disciplinas/portal.html';

/**
 * Barra do Trilha Rali HUB (logo, caminho Estudos › PyNetSec, Conquistas e quem está estudando)
 * com as abas do PyNetSec numa segunda linha que rola na horizontal no celular.
 */
export function Navbar({ activeView, onNavigate, profile, completedCount, totalMissions, onOpenConfig }: NavbarProps) {
  const nome = profile.aluno.trim();
  const apelido = nome ? nome.split(' ')[0] : 'Perfil';
  const pct = totalMissions ? Math.round((completedCount * 100) / totalMissions) : 0;
  const foco = 'outline-none focus-visible:ring-2 focus-visible:ring-[#3BE37A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1E36]';

  return (
    <header className="sticky top-0 z-30 border-b border-[#22324D] bg-[#0F1E36]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 lg:px-8">
        <a href={URL_PORTAL} aria-label="Trilha Rali HUB, página inicial" className={`shrink-0 rounded-lg ${foco}`}>
          <img src={logoHub} alt="Trilha Rali HUB" className="h-9 w-auto sm:h-11" />
        </a>
        <nav aria-label="Você está em" className="hidden min-w-0 items-center gap-1.5 text-[15px] font-semibold text-[#B8C4D6] md:flex">
          <span aria-hidden>›</span>
          <a href={URL_ESTUDOS} className={`rounded px-1 text-[#3BE37A] hover:underline ${foco}`}>Estudos</a>
          <span aria-hidden>›</span>
          <span aria-current="page" className="font-bold text-[#F1F5F9]">PyNetSec</span>
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <a href={URL_ESTUDOS} className={`hidden items-center rounded-xl px-3 py-2 text-sm font-bold text-[#E6EDF5] hover:bg-white/5 lg:inline-flex ${foco}`}>
            Estudos
          </a>
          <a href={`${URL_ESTUDOS}#conquistas`} className={`hidden items-center rounded-xl px-3 py-2 text-sm font-bold text-[#E6EDF5] hover:bg-white/5 lg:inline-flex ${foco}`}>
            Conquistas
          </a>
          <a href={URL_ESTUDOS} className={`inline-flex items-center rounded-xl border border-[#22324D] px-3 py-2 text-sm font-bold text-[#3BE37A] md:hidden ${foco}`}>
            ← Estudos
          </a>
          <button
            type="button"
            onClick={onOpenConfig}
            title={nome ? `${nome} · ${completedCount} de ${totalMissions} missões` : 'Perfil'}
            className={`inline-flex max-w-[12rem] shrink-0 items-center gap-2 rounded-full bg-[#0E3A27] py-1 pl-1 pr-3 text-sm font-bold text-[#F1F5F9] ${foco}`}
          >
            <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#007A35] text-sm font-black text-white">
              {apelido.slice(0, 1).toUpperCase()}
            </span>
            <span className="truncate">{apelido}</span>
            <span className="tabular-nums text-[#3BE37A]">{completedCount}/{totalMissions}</span>
          </button>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-3 sm:px-6 lg:px-8">
        <nav aria-label="PyNetSec" className="-mb-px flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] sm:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative shrink-0 cursor-pointer whitespace-nowrap rounded-t-lg px-3 py-2.5 text-[15px] font-bold transition-colors ${foco} ${
                  isActive ? 'text-[#3BE37A]' : 'text-[#B8C4D6] hover:text-white'
                }`}
              >
                {item.label}
                {isActive && <span aria-hidden="true" className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-[#3BE37A]" />}
              </button>
            );
          })}
        </nav>
        <div className="hidden shrink-0 items-center gap-2 text-xs font-semibold text-[#8C9BB0] sm:flex" aria-label={`Progresso: ${pct}%`}>
          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-[#22324D]">
            <span className="block h-full rounded-full bg-gradient-to-r from-[#00A844] to-[#3BE37A]" style={{ width: `${pct}%` }} />
          </span>
          {pct}%
        </div>
      </div>
    </header>
  );
}
