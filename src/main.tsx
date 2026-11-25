import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { lerAlunoPortal, MODO_PROFESSOR, recarregarQuandoPerfilMudar } from './services/portal';

const aluno = lerAlunoPortal();
recarregarQuandoPerfilMudar(aluno?.id ?? null);

/* Sem login do portal, a tela de entrada do Trilha Rali HUB cobre a página; o laboratório só abre depois. */
createRoot(document.getElementById('root')!).render(aluno || MODO_PROFESSOR ? <App /> : <div aria-hidden="true" />);
