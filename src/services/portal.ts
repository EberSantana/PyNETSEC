/**
 * Integração com o Trilha Rali HUB (portal de estudos, mesmo endereço ebersantana.github.io).
 * O login é o do portal: curso, turma, nome na lista e PIN. O index.html carrega o
 * progresso-turma.js do portal, que mostra a tela de entrada, bloqueia quem não foi liberado
 * pelo professor e envia o progresso à planilha da turma.
 */
export interface AlunoPortal {
  id: string;
  nome: string;
  turma: string;
}

declare global {
  interface Window {
    progressoMudou?: () => void;
    __pynetsecDados?: () => { feitas: number; total: number; pontos: number; detalhe: Record<string, unknown> };
  }
}

/** ?professor no endereço: o professor vê o laboratório sem login (como nas disciplinas). */
export const MODO_PROFESSOR = /[?&]professor\b/.test(window.location.search);

export function lerAlunoPortal(): AlunoPortal | null {
  try {
    const p = JSON.parse(window.localStorage.getItem('perfil:aluno') || 'null');
    if (!p || !p.id || typeof p.nome !== 'string' || !p.nome.trim()) return null;
    return { id: String(p.id), nome: p.nome.trim().replace(/\s+/g, ' '), turma: String(p.turma || '').trim() };
  } catch {
    return null;
  }
}

/** Entra ou sai do portal em outra aba ou na tela de entrada: recarrega com o aluno certo. */
export function recarregarQuandoPerfilMudar(idAtual: string | null): void {
  const confere = () => {
    const novo = lerAlunoPortal()?.id ?? null;
    if (novo !== idAtual) window.location.reload();
  };
  window.addEventListener('perfil:mudou', confere);
  window.addEventListener('storage', (e) => {
    if (e.key === 'perfil:aluno') confere();
  });
}
