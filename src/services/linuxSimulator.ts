export interface LinuxNode {
  type: 'dir' | 'file';
  name: string;
  content?: string;
  permissions: string; // e.g. 'rwxr-xr-x' or 'rw-r--r--'
  owner: string;
  group: string;
  size: number;
  mtime: string;
  children?: Record<string, LinuxNode>;
  archiveMembers?: string[];
}

export interface LinuxUser {
  username: string;
  comment: string;
  home: string;
  locked: boolean;
  groups: string[];
}

export interface LinuxState {
  root: LinuxNode;
  cwd: string;
  prevCwd: string;
  currentUser: string;
  isRoot: boolean;
  users: Record<string, LinuxUser>;
  groups: Record<string, { gid: number; members: string[] }>;
  installedPackages: Record<string, { version: string; description: string; auto?: boolean }>;
  availablePackages: Record<string, { version: string; description: string }>;
  aptUpdated: boolean;
  history: string[];
  ufwApps: string[];
}

export interface LinuxExecOutput {
  state: LinuxState;
  stdout: string;
  stderr: string;
  clear?: boolean;
  openEditor?: {
    editor: 'nano' | 'vim';
    path: string;
    content: string;
  };
  commandExecuted: string;
}

function makeFile(
  name: string,
  content: string,
  owner = 'aluno',
  group = 'alunos',
  permissions = 'rw-r--r--',
  mtime = 'Nov 22 09:10',
  archiveMembers?: string[]
): LinuxNode {
  return {
    type: 'file',
    name,
    content,
    permissions,
    owner,
    group,
    size: Math.max(content.length, archiveMembers ? 1024 : 0),
    mtime,
    archiveMembers,
  };
}

function makeDir(
  name: string,
  children: Record<string, LinuxNode> = {},
  owner = 'root',
  group = 'root',
  permissions = 'rwxr-xr-x',
  mtime = 'Nov 22 08:00'
): LinuxNode {
  return {
    type: 'dir',
    name,
    permissions,
    owner,
    group,
    size: 4096,
    mtime,
    children,
  };
}

export function createInitialLinuxState(): LinuxState {
  const root = makeDir('/', {
    bin: makeDir('bin', {
      bash: makeFile('bash', '#!/bin/sh\n# GNU Bash shell binary (simulado)', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
      ls: makeFile('ls', '# ELF binary: list directory contents', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
      cat: makeFile('cat', '# ELF binary: concatenate files', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
      grep: makeFile('grep', '# ELF binary: pattern search', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
      ping: makeFile('ping', '# ELF binary: ICMP echo utility', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
      tar: makeFile('tar', '# ELF binary: archiving utility', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
      nano: makeFile('nano', '# ELF binary: Nano text editor', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
    }),
    boot: makeDir('boot', {
      'vmlinuz-6.8.0-lab': makeFile('vmlinuz-6.8.0-lab', 'Kernel Linux 6.8.0-pynetsec (arquivo de inicializacao)', 'root', 'root', 'rw-r--r--', 'Oct 01 07:30'),
      'grub.cfg': makeFile('grub.cfg', 'set default=0\nset timeout=5\nmenuentry "Ubuntu Lab PyNetSec" { linux /boot/vmlinuz-6.8.0-lab }', 'root', 'root', 'rw-r--r--', 'Oct 01 07:30'),
    }),
    dev: makeDir('dev', {
      null: makeFile('null', '', 'root', 'root', 'rw-rw-rw-', 'Nov 22 08:00'),
      sda1: makeFile('sda1', 'Dispositivo de bloco principal (disco virtual)', 'root', 'disk', 'rw-rw----', 'Nov 22 08:00'),
      tty0: makeFile('tty0', 'Terminal virtual de entrada e saida', 'root', 'tty', 'rw--w----', 'Nov 22 08:00'),
    }),
    etc: makeDir('etc', {
      hostname: makeFile('hostname', 'pynetsec-linux\n', 'root', 'root', 'rw-r--r--', 'Oct 15 10:00'),
      hosts: makeFile(
        'hosts',
        '127.0.0.1   localhost\n10.0.0.10   portal.if.edu.br web.if.lab\n10.0.0.20   dns.if.lab\n192.168.10.1 gateway.if.lab\n',
        'root',
        'root',
        'rw-r--r--',
        'Nov 18 14:20'
      ),
      'resolv.conf': makeFile('resolv.conf', '# Servidor DNS configurado via DHCP\nnameserver 10.0.0.20\nsearch if.lab\n', 'root', 'root', 'rw-r--r--', 'Nov 22 08:05'),
      netplan: makeDir('netplan', {
        '01-netcfg.yaml': makeFile(
          '01-netcfg.yaml',
          'network:\n  version: 2\n  ethernets:\n    eth0:\n      dhcp4: true\n      # Exemplo estatico:\n      # addresses: [192.168.10.15/24]\n      # routes: [{ to: default, via: 192.168.10.1 }]\n      # nameservers: { addresses: [10.0.0.20, 8.8.8.8] }\n',
          'root',
          'root',
          'rw-r--r--',
          'Nov 20 11:00'
        ),
      }),
    }),
    home: makeDir('home', {
      aluno: makeDir(
        'aluno',
        {
          '.bashrc': makeFile('.bashrc', '# Configuracao oculta do terminal do usuario aluno\nexport PS1="\\u@pynetsec-linux:\\w$ "\nalias ll="ls -lh"\n', 'aluno', 'alunos', 'rw-r--r--', 'Nov 10 08:00'),
          '.profile': makeFile('.profile', '# Variaveis de ambiente do login\nPATH="$HOME/bin:/usr/bin:/bin"\n', 'aluno', 'alunos', 'rw-r--r--', 'Nov 10 08:00'),
          'notas.txt': makeFile(
            'notas.txt',
            'Resumo de Linux e Redes:\n1. Use ls -la para ver arquivos ocultos e permissoes.\n2. Use grep -i "erro" /var/log/syslog para investigar falhas.\n3. Sempre confira IP e DNS com ifconfig e nslookup.\n4. Permissoes 755 liberam execucao para o dono.\n',
            'aluno',
            'alunos',
            'rw-r--r--',
            'Nov 22 09:15'
          ),
          'servidores.txt': makeFile(
            'servidores.txt',
            '10.0.0.10 web.if.lab HTTP/HTTPS\n10.0.0.20 dns.if.lab DNS\n192.168.10.1 gateway.if.lab ROUTER\n127.0.0.1 localhost LOOPBACK\n',
            'aluno',
            'alunos',
            'rw-r--r--',
            'Nov 21 16:40'
          ),
          'dicas.txt': makeFile(
            'dicas.txt',
            'Atalhos importantes:\nCTRL + ALT + T -> abre o terminal no Linux\nCTRL + R -> busca comando anterior no historico\n!! -> repete o ultimo comando digitado\n',
            'aluno',
            'alunos',
            'rw-r--r--',
            'Nov 20 15:00'
          ),
          projetos: makeDir('projetos', {
            'diagnostico.sh': makeFile(
              'diagnostico.sh',
              '#!/bin/bash\necho "Verificando rede local..."\nhostname -I\nping -c 2 10.0.0.10\n',
              'aluno',
              'alunos',
              'rw-r--r--',
              'Nov 21 10:30'
            ),
          }, 'aluno', 'alunos'),
          vazia: makeDir('vazia', {}, 'aluno', 'alunos'),
        },
        'aluno',
        'alunos'
      ),
      professor: makeDir(
        'professor',
        {
          'plano_aula.txt': makeFile('plano_aula.txt', 'Aula de Administracao Linux, Redes e Seguranca.\n', 'professor', 'sudo', 'rw-r-----', 'Nov 15 09:00'),
        },
        'professor',
        'sudo'
      ),
    }),
    lib: makeDir('lib', {
      'libc.so.6': makeFile('libc.so.6', 'Biblioteca padrao C compartilhada (GNU libc)', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
      'libssl.so.3': makeFile('libssl.so.3', 'Biblioteca OpenSSL para criptografia TLS', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
    }),
    media: makeDir('media', {
      pendrive_lab: makeDir('pendrive_lab', {
        'backup_configs.txt': makeFile('backup_configs.txt', 'Backup de configuracoes da sala de aula.\n', 'aluno', 'alunos', 'rw-r--r--', 'Nov 19 13:00'),
      }, 'aluno', 'alunos'),
    }),
    opt: makeDir('opt', {
      'pynetsec-tools': makeDir('pynetsec-tools', {
        'README.txt': makeFile('README.txt', 'Aplicacao de terceiros instalada em /opt/pynetsec-tools\n', 'root', 'root', 'rw-r--r--', 'Nov 12 11:00'),
      }),
    }),
    sbin: makeDir('sbin', {
      ifconfig: makeFile('ifconfig', '# System admin binary: interface config', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
      ufw: makeFile('ufw', '# System admin binary: uncomplicated firewall', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
      useradd: makeFile('useradd', '# System admin binary: add user', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
    }),
    tmp: makeDir('tmp', {
      'sessao_temp.log': makeFile('sessao_temp.log', 'Arquivo temporario limpo ao reiniciar o sistema.\n', 'aluno', 'alunos', 'rw-rw-rw-', 'Nov 22 08:30'),
    }, 'root', 'root', 'rwxrwxrwx'),
    usr: makeDir('usr', {
      bin: makeDir('bin', {
        vim: makeFile('vim', '# ELF binary: Vim editor', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
        python3: makeFile('python3', '# ELF binary: Python 3.12', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
        nslookup: makeFile('nslookup', '# ELF binary: DNS lookup', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
        netstat: makeFile('netstat', '# ELF binary: network connections', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
        nc: makeFile('nc', '# ELF binary: netcat utility', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
        tcpdump: makeFile('tcpdump', '# ELF binary: packet analyzer', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
        zip: makeFile('zip', '# ELF binary: zip archiver', 'root', 'root', 'rwxr-xr-x', 'Oct 10 12:00'),
      }),
      share: makeDir('share', {
        'doc.txt': makeFile('doc.txt', 'Documentacao em modo leitura do sistema (/usr/share).\n', 'root', 'root', 'r--r--r--', 'Oct 10 12:00'),
      }),
    }),
    var: makeDir('var', {
      log: makeDir('log', {
        syslog: makeFile(
          'syslog',
          'Nov 22 08:01:12 pynetsec-linux systemd[1]: Rede eth0 iniciada com sucesso.\nNov 22 08:01:15 pynetsec-linux dhclient[412]: DHCPACK de 192.168.10.1 -> IP 192.168.10.15\nNov 22 08:04:02 pynetsec-linux kernel: ERRO temporario de timeout no link externo\nNov 22 08:05:19 pynetsec-linux nginx[810]: HTTP 200 GET /portal.if.edu.br\nNov 22 08:09:44 pynetsec-linux ufw[911]: [UFW BLOCK] SRC=185.220.101.47 DPT=3306 PROTO=TCP\nNov 22 08:12:05 pynetsec-linux sshd[940]: Erro de autenticacao para usuario admin (185.220.101.47)\nNov 22 08:15:30 pynetsec-linux systemd[1]: Backup concluido sem falhas.\n',
          'root',
          'adm',
          'rw-r-----',
          'Nov 22 08:15'
        ),
        'auth.log': makeFile(
          'auth.log',
          'Nov 22 08:10:01 pynetsec-linux sshd[902]: Accepted publickey for aluno from 192.168.10.22\nNov 22 08:12:05 pynetsec-linux sshd[940]: Failed password for invalid user admin from 185.220.101.47\nNov 22 08:12:07 pynetsec-linux sshd[941]: Failed password for invalid user root from 185.220.101.47\n',
          'root',
          'adm',
          'rw-r-----',
          'Nov 22 08:12'
        ),
      }),
    }),
  });

  return {
    root,
    cwd: '/home/aluno',
    prevCwd: '/home/aluno',
    currentUser: 'aluno',
    isRoot: false,
    users: {
      root: { username: 'root', comment: 'Superusuario do Sistema', home: '/root', locked: false, groups: ['root', 'sudo'] },
      aluno: { username: 'aluno', comment: 'Estudante PyNetSec', home: '/home/aluno', locked: false, groups: ['alunos', 'sudo', 'redes'] },
      professor: { username: 'professor', comment: 'Docente de Redes', home: '/home/professor', locked: false, groups: ['sudo', 'adm', 'redes'] },
    },
    groups: {
      root: { gid: 0, members: ['root'] },
      sudo: { gid: 27, members: ['root', 'aluno', 'professor'] },
      adm: { gid: 4, members: ['professor'] },
      alunos: { gid: 1000, members: ['aluno'] },
      redes: { gid: 1010, members: ['aluno', 'professor'] },
    },
    installedPackages: {
      bash: { version: '5.2.21', description: 'GNU Bourne Again SHell' },
      nano: { version: '7.2', description: 'Editor de texto amigavel no terminal' },
      vim: { version: '9.1', description: 'Vi IMproved - editor avancado de texto' },
      'net-tools': { version: '2.10', description: 'Ferramentas classicas de rede (ifconfig, netstat)' },
      tcpdump: { version: '4.99.4', description: 'Analisador de trafego de pacotes no terminal' },
      ufw: { version: '0.36.2', description: 'Uncomplicated Firewall para gerenciar portas' },
      zip: { version: '3.0', description: 'Utilitario de compactacao .zip' },
      'libold-unused': { version: '1.0.2', description: 'Dependencia antiga nao utilizada', auto: true },
    },
    availablePackages: {
      htop: { version: '3.3.0', description: 'Monitor interativo de processos e CPU' },
      nmap: { version: '7.94', description: 'Scanner de portas e auditoria de redes' },
      tree: { version: '2.1.1', description: 'Exibe arvore hierarquica de diretorios' },
      curl: { version: '8.5.0', description: 'Ferramenta de linha de comando para requisicoes HTTP/HTTPS' },
      wireshark: { version: '4.2.2', description: 'Analisador grafico de protocolos de rede' },
      nginx: { version: '1.24.0', description: 'Servidor web HTTP/HTTPS de alta performance' },
      git: { version: '2.43.0', description: 'Sistema distribuido de controle de versao' },
    },
    aptUpdated: false,
    history: [],
    ufwApps: ['OpenSSH', 'Nginx Full', 'Nginx HTTP', 'Nginx HTTPS', 'Samba (SMB)', 'CUPS'],
  };
}

function cloneState(s: LinuxState): LinuxState {
  return JSON.parse(JSON.stringify(s)) as LinuxState;
}

export function resolvePath(raw: string, cwd: string, home = '/home/aluno'): string {
  if (!raw || raw === '~') return home;
  let pathStr = raw;
  if (pathStr.startsWith('~/')) {
    pathStr = `${home}/${pathStr.slice(2)}`;
  } else if (!pathStr.startsWith('/')) {
    pathStr = `${cwd === '/' ? '' : cwd}/${pathStr}`;
  }
  const parts = pathStr.split('/');
  const stack: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return '/' + stack.join('/');
}

export function getNodeAt(root: LinuxNode, absPath: string): LinuxNode | null {
  if (absPath === '/') return root;
  const parts = absPath.split('/').filter(Boolean);
  let cur: LinuxNode = root;
  for (const part of parts) {
    if (cur.type !== 'dir' || !cur.children || !cur.children[part]) return null;
    cur = cur.children[part];
  }
  return cur;
}

function getParentAndName(root: LinuxNode, absPath: string): { parent: LinuxNode | null; name: string } {
  const parts = absPath.split('/').filter(Boolean);
  const name = parts.pop() ?? '';
  const parentPath = '/' + parts.join('/');
  return { parent: getNodeAt(root, parentPath), name };
}

function formatHumanSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${bytes}B`;
}

function octalToPermString(octal: string): string | null {
  if (!/^[0-7]{3}$/.test(octal)) return null;
  const map = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
  return octal
    .split('')
    .map((d) => map[Number(d)])
    .join('');
}

function splitArgsRespectingQuotes(input: string): string[] {
  const tokens: string[] = [];
  let cur = '';
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        cur += ch;
      }
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (/\s/.test(ch)) {
      if (cur) {
        tokens.push(cur);
        cur = '';
      }
    } else {
      cur += ch;
    }
  }
  if (cur) tokens.push(cur);
  return tokens;
}

function collectAllPaths(node: LinuxNode, prefix = ''): Array<{ path: string; node: LinuxNode }> {
  const currentPath = prefix || '/';
  const list: Array<{ path: string; node: LinuxNode }> = [{ path: currentPath, node }];
  if (node.type === 'dir' && node.children) {
    for (const key of Object.keys(node.children).sort()) {
      const child = node.children[key];
      const childPath = currentPath === '/' ? `/${key}` : `${currentPath}/${key}`;
      list.push(...collectAllPaths(child, childPath));
    }
  }
  return list;
}

export function saveEditorFile(state: LinuxState, absPath: string, content: string): LinuxState {
  const next = cloneState(state);
  const { parent, name } = getParentAndName(next.root, absPath);
  if (parent && parent.type === 'dir' && name) {
    if (!parent.children) parent.children = {};
    const existing = parent.children[name];
    if (existing && existing.type === 'file') {
      existing.content = content;
      existing.size = content.length;
      existing.mtime = 'Nov 22 agora';
    } else {
      parent.children[name] = makeFile(
        name,
        content,
        next.isRoot ? 'root' : next.currentUser,
        next.isRoot ? 'root' : 'alunos'
      );
    }
  }
  return next;
}

export function autocompleteLinuxInput(state: LinuxState, input: string): string {
  const trimmed = input;
  const parts = trimmed.split(' ');
  const last = parts[parts.length - 1] ?? '';
  const home = state.isRoot ? '/root' : `/home/${state.currentUser}`;

  if (parts.length <= 1) {
    const known = [
      'ls', 'cd', 'pwd', 'clear', 'cat', 'touch', 'mkdir', 'rm', 'rmdir', 'cp', 'mv',
      'man', 'head', 'tail', 'grep', 'find', 'locate', 'which', 'nano', 'vim',
      'chmod', 'chown', 'chgrp', 'history', 'ifconfig', 'ping', 'netstat', 'netcat',
      'nslookup', 'tcpdump', 'hostname', 'tar', 'zip', 'unzip', 'groups', 'getent',
      'passwd', 'sudo', 'apt-cache',
    ];
    const match = known.find((c) => c.startsWith(last));
    return match ? match : input;
  }

  const slashIdx = last.lastIndexOf('/');
  const dirPart = slashIdx >= 0 ? last.slice(0, slashIdx + 1) : '';
  const namePrefix = slashIdx >= 0 ? last.slice(slashIdx + 1) : last;
  const searchDirPath = dirPart ? resolvePath(dirPart, state.cwd, home) : state.cwd;
  const dirNode = getNodeAt(state.root, searchDirPath);
  if (!dirNode || dirNode.type !== 'dir' || !dirNode.children) return input;

  const matchName = Object.keys(dirNode.children)
    .sort()
    .find((k) => k.startsWith(namePrefix));
  if (!matchName) return input;

  const suffix = dirNode.children[matchName].type === 'dir' ? '/' : '';
  parts[parts.length - 1] = `${dirPart}${matchName}${suffix}`;
  return parts.join(' ');
}

const MAN_PAGES: Record<string, string> = {
  ls: 'LS(1) — Lista conteudos de diretorios\nOpcoes: -l (detalhes), -a (ocultos), -lh (tamanho legivel), -ltr (por data), -lr (reverso), -R (recursivo), -lS (por tamanho), -m (separado por virgula), --help.',
  cd: 'CD(1) — Muda o diretorio atual\nExemplos: cd / (raiz), cd ~ (home), cd .. (voltar), cd - (anterior), cd projetos (entrar).',
  cat: 'CAT(1) — Exibe ou concatena arquivos\nOpcoes: -n (numera linhas), -e (mostra $ no fim da linha). Redirecionamento: cat a b > c (sobrescreve), cat d >> c (anexa).',
  mkdir: 'MKDIR(1) — Cria diretorios\nOpcoes: -v (verboso), -p (cria multiplos niveis: mkdir -p a/b/c).',
  rm: 'RM(1) — Remove arquivos ou diretorios\nOpcoes: -i (confirmacao), -dv (diretorio vazio verboso), -rfv (recursivo forcado verboso).',
  grep: 'GREP(1) — Busca padroes de texto dentro de arquivos\nOpcoes: -i (ignora maiusculas/minusculas), -c (conta ocorrencias), -r (busca recursiva).',
  find: 'FIND(1) — Localiza arquivos e pastas na arvore\nOpcoes: -name "padrao", -iname "padrao" (sem diferenciar caixa), -empty (pastas/arquivos vazios).',
  chmod: 'CHMOD(1) — Altera permissoes (octal: 7=rwx, 6=rw-, 5=r-x, 4=r--)\nExemplo: chmod 755 projetos/diagnostico.sh',
  tar: 'TAR(1) — Compacta e descompacta arquivos .tar.gz\nCriar: tar -czvf arq.tar.gz alvo | Listar: tar -tvf arq.tar.gz | Extrair: tar -xzvf arq.tar.gz [-C destino]',
  netstat: 'NETSTAT(8) — Exibe conexoes de rede\nOpcoes: -at (conexoes TCP), -au (conexoes UDP).',
  ufw: 'UFW(8) — Firewall simplificado do Linux\nExemplo: sudo ufw app list (lista perfis de aplicacoes para liberar no firewall).',
};

export function runLinuxCommand(prevState: LinuxState, rawInput: string): LinuxExecOutput {
  const state = cloneState(prevState);
  let input = rawInput.trim();
  const home = state.isRoot ? '/root' : `/home/${state.currentUser}`;

  if (!input) {
    return { state, stdout: '', stderr: '', commandExecuted: '' };
  }

  // Handle !! (repeat last command)
  if (input === '!!') {
    const last = state.history[state.history.length - 1];
    if (!last) {
      return { state, stdout: '', stderr: 'bash: !!: historico vazio.', commandExecuted: '!!' };
    }
    input = last;
  }

  state.history.push(input);
  if (state.history.length > 80) state.history.shift();

  // Handle output redirection (> and >>)
  let redirectMode: 'overwrite' | 'append' | null = null;
  let redirectTarget: string | null = null;
  let cmdPortion = input;

  const appendIdx = input.indexOf('>>');
  const overwriteIdx = input.indexOf('>');
  if (appendIdx !== -1) {
    cmdPortion = input.slice(0, appendIdx).trim();
    redirectTarget = input.slice(appendIdx + 2).trim();
    redirectMode = 'append';
  } else if (overwriteIdx !== -1) {
    cmdPortion = input.slice(0, overwriteIdx).trim();
    redirectTarget = input.slice(overwriteIdx + 1).trim();
    redirectMode = 'overwrite';
  }

  const tokens = splitArgsRespectingQuotes(cmdPortion);
  if (tokens.length === 0) {
    return { state, stdout: '', stderr: '', commandExecuted: input };
  }

  let usedSudo = false;
  let cmd = tokens[0];
  let args = tokens.slice(1);

  if (cmd === 'sudo') {
    usedSudo = true;
    if (args.length === 0) {
      return { state, stdout: '', stderr: 'Uso: sudo <comando>', commandExecuted: input };
    }
    cmd = args[0];
    args = args.slice(1);
  }

  // Normalize capitalized variants students might type from notes
  const cmdLower = cmd.toLowerCase();

  let stdout = '';
  let stderr = '';

  const finish = (extra?: Partial<LinuxExecOutput>): LinuxExecOutput => {
    if (redirectMode && redirectTarget && !stderr) {
      const absTarget = resolvePath(redirectTarget, state.cwd, home);
      const { parent, name } = getParentAndName(state.root, absTarget);
      if (!parent || parent.type !== 'dir') {
        return {
          state,
          stdout: '',
          stderr: `bash: ${redirectTarget}: diretorio nao encontrado`,
          commandExecuted: input,
        };
      }
      if (!parent.children) parent.children = {};
      const existing = parent.children[name];
      const nextContent =
        redirectMode === 'append' && existing?.type === 'file'
          ? `${existing.content ?? ''}${stdout}`
          : stdout;
      parent.children[name] = makeFile(
        name,
        nextContent,
        state.isRoot ? 'root' : state.currentUser,
        state.isRoot ? 'root' : 'alunos',
        existing?.permissions ?? 'rw-r--r--',
        'Nov 22 agora'
      );
      return {
        state,
        stdout: `[Saida redirecionada (${redirectMode === 'append' ? '>> anexada' : '> gravada'}) em ${redirectTarget}]\n`,
        stderr: '',
        commandExecuted: input,
        ...extra,
      };
    }
    return { state, stdout, stderr, commandExecuted: input, ...extra };
  };

  // --- CLEAR ---
  if (cmdLower === 'clear') {
    return finish({ clear: true });
  }

  // --- PWD ---
  if (cmdLower === 'pwd') {
    stdout = `${state.cwd}\n`;
    return finish();
  }

  // --- HISTORY ---
  if (cmdLower === 'history') {
    stdout = state.history.map((h, i) => `${String(i + 1).padStart(4, ' ')}  ${h}`).join('\n') + '\n';
    return finish();
  }

  // --- SUDO SU / EXIT ---
  if (cmdLower === 'su') {
    state.isRoot = true;
    stdout = 'Agora voce esta atuando como superusuario (root). Digite "exit" para voltar ao usuario aluno.\n';
    return finish();
  }
  if (cmdLower === 'exit') {
    if (state.isRoot) {
      state.isRoot = false;
      stdout = 'Sessao de superusuario encerrada. De volta como aluno.\n';
    } else {
      stdout = 'Voce ja esta no shell do usuario aluno.\n';
    }
    return finish();
  }

  // --- CD ---
  if (cmdLower === 'cd') {
    const targetArg = args[0] ?? '~';
    let targetPath: string;
    if (targetArg === '-') {
      targetPath = state.prevCwd;
      stdout = `${targetPath}\n`;
    } else {
      targetPath = resolvePath(targetArg, state.cwd, home);
    }
    const node = getNodeAt(state.root, targetPath);
    if (!node) {
      stderr = `bash: cd: ${targetArg}: Arquivo ou diretorio inexistente`;
    } else if (node.type !== 'dir') {
      stderr = `bash: cd: ${targetArg}: Nao e um diretorio`;
    } else {
      state.prevCwd = state.cwd;
      state.cwd = targetPath;
    }
    return finish();
  }

  // --- LS ---
  if (cmdLower === 'ls') {
    if (args.includes('--help')) {
      stdout = MAN_PAGES.ls + '\n';
      return finish();
    }
    let showAll = false;
    let longFmt = false;
    let human = false;
    let reverse = false;
    let sortTime = false;
    let sortSize = false;
    let recursive = false;
    let commaFmt = false;
    const paths: string[] = [];

    for (const a of args) {
      if (a.startsWith('-')) {
        if (a.includes('a')) showAll = true;
        if (a.includes('l')) longFmt = true;
        if (a.includes('h')) human = true;
        if (a.includes('r')) reverse = true;
        if (a.includes('t')) sortTime = true;
        if (a.includes('S')) sortSize = true;
        if (a.includes('R')) recursive = true;
        if (a.includes('m')) commaFmt = true;
      } else {
        paths.push(a);
      }
    }

    const targetArg = paths[0] ?? '.';
    const absTarget = resolvePath(targetArg, state.cwd, home);
    const node = getNodeAt(state.root, absTarget);
    if (!node) {
      stderr = `ls: nao foi possivel acessar '${targetArg}': Arquivo ou diretorio inexistente`;
      return finish();
    }

    const formatDir = (dirNode: LinuxNode, label?: string): string => {
      const entries = Object.values(dirNode.children ?? {}).filter(
        (c) => showAll || !c.name.startsWith('.')
      );
      entries.sort((a, b) => {
        if (sortSize) return b.size - a.size;
        if (sortTime) return b.mtime.localeCompare(a.mtime);
        return a.name.localeCompare(b.name);
      });
      if (reverse) entries.reverse();

      let out = label ? `${label}:\n` : '';
      if (commaFmt) {
        out += entries.map((e) => (e.type === 'dir' ? `${e.name}/` : e.name)).join(', ') + '\n';
      } else if (longFmt) {
        out += `total ${entries.length * 4}\n`;
        for (const e of entries) {
          const typeChar = e.type === 'dir' ? 'd' : '-';
          const sz = human ? formatHumanSize(e.size).padStart(6, ' ') : String(e.size).padStart(6, ' ');
          out += `${typeChar}${e.permissions} 1 ${e.owner.padEnd(9)} ${e.group.padEnd(7)} ${sz} ${e.mtime} ${e.name}${e.type === 'dir' ? '/' : ''}\n`;
        }
      } else {
        out += entries.map((e) => (e.type === 'dir' ? `${e.name}/` : e.name)).join('  ') + (entries.length ? '\n' : '');
      }

      if (recursive) {
        for (const sub of entries.filter((e) => e.type === 'dir')) {
          const subLabel = label ? `${label}/${sub.name}` : `./${sub.name}`;
          out += '\n' + formatDir(sub, subLabel);
        }
      }
      return out;
    };

    if (node.type === 'file') {
      stdout = longFmt
        ? `-${node.permissions} 1 ${node.owner} ${node.group} ${human ? formatHumanSize(node.size) : node.size} ${node.mtime} ${node.name}\n`
        : `${node.name}\n`;
    } else {
      stdout = formatDir(node, recursive ? targetArg : undefined);
    }
    return finish();
  }

  // --- CAT ---
  if (cmdLower === 'cat') {
    let numberLines = false;
    let showEnds = false;
    const files: string[] = [];
    for (const a of args) {
      if (a === '-n') numberLines = true;
      else if (a === '-e' || a === '-E') showEnds = true;
      else if (!a.startsWith('-')) files.push(a);
    }
    if (files.length === 0) {
      stderr = 'Uso: cat [-n|-e] <arquivo1> [arquivo2] [> destino | >> destino]';
      return finish();
    }
    let combined = '';
    for (const f of files) {
      const abs = resolvePath(f, state.cwd, home);
      const node = getNodeAt(state.root, abs);
      if (!node) {
        stderr = `cat: ${f}: Arquivo ou diretorio inexistente`;
        return finish();
      }
      if (node.type === 'dir') {
        stderr = `cat: ${f}: E um diretorio`;
        return finish();
      }
      combined += node.content ?? '';
    }
    if (numberLines || showEnds) {
      const lines = combined.replace(/\n$/, '').split('\n');
      stdout =
        lines
          .map((line, i) => {
            const num = numberLines ? `${String(i + 1).padStart(4, ' ')}  ` : '';
            const end = showEnds ? '$' : '';
            return `${num}${line}${end}`;
          })
          .join('\n') + '\n';
    } else {
      stdout = combined.endsWith('\n') || !combined ? combined : `${combined}\n`;
    }
    return finish();
  }

  // --- TOUCH ---
  if (cmdLower === 'touch') {
    if (args.length === 0) {
      stderr = 'Uso: touch <arquivo>';
      return finish();
    }
    for (const f of args) {
      const abs = resolvePath(f, state.cwd, home);
      const { parent, name } = getParentAndName(state.root, abs);
      if (!parent || parent.type !== 'dir') {
        stderr = `touch: nao foi possivel criar '${f}': diretorio pai inexistente`;
        return finish();
      }
      if (!parent.children) parent.children = {};
      if (parent.children[name]) {
        parent.children[name].mtime = 'Nov 22 agora';
        stdout += `Timestamp atualizado: ${f}\n`;
      } else {
        parent.children[name] = makeFile(
          name,
          '',
          state.isRoot ? 'root' : state.currentUser,
          state.isRoot ? 'root' : 'alunos',
          'rw-r--r--',
          'Nov 22 agora'
        );
        stdout += `Arquivo criado: ${f}\n`;
      }
    }
    return finish();
  }

  // --- MKDIR ---
  if (cmdLower === 'mkdir') {
    let verbose = false;
    let parents = false;
    const dirs: string[] = [];
    for (const a of args) {
      if (a.startsWith('-')) {
        if (a.includes('v')) verbose = true;
        if (a.includes('p')) parents = true;
      } else {
        dirs.push(a);
      }
    }
    if (dirs.length === 0) {
      stderr = 'Uso: mkdir [-v|-p] <diretorio>';
      return finish();
    }
    for (const d of dirs) {
      const abs = resolvePath(d, state.cwd, home);
      if (parents) {
        const segs = abs.split('/').filter(Boolean);
        let cur = state.root;
        let built = '';
        for (const seg of segs) {
          built += `/${seg}`;
          if (!cur.children) cur.children = {};
          if (!cur.children[seg]) {
            cur.children[seg] = makeDir(
              seg,
              {},
              state.isRoot ? 'root' : state.currentUser,
              state.isRoot ? 'root' : 'alunos',
              'rwxr-xr-x',
              'Nov 22 agora'
            );
            if (verbose) stdout += `mkdir: diretorio '${built}' criado\n`;
          }
          cur = cur.children[seg];
        }
      } else {
        const { parent, name } = getParentAndName(state.root, abs);
        if (!parent || parent.type !== 'dir') {
          stderr = `mkdir: nao foi possivel criar '${d}': diretorio pai inexistente (use mkdir -p)`;
          return finish();
        }
        if (!parent.children) parent.children = {};
        if (parent.children[name]) {
          stderr = `mkdir: nao foi possivel criar '${d}': Arquivo ja existe`;
          return finish();
        }
        parent.children[name] = makeDir(
          name,
          {},
          state.isRoot ? 'root' : state.currentUser,
          state.isRoot ? 'root' : 'alunos',
          'rwxr-xr-x',
          'Nov 22 agora'
        );
        if (verbose) stdout += `mkdir: diretorio '${d}' criado\n`;
      }
    }
    if (!stdout) stdout = `Diretorio(s) criado(s): ${dirs.join(', ')}\n`;
    return finish();
  }

  // --- RM & RMDIR ---
  if (cmdLower === 'rm' || cmdLower === 'rmdir') {
    let recursive = false;
    let verbose = false;
    let interactive = false;
    let emptyDirFlag = cmdLower === 'rmdir';
    let removeParents = false;
    const targets: string[] = [];

    for (const a of args) {
      if (a.startsWith('-')) {
        if (a.includes('r') || a.includes('R')) recursive = true;
        if (a.includes('v')) verbose = true;
        if (a.includes('i')) interactive = true;
        if (a.includes('d')) emptyDirFlag = true;
        if (a.includes('p')) removeParents = true;
      } else {
        targets.push(a);
      }
    }

    if (targets.length === 0) {
      stderr = `Uso: ${cmdLower} <arquivo_ou_diretorio>`;
      return finish();
    }

    for (const t of targets) {
      const abs = resolvePath(t, state.cwd, home);
      if (abs === '/' || abs === '/home' || abs === '/home/aluno') {
        stderr = `${cmdLower}: protecao do laboratorio — nao e permitido remover '${abs}'`;
        return finish();
      }
      const node = getNodeAt(state.root, abs);
      if (!node) {
        stderr = `${cmdLower}: nao foi possivel remover '${t}': Arquivo ou diretorio inexistente`;
        return finish();
      }
      if (node.type === 'dir') {
        const childCount = Object.keys(node.children ?? {}).length;
        if (childCount > 0 && !recursive) {
          stderr = `${cmdLower}: falha ao remover '${t}': Diretorio nao esta vazio (use rm -rfv)`;
          return finish();
        }
        if (!recursive && !emptyDirFlag) {
          stderr = `rm: nao foi possivel remover '${t}': E um diretorio (use rm -dv ou rm -rfv)`;
          return finish();
        }
      }
      const { parent, name } = getParentAndName(state.root, abs);
      if (parent?.children) {
        delete parent.children[name];
        if (interactive) stdout += `rm: confirmar remocao de '${t}'? [s/N] s -> removido\n`;
        else if (verbose) stdout += `removido '${t}'\n`;
        else stdout += `Removido: ${t}\n`;
      }
      if (cmdLower === 'rmdir' && removeParents) {
        // Also prune empty ancestor segments inside cwd
        let curPath = abs.split('/').slice(0, -1).join('/') || '/';
        while (curPath.startsWith(state.cwd) && curPath !== state.cwd && curPath !== '/') {
          const pNode = getNodeAt(state.root, curPath);
          if (pNode && pNode.type === 'dir' && Object.keys(pNode.children ?? {}).length === 0) {
            const up = getParentAndName(state.root, curPath);
            if (up.parent?.children) delete up.parent.children[up.name];
            stdout += `rmdir: diretorio pai vazio removido '${curPath}'\n`;
            curPath = curPath.split('/').slice(0, -1).join('/') || '/';
          } else {
            break;
          }
        }
      }
    }
    return finish();
  }

  // --- CP & MV ---
  if (cmdLower === 'cp' || cmdLower === 'mv') {
    const recursive = args.some((a) => a.startsWith('-') && (a.includes('r') || a.includes('R')));
    const paths = args.filter((a) => !a.startsWith('-'));
    if (paths.length < 2) {
      stderr = `Uso: ${cmdLower} ${cmdLower === 'cp' ? '[-r] ' : ''}<origem> <destino>`;
      return finish();
    }
    const srcAbs = resolvePath(paths[0], state.cwd, home);
    const dstAbs = resolvePath(paths[1], state.cwd, home);
    const srcNode = getNodeAt(state.root, srcAbs);
    if (!srcNode) {
      stderr = `${cmdLower}: '${paths[0]}': Arquivo ou diretorio inexistente`;
      return finish();
    }
    if (cmdLower === 'cp' && srcNode.type === 'dir' && !recursive) {
      stderr = `cp: -r nao especificado; omitindo diretorio '${paths[0]}'`;
      return finish();
    }

    const dstExisting = getNodeAt(state.root, dstAbs);
    const clonedNode = JSON.parse(JSON.stringify(srcNode)) as LinuxNode;

    if (dstExisting && dstExisting.type === 'dir') {
      if (!dstExisting.children) dstExisting.children = {};
      dstExisting.children[clonedNode.name] = clonedNode;
    } else {
      const { parent, name } = getParentAndName(state.root, dstAbs);
      if (!parent || parent.type !== 'dir') {
        stderr = `${cmdLower}: destino '${paths[1]}' invalido`;
        return finish();
      }
      if (!parent.children) parent.children = {};
      clonedNode.name = name;
      parent.children[name] = clonedNode;
    }

    if (cmdLower === 'mv') {
      const srcParent = getParentAndName(state.root, srcAbs);
      if (srcParent.parent?.children) delete srcParent.parent.children[srcParent.name];
      stdout = `Movido/renomeado: ${paths[0]} -> ${paths[1]}\n`;
    } else {
      stdout = `Copiado: ${paths[0]} -> ${paths[1]}\n`;
    }
    return finish();
  }

  // --- MAN ---
  if (cmdLower === 'man') {
    const topic = (args[0] ?? '').toLowerCase();
    if (!topic) {
      stderr = 'Uso: man <comando>  (ex.: man ls, man grep, man tar, man chmod)';
      return finish();
    }
    stdout =
      (MAN_PAGES[topic] ??
        `${topic.toUpperCase()}(1) — Manual resumido do ambiente PyNetSec Linux.\nConsulte a barra lateral "Guia de Comandos" para exemplos praticos de '${topic}'.`) +
      '\n';
    return finish();
  }

  // --- HEAD & TAIL ---
  if (cmdLower === 'head' || cmdLower === 'tail') {
    let linesCount = 10;
    let follow = false;
    let fileArg = '';
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) {
        linesCount = Math.max(1, parseInt(args[i + 1], 10) || 10);
        i++;
      } else if (args[i] === '-f') {
        follow = true;
      } else if (!args[i].startsWith('-')) {
        fileArg = args[i];
      }
    }
    if (!fileArg) {
      stderr = `Uso: ${cmdLower} [-n N] ${cmdLower === 'tail' ? '[-f] ' : ''}<arquivo>`;
      return finish();
    }
    const abs = resolvePath(fileArg, state.cwd, home);
    const node = getNodeAt(state.root, abs);
    if (!node || node.type !== 'file') {
      stderr = `${cmdLower}: '${fileArg}': Arquivo nao encontrado`;
      return finish();
    }
    const allLines = (node.content ?? '').replace(/\n$/, '').split('\n');
    const slice =
      cmdLower === 'head' ? allLines.slice(0, linesCount) : allLines.slice(-linesCount);
    stdout = slice.join('\n') + '\n';
    if (cmdLower === 'tail' && follow) {
      stdout += `[tail -f] Monitorando novas linhas em ${fileArg} em tempo real (simulado no lab)...\nNov 22 agora pynetsec-linux kernel: [LIVE] Novo evento capturado no log.\n`;
    }
    return finish();
  }

  // --- GREP ---
  if (cmdLower === 'grep') {
    let ignoreCase = false;
    let countOnly = false;
    let recursive = false;
    const positional: string[] = [];
    for (const a of args) {
      if (a.startsWith('-')) {
        if (a.includes('i')) ignoreCase = true;
        if (a.includes('c')) countOnly = true;
        if (a.includes('r') || a.includes('R')) recursive = true;
      } else {
        positional.push(a);
      }
    }
    const pattern = positional[0];
    const targetArg = positional[1] ?? '.';
    if (!pattern) {
      stderr = "Uso: grep [-i|-c|-r] 'palavra' <arquivo_ou_pasta>";
      return finish();
    }
    const abs = resolvePath(targetArg, state.cwd, home);
    const node = getNodeAt(state.root, abs);
    if (!node) {
      stderr = `grep: ${targetArg}: Arquivo ou diretorio inexistente`;
      return finish();
    }
    const searchFiles: Array<{ label: string; content: string }> = [];
    if (node.type === 'file') {
      searchFiles.push({ label: targetArg, content: node.content ?? '' });
    } else if (recursive) {
      for (const entry of collectAllPaths(node, abs)) {
        if (entry.node.type === 'file') {
          searchFiles.push({ label: entry.path, content: entry.node.content ?? '' });
        }
      }
    } else {
      stderr = `grep: ${targetArg}: E um diretorio (adicione -r para busca recursiva)`;
      return finish();
    }

    const needle = ignoreCase ? pattern.toLowerCase() : pattern;
    const outLines: string[] = [];
    let totalCount = 0;

    for (const f of searchFiles) {
      const lines = f.content.split('\n');
      let fileMatches = 0;
      for (const line of lines) {
        const hay = ignoreCase ? line.toLowerCase() : line;
        if (hay.includes(needle)) {
          fileMatches++;
          totalCount++;
          if (!countOnly) {
            outLines.push(searchFiles.length > 1 ? `${f.label}: ${line}` : line);
          }
        }
      }
      if (countOnly && (searchFiles.length === 1 || fileMatches > 0)) {
        outLines.push(searchFiles.length > 1 ? `${f.label}: ${fileMatches}` : String(fileMatches));
      }
    }
    stdout = outLines.length > 0 ? outLines.join('\n') + '\n' : countOnly ? `${totalCount}\n` : '(nenhuma ocorrencia encontrada)\n';
    return finish();
  }

  // --- FIND ---
  if (cmdLower === 'find') {
    let baseArg = '.';
    let namePat: string | null = null;
    let inamePat: string | null = null;
    let onlyEmpty = false;

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-name' && args[i + 1]) {
        namePat = args[++i];
      } else if (a === '-iname' && args[i + 1]) {
        inamePat = args[++i];
      } else if (a === '-empty') {
        onlyEmpty = true;
      } else if (!a.startsWith('-')) {
        baseArg = a;
      }
    }
    const absBase = resolvePath(baseArg, state.cwd, home);
    const startNode = getNodeAt(state.root, absBase);
    if (!startNode) {
      stderr = `find: '${baseArg}': Arquivo ou diretorio inexistente`;
      return finish();
    }
    const all = collectAllPaths(startNode, absBase);
    const matches = all.filter(({ node }) => {
      if (onlyEmpty) {
        if (node.type === 'dir') return Object.keys(node.children ?? {}).length === 0;
        return (node.content ?? '').length === 0;
      }
      if (namePat) {
        const rx = new RegExp('^' + namePat.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        return rx.test(node.name);
      }
      if (inamePat) {
        const rx = new RegExp('^' + inamePat.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$', 'i');
        return rx.test(node.name);
      }
      return true;
    });
    stdout = matches.map((m) => m.path).join('\n') + (matches.length ? '\n' : '(nenhum resultado)\n');
    return finish();
  }

  // --- LOCATE ---
  if (cmdLower === 'locate') {
    if (args.includes('-S')) {
      const total = collectAllPaths(state.root).length;
      stdout = `Base de dados /var/lib/mlocate/mlocate.db:\n  ${total} entradas indexadas (arquivos antigos do sistema)\n  Dica: arquivos recem-criados so aparecem apos updatedb.\n`;
      return finish();
    }
    const term = args[0];
    if (!term) {
      stderr = 'Uso: locate <nome_do_arquivo> ou locate -S';
      return finish();
    }
    const found = collectAllPaths(state.root)
      .filter((e) => e.path.toLowerCase().includes(term.toLowerCase()))
      .map((e) => e.path);
    stdout = found.length ? found.join('\n') + '\n' : `(nenhum arquivo indexado contendo '${term}')\n`;
    return finish();
  }

  // --- WHICH ---
  if (cmdLower === 'which') {
    const bin = args[0];
    if (!bin) {
      stderr = 'Uso: which <comando>';
      return finish();
    }
    const candidates = [`/bin/${bin}`, `/usr/bin/${bin}`, `/sbin/${bin}`];
    const hit = candidates.find((p) => getNodeAt(state.root, p));
    if (hit) stdout = `${hit}\n`;
    else if (state.installedPackages[bin]) stdout = `/usr/bin/${bin}\n`;
    else stderr = `${bin} nao encontrado no PATH (/usr/bin:/bin:/sbin)`;
    return finish();
  }

  // --- APT-GET & APT-CACHE ---
  if (cmdLower === 'apt-get' || cmdLower === 'apt') {
    const sub = args[0];
    const pkg = args[1];
    if (!usedSudo && !state.isRoot) {
      stderr = 'E: Permissao negada. Use "sudo apt-get ..." para gerenciar pacotes.';
      return finish();
    }
    if (sub === 'update') {
      state.aptUpdated = true;
      stdout =
        'Atingido:1 http://archive.ubuntu.com/ubuntu noble InRelease\nAtingido:2 http://security.ubuntu.com/ubuntu noble-security InRelease\nLendo listas de pacotes... Pronto (repositorios atualizados!)\n';
      return finish();
    }
    if (sub === 'upgrade' || sub === 'dist-upgrade') {
      stdout =
        `Lendo listas de pacotes... Pronto\nCalculando atualizacao (${sub})... Pronto\n0 pacotes atualizados, 0 novos instalados. Sistema ja esta atualizado!${
          sub === 'dist-upgrade' ? '\nNota: dist-upgrade pode alterar dependencias criticas — use com cautela em producao.' : ''
        }\n`;
      return finish();
    }
    if (sub === 'autoremove') {
      const removed: string[] = [];
      for (const [k, v] of Object.entries(state.installedPackages)) {
        if (v.auto) {
          delete state.installedPackages[k];
          removed.push(k);
        }
      }
      stdout = removed.length
        ? `Removendo pacotes nao utilizados: ${removed.join(', ')}\nConcluido! Espaco em disco liberado.\n`
        : '0 pacotes para remover automaticamente.\n';
      return finish();
    }
    if (sub === 'install') {
      if (!pkg) {
        stderr = 'Uso: sudo apt-get install <programa>';
        return finish();
      }
      if (state.installedPackages[pkg]) {
        stdout = `${pkg} ja esta na versao mais recente (${state.installedPackages[pkg].version}).\n`;
        return finish();
      }
      const catalog = state.availablePackages[pkg] ?? { version: '1.0.0', description: `Pacote ${pkg} (simulado)` };
      state.installedPackages[pkg] = catalog;
      const usrBin = getNodeAt(state.root, '/usr/bin');
      if (usrBin?.children) {
        usrBin.children[pkg] = makeFile(pkg, `# Binary ${pkg}`, 'root', 'root', 'rwxr-xr-x', 'Nov 22 agora');
      }
      stdout = `Baixando e instalando ${pkg} (${catalog.version})...\nConfigurando ${pkg}...\nPronto! Digite '${pkg}' para verificar a instalacao.\n`;
      return finish();
    }
    if (sub === 'purge' || sub === 'remove') {
      if (!pkg) {
        stderr = 'Uso: sudo apt-get purge <programa>';
        return finish();
      }
      if (!state.installedPackages[pkg]) {
        stderr = `E: O pacote '${pkg}' nao esta instalado.`;
        return finish();
      }
      delete state.installedPackages[pkg];
      stdout = `Removendo completamente ${pkg} e seus arquivos de configuracao (purge)...\nConcluido.\n`;
      return finish();
    }
    stderr = 'Uso: sudo apt-get <update|upgrade|dist-upgrade|install|purge|autoremove> [pacote]';
    return finish();
  }

  if (cmdLower === 'apt-cache') {
    if (args[0] === 'search') {
      const q = (args[1] ?? '').toLowerCase();
      const allPkgs = { ...state.installedPackages, ...state.availablePackages };
      const lines = Object.entries(allPkgs)
        .filter(([name, info]) => !q || name.includes(q) || info.description.toLowerCase().includes(q))
        .map(([name, info]) => `${name.padEnd(14)} - ${info.description}`);
      stdout = lines.length ? lines.join('\n') + '\n' : `Nenhum pacote encontrado para '${q}'.\n`;
      return finish();
    }
    stderr = 'Uso: apt-cache search <aplicativo>';
    return finish();
  }

  // --- NANO & VIM (Interactive In-Terminal Editors) ---
  if (cmdLower === 'nano' || cmdLower === 'vim' || cmdLower === 'vi') {
    const fileArg = args[0] ?? 'novo_arquivo.txt';
    const abs = resolvePath(fileArg, state.cwd, home);
    const existing = getNodeAt(state.root, abs);
    if (existing && existing.type === 'dir') {
      stderr = `${cmdLower}: '${fileArg}' e um diretorio.`;
      return finish();
    }
    return finish({
      openEditor: {
        editor: cmdLower === 'nano' ? 'nano' : 'vim',
        path: abs,
        content: existing?.content ?? '',
      },
    });
  }

  // --- USERS & GROUPS ---
  if (cmdLower === 'adduser' || cmdLower === 'useradd') {
    const uname = args.find((a) => !a.startsWith('-'));
    if (!uname) {
      stderr = 'Uso: sudo adduser <nome_usuario>';
      return finish();
    }
    if (state.users[uname]) {
      stderr = `adduser: O usuario '${uname}' ja existe.`;
      return finish();
    }
    state.users[uname] = { username: uname, comment: uname, home: `/home/${uname}`, locked: false, groups: [uname] };
    state.groups[uname] = { gid: 1000 + Object.keys(state.groups).length, members: [uname] };
    const homeDir = getNodeAt(state.root, '/home');
    if (homeDir?.children) {
      homeDir.children[uname] = makeDir(uname, {}, uname, uname, 'rwxr-xr-x', 'Nov 22 agora');
    }
    stdout = `Adicionando usuario '${uname}'...\nCriando diretorio pessoal '/home/${uname}'...\nUsuario '${uname}' criado com sucesso! Confira com: ls /home/\n`;
    return finish();
  }

  if (cmdLower === 'userdel') {
    const uname = args.filter((a) => !a.startsWith('-'))[0];
    if (!uname || !state.users[uname]) {
      stderr = `userdel: usuario '${uname ?? ''}' nao encontrado`;
      return finish();
    }
    if (uname === 'root' || uname === 'aluno') {
      stderr = `userdel: nao e permitido remover '${uname}' no laboratorio.`;
      return finish();
    }
    delete state.users[uname];
    const homeDir = getNodeAt(state.root, '/home');
    if (homeDir?.children && args.some((a) => a.includes('remove') || a === '-r')) {
      delete homeDir.children[uname];
    }
    stdout = `Usuario '${uname}' removido do sistema.\n`;
    return finish();
  }

  if (cmdLower === 'usermod') {
    const targetUser = args[args.length - 1];
    const u = state.users[targetUser];
    if (!u) {
      stderr = `usermod: usuario '${targetUser ?? ''}' nao existe`;
      return finish();
    }
    if (args.includes('-L')) {
      u.locked = true;
      stdout = `Conta '${targetUser}' bloqueada (-L).\n`;
      return finish();
    }
    if (args.includes('-U')) {
      u.locked = false;
      stdout = `Conta '${targetUser}' desbloqueada (-U).\n`;
      return finish();
    }
    const gIdx = args.indexOf('-G');
    if (gIdx !== -1 && args[gIdx + 1]) {
      const grp = args[gIdx + 1];
      if (!state.groups[grp]) {
        stderr = `usermod: grupo '${grp}' nao existe (crie com sudo groupadd -g 1050 ${grp})`;
        return finish();
      }
      if (!u.groups.includes(grp)) u.groups.push(grp);
      if (!state.groups[grp].members.includes(targetUser)) state.groups[grp].members.push(targetUser);
      stdout = `Usuario '${targetUser}' adicionado ao grupo '${grp}'.\n`;
      return finish();
    }
    const cIdx = args.indexOf('-c');
    if (cIdx !== -1 && args[cIdx + 1]) {
      u.comment = args[cIdx + 1];
      stdout = `Nome de exibicao de '${targetUser}' alterado para '${u.comment}'.\n`;
      return finish();
    }
    const lIdx = args.indexOf('-l');
    if (lIdx !== -1 && args[lIdx + 1]) {
      const newName = args[lIdx + 1];
      delete state.users[targetUser];
      u.username = newName;
      u.home = `/home/${newName}`;
      state.users[newName] = u;
      stdout = `Login '${targetUser}' renomeado para '${newName}' (home: ${u.home}).\n`;
      return finish();
    }
    stdout = `usermod aplicado ao usuario '${targetUser}'.\n`;
    return finish();
  }

  if (cmdLower === 'getent' && args[0] === 'group') {
    stdout =
      Object.entries(state.groups)
        .map(([name, g]) => `${name}:x:${g.gid}:${g.members.join(',')}`)
        .join('\n') + '\n';
    return finish();
  }

  if (cmdLower === 'groupadd') {
    let gid = 1020 + Object.keys(state.groups).length;
    let gname = '';
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-g' && args[i + 1]) {
        gid = parseInt(args[++i], 10) || gid;
      } else if (!args[i].startsWith('-')) {
        gname = args[i];
      }
    }
    if (!gname) {
      stderr = 'Uso: sudo groupadd -g <id> <nome_do_grupo>';
      return finish();
    }
    state.groups[gname] = { gid, members: [] };
    stdout = `Grupo '${gname}' (GID ${gid}) criado! Confira com: getent group\n`;
    return finish();
  }

  if (cmdLower === 'groupdel') {
    const gname = args[0];
    if (!gname || !state.groups[gname]) {
      stderr = `groupdel: grupo '${gname ?? ''}' nao existe`;
      return finish();
    }
    delete state.groups[gname];
    stdout = `Grupo '${gname}' deletado.\n`;
    return finish();
  }

  if (cmdLower === 'groups') {
    const uname = args[0] ?? state.currentUser;
    const u = state.users[uname];
    if (!u) {
      stderr = `groups: '${uname}': usuario inexistente`;
      return finish();
    }
    stdout = `${uname} : ${u.groups.join(' ')}\n`;
    return finish();
  }

  if (cmdLower === 'gpasswd') {
    if (args[0] === '-d' && args[1] && args[2]) {
      const uname = args[1];
      const gname = args[2];
      const u = state.users[uname];
      const g = state.groups[gname];
      if (!u || !g) {
        stderr = `gpasswd: usuario '${uname}' ou grupo '${gname}' nao encontrado`;
        return finish();
      }
      u.groups = u.groups.filter((x) => x !== gname);
      g.members = g.members.filter((x) => x !== uname);
      stdout = `Removendo usuario ${uname} do grupo ${gname}.\n`;
      return finish();
    }
    stderr = 'Uso: sudo gpasswd -d <usuario> <grupo>';
    return finish();
  }

  if (cmdLower === 'passwd') {
    stdout = `Alterando senha para ${state.isRoot ? 'root' : state.currentUser}.\npasswd: senha atualizada com sucesso (simulado no lab).\n`;
    return finish();
  }

  // --- PERMISSIONS: CHMOD / CHOWN / CHGRP ---
  if (cmdLower === 'chmod') {
    const mode = args[0];
    const target = args[1];
    if (!mode || !target) {
      stderr = 'Uso: chmod <permissoes_octais> <arquivo>  (ex.: chmod 755 projetos/diagnostico.sh)';
      return finish();
    }
    const permStr = octalToPermString(mode);
    if (!permStr) {
      stderr = `chmod: modo '${mode}' invalido. Use 3 digitos de 0 a 7 (ex.: 755, 644, 600).`;
      return finish();
    }
    const abs = resolvePath(target, state.cwd, home);
    const node = getNodeAt(state.root, abs);
    if (!node) {
      stderr = `chmod: '${target}': Arquivo ou diretorio inexistente`;
      return finish();
    }
    node.permissions = permStr;
    stdout = `Permissoes de '${target}' alteradas para ${mode} (${permStr}). Confira com: ls -l ${target}\n`;
    return finish();
  }

  if (cmdLower === 'chown') {
    const spec = args[0];
    const target = args[1];
    if (!spec || !target) {
      stderr = 'Uso: sudo chown <usuario[:grupo]> <arquivo>';
      return finish();
    }
    const abs = resolvePath(target, state.cwd, home);
    const node = getNodeAt(state.root, abs);
    if (!node) {
      stderr = `chown: '${target}': Arquivo inexistente`;
      return finish();
    }
    const [newOwner, newGroup] = spec.split(':');
    if (newOwner) node.owner = newOwner;
    if (newGroup) node.group = newGroup;
    stdout = `Proprietario de '${target}' alterado para ${node.owner}:${node.group}.\n`;
    return finish();
  }

  if (cmdLower === 'chgrp') {
    const grp = args[0];
    const target = args[1];
    if (!grp || !target) {
      stderr = 'Uso: sudo chgrp <grupo> <arquivo>';
      return finish();
    }
    const abs = resolvePath(target, state.cwd, home);
    const node = getNodeAt(state.root, abs);
    if (!node) {
      stderr = `chgrp: '${target}': Arquivo inexistente`;
      return finish();
    }
    node.group = grp;
    stdout = `Grupo de '${target}' alterado para '${grp}'.\n`;
    return finish();
  }

  // --- NETWORKING COMMANDS ---
  if (cmdLower === 'ifconfig') {
    stdout =
      'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n' +
      '        inet 192.168.10.15  netmask 255.255.255.0  broadcast 192.168.10.255\n' +
      '        ether 02:42:ac:11:00:15  txqueuelen 1000  (Ethernet)\n' +
      '        RX packets 1420  bytes 184210 (184.2 KB)\n' +
      '        TX packets 980   bytes 91440 (91.4 KB)\n\n' +
      'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n' +
      '        inet 127.0.0.1  netmask 255.0.0.0\n';
    return finish();
  }

  if (cmdLower === 'hostname') {
    stdout = args.includes('-I') ? '192.168.10.15 10.0.0.15\n' : 'pynetsec-linux\n';
    return finish();
  }

  if (cmdLower === 'ping') {
    const target = args.find((a) => !a.startsWith('-') && !/^\d+$/.test(a)) ?? '10.0.0.10';
    const map: Record<string, string> = {
      localhost: '127.0.0.1',
      '127.0.0.1': '127.0.0.1',
      '10.0.0.10': '10.0.0.10',
      'web.if.lab': '10.0.0.10',
      'portal.if.edu.br': '10.0.0.10',
      '10.0.0.20': '10.0.0.20',
      '192.168.10.1': '192.168.10.1',
      'google.com': '142.250.219.195',
    };
    const ip = map[target.toLowerCase()] ?? target;
    stdout =
      `PING ${target} (${ip}) 56(84) bytes of data.\n` +
      `64 bytes from ${ip}: icmp_seq=1 ttl=64 time=1.24 ms\n` +
      `64 bytes from ${ip}: icmp_seq=2 ttl=64 time=1.18 ms\n` +
      `64 bytes from ${ip}: icmp_seq=3 ttl=64 time=1.31 ms\n\n` +
      `--- ${target} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss\n`;
    return finish();
  }

  if (cmdLower === 'nslookup') {
    const dom = args[0] ?? 'portal.if.edu.br';
    const dnsMap: Record<string, string> = {
      'portal.if.edu.br': '10.0.0.10',
      'web.if.lab': '10.0.0.10',
      'dns.if.lab': '10.0.0.20',
      'google.com': '142.250.219.195',
    };
    const ip = dnsMap[dom.toLowerCase()];
    stdout = ip
      ? `Server:\t\t10.0.0.20\nAddress:\t10.0.0.20#53\n\nNon-authoritative answer:\nName:\t${dom}\nAddress: ${ip}\n`
      : `Server:\t\t10.0.0.20\n** server can't find ${dom}: NXDOMAIN\n`;
    return finish();
  }

  if (cmdLower === 'netstat') {
    const onlyTcp = args.includes('-at');
    const onlyUdp = args.includes('-au');
    const tcpRows = [
      'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN',
      'tcp        0      0 192.168.10.15:52100     10.0.0.10:443           ESTABLISHED',
      'tcp        0      0 192.168.10.15:52144     10.0.0.10:80            TIME_WAIT',
    ];
    const udpRows = [
      'udp        0      0 0.0.0.0:68              0.0.0.0:*               (DHCP)',
      'udp        0      0 192.168.10.15:54012     10.0.0.20:53            (DNS)',
    ];
    const rows = onlyTcp ? tcpRows : onlyUdp ? udpRows : [...tcpRows, ...udpRows];
    stdout =
      'Active Internet connections (servers and established)\n' +
      'Proto Recv-Q Send-Q Local Address           Foreign Address         State\n' +
      rows.join('\n') +
      '\n';
    return finish();
  }

  if (cmdLower === 'netcat' || cmdLower === 'nc') {
    const udp = args.includes('-u');
    const pos = args.filter((a) => !a.startsWith('-'));
    const host = pos[0] ?? '10.0.0.10';
    const port = pos[1] ?? '80';
    stdout = `Connection to ${host} ${port} port [${udp ? 'udp' : 'tcp'}/*] succeeded!\n[Banner simulado] Servico ativo em ${host}:${port}\n`;
    return finish();
  }

  if (cmdLower === 'tcpdump') {
    stdout =
      'tcpdump: listening on eth0, link-type EN10MB (Ethernet)\n' +
      '09:20:01.112 IP 192.168.10.15.52100 > 10.0.0.10.443: Flags [S], seq 1001, length 0\n' +
      '09:20:01.114 IP 10.0.0.10.443 > 192.168.10.15.52100: Flags [S.], seq 5001, ack 1002, length 0\n' +
      '09:20:01.115 IP 192.168.10.15.52100 > 10.0.0.10.443: Flags [.], ack 1, length 0\n' +
      '09:20:02.410 IP 192.168.10.15.54012 > 10.0.0.20.53: UDP, DNS A? portal.if.edu.br\n' +
      '4 packets captured (ambiente simulado)\n';
    return finish();
  }

  if (cmdLower === 'ufw' || cmdLower === 'ufa') {
    const note = cmdLower === 'ufa' ? '(Nota: no Linux real o comando do firewall e "ufw" — Uncomplicated Firewall)\n' : '';
    if (args[0] === 'app' && args[1] === 'list') {
      stdout = `${note}Available applications:\n  ${state.ufwApps.join('\n  ')}\n`;
      return finish();
    }
    stdout = `${note}Status: active\nUse "sudo ufw app list" para listar as aplicacoes disponiveis no firewall.\n`;
    return finish();
  }

  // --- ARCHIVES: TAR / ZIP / UNZIP ---
  if (cmdLower === 'tar') {
    const flags = args[0] ?? '';
    const archiveName = args[1];
    if (!archiveName) {
      stderr = 'Uso: tar -czvf arq.tar.gz alvo | tar -xzvf arq.tar.gz [-C pasta] | tar -tvf arq.tar.gz';
      return finish();
    }
    if (flags.includes('c')) {
      const srcArg = args[2];
      if (!srcArg) {
        stderr = 'Uso: tar -czvf <arquivo.tar.gz> <arquivo_ou_pasta>';
        return finish();
      }
      const srcAbs = resolvePath(srcArg, state.cwd, home);
      const srcNode = getNodeAt(state.root, srcAbs);
      if (!srcNode) {
        stderr = `tar: ${srcArg}: Nao encontrado`;
        return finish();
      }
      const members = collectAllPaths(srcNode, srcNode.name).map((x) => x.path);
      const archAbs = resolvePath(archiveName, state.cwd, home);
      const { parent, name } = getParentAndName(state.root, archAbs);
      if (parent?.type === 'dir') {
        if (!parent.children) parent.children = {};
        parent.children[name] = makeFile(
          name,
          `[Arquivo compactado TAR.GZ contendo: ${members.join(', ')}]`,
          state.isRoot ? 'root' : state.currentUser,
          state.isRoot ? 'root' : 'alunos',
          'rw-r--r--',
          'Nov 22 agora',
          members
        );
      }
      stdout = members.join('\n') + `\nCompactado com sucesso em ${archiveName}\n`;
      return finish();
    }
    if (flags.includes('t')) {
      const archNode = getNodeAt(state.root, resolvePath(archiveName, state.cwd, home));
      if (!archNode) {
        stderr = `tar: ${archiveName}: Arquivo nao encontrado`;
        return finish();
      }
      const members = archNode.archiveMembers ?? ['notas.txt', 'projetos/diagnostico.sh'];
      stdout = members.map((m) => `-rw-r--r-- aluno/alunos   512 Nov 22 09:30 ${m}`).join('\n') + '\n';
      return finish();
    }
    if (flags.includes('x')) {
      const archNode = getNodeAt(state.root, resolvePath(archiveName, state.cwd, home));
      if (!archNode) {
        stderr = `tar: ${archiveName}: Arquivo nao encontrado`;
        return finish();
      }
      const cIdx = args.indexOf('-C');
      const destDir = cIdx !== -1 && args[cIdx + 1] ? args[cIdx + 1] : '.';
      const members = archNode.archiveMembers ?? ['extraido_tar.txt'];
      stdout =
        members.map((m) => `${destDir === '.' ? '' : `${destDir}/`}${m}`).join('\n') +
        `\nDescompactado com sucesso em '${destDir}'.\n`;
      return finish();
    }
  }

  if (cmdLower === 'zip') {
    const pos = args.filter((a) => !a.startsWith('-'));
    const zipName = pos[0];
    const target = pos[1];
    if (!zipName || !target) {
      stderr = 'Uso: zip -r <arquivo.zip> <arquivo_ou_pasta>';
      return finish();
    }
    const srcNode = getNodeAt(state.root, resolvePath(target, state.cwd, home));
    if (!srcNode) {
      stderr = `zip warning: '${target}' nao encontrado`;
      return finish();
    }
    const members = collectAllPaths(srcNode, srcNode.name).map((x) => x.path);
    const { parent, name } = getParentAndName(state.root, resolvePath(zipName, state.cwd, home));
    if (parent?.type === 'dir') {
      if (!parent.children) parent.children = {};
      parent.children[name] = makeFile(name, `[ZIP: ${members.join(', ')}]`, state.currentUser, 'alunos', 'rw-r--r--', 'Nov 22 agora', members);
    }
    stdout = members.map((m) => `  adding: ${m} (deflated 48%)`).join('\n') + '\n';
    return finish();
  }

  if (cmdLower === 'unzip') {
    const dIdx = args.indexOf('-d');
    const dest = dIdx !== -1 && args[dIdx + 1] ? args[dIdx + 1] : '.';
    const zipArg = args.find((a) => !a.startsWith('-') && a !== dest);
    if (!zipArg) {
      stderr = 'Uso: unzip <arquivo.zip> [-d <diretorio>]';
      return finish();
    }
    const zNode = getNodeAt(state.root, resolvePath(zipArg, state.cwd, home));
    if (!zNode) {
      stderr = `unzip: nao foi possivel encontrar '${zipArg}'`;
      return finish();
    }
    const members = zNode.archiveMembers ?? ['arquivo_extraido.txt'];
    stdout = `Archive:  ${zipArg}\n` + members.map((m) => `  inflating: ${dest}/${m}`).join('\n') + '\n';
    return finish();
  }

  // Check if user typed an installed program name (as taught: "nome do programa + enter")
  if (state.installedPackages[cmdLower]) {
    const info = state.installedPackages[cmdLower];
    stdout = `${cmdLower} (${info.version}) esta instalado na maquina! — ${info.description}\n`;
    return finish();
  }

  stderr = `bash: ${cmd}: comando nao encontrado. Consulte o Guia de Comandos ao lado ou digite "man ls".`;
  return finish();
}
