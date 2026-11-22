export interface LinuxDirInfo {
  path: string;
  label: string;
  description: string;
}

export const LINUX_FHS_DIRECTORIES: LinuxDirInfo[] = [
  { path: '~', label: '~ (home)', description: 'Pasta pessoal (home) do usuário atual (/home/aluno).' },
  { path: '/', label: '/ (raiz)', description: 'Diretório raiz — origem de toda a árvore de arquivos do Linux.' },
  { path: '/bin', label: '/bin', description: 'Arquivos binários essenciais (ls, cat, bash, ping, grep).' },
  { path: '/boot', label: '/boot', description: 'Arquivos de inicialização do sistema e kernel Linux.' },
  { path: '/dev', label: '/dev', description: 'Arquivos de dispositivos de entrada e saída do sistema.' },
  { path: '/etc', label: '/etc', description: 'Arquivos de configuração do sistema e da rede (hosts, netplan).' },
  { path: '/home', label: '/home', description: 'Pastas pessoais dos usuários cadastrados no sistema.' },
  { path: '/lib', label: '/lib', description: 'Arquivos de bibliotecas compartilhadas usadas pelos programas.' },
  { path: '/media', label: '/media', description: 'Pasta de montagem de dispositivos removíveis (pendrive, mídia).' },
  { path: '/opt', label: '/opt', description: 'Arquivos de aplicações de terceiros / não oficiais do sistema.' },
  { path: '/sbin', label: '/sbin', description: 'Arquivos binários de inicialização e administração (ifconfig, ufw).' },
  { path: '/tmp', label: '/tmp', description: 'Arquivos temporários criados por programas e sessões.' },
  { path: '/usr', label: '/usr', description: 'Arquivos e programas do sistema em modo leitura compartilhado.' },
  { path: '/var', label: '/var', description: 'Arquivos variáveis e logs do sistema (/var/log/syslog, auth.log).' },
];

export interface LinuxCommandRef {
  cmd: string;
  desc: string;
  runnable?: string; // command executed when clicked
}

export interface LinuxCommandCategory {
  id: string;
  title: string;
  commands: LinuxCommandRef[];
}

export const LINUX_COMMAND_CATEGORIES: LinuxCommandCategory[] = [
  {
    id: 'files',
    title: 'Manipulação de Arquivos e Diretórios',
    commands: [
      { cmd: 'pwd', desc: 'Mostra exatamente onde estamos na estrutura de diretórios', runnable: 'pwd' },
      { cmd: 'ls / ls -l / ls -a / ls -lh', desc: 'Lista arquivos, detalhes, ocultos e tamanhos legíveis', runnable: 'ls -lah' },
      { cmd: 'ls -ltr / ls -lr / ls -lS / ls -m / ls -R', desc: 'Ordena por data, reverso, tamanho, vírgula ou recursivo', runnable: 'ls -ltr' },
      { cmd: 'ls --help', desc: 'Mostra todas as opções possíveis do comando ls', runnable: 'ls --help' },
      { cmd: 'cd <dir> | cd / | cd .. | cd - | cd ~', desc: 'Navega para pasta, raiz, nível acima, anterior ou home (use Tab para autocompletar)', runnable: 'cd /var/log' },
      { cmd: 'cat arquivo | cat -n | cat -e', desc: 'Exibe conteúdo, numera linhas (-n) ou marca fim com $ (-e)', runnable: 'cat -n notas.txt' },
      { cmd: 'cat a b > c  /  cat d >> c', desc: 'Concatena arquivos sobrescrevendo (>) ou anexando ao final (>>)', runnable: 'cat notas.txt servidores.txt > combinado.txt' },
      { cmd: 'touch arquivo', desc: 'Cria um arquivo vazio ou atualiza a data de última alteração', runnable: 'touch teste.txt' },
      { cmd: 'mkdir -v dir / mkdir -p a/b/c / mkdir ../dir', desc: 'Cria diretórios, com saída verbosa (-v) ou múltiplos níveis (-p)', runnable: 'mkdir -vp lab/redes/linux' },
      { cmd: 'rm arquivo | rm -i | rm -dv | rm -rfv', desc: 'Remove arquivo, confirma (-i), apaga pasta vazia (-dv) ou recursivo (-rfv)', runnable: 'rm -dv vazia' },
      { cmd: 'rmdir dir | rmdir -p a/b', desc: 'Apaga apenas diretórios vazios (ou vários níveis com -p)', runnable: 'rmdir -p lab/redes/linux' },
      { cmd: 'cp a b | cp -r pasta1 pasta2', desc: 'Copia arquivo ou diretório recursivamente (-r)', runnable: 'cp notas.txt notas_backup.txt' },
      { cmd: 'mv origem destino', desc: 'Move ou renomeia um arquivo/pasta removendo a origem', runnable: 'mv teste.txt teste_renomeado.txt' },
      { cmd: 'man <comando> / clear / history / !!', desc: 'Manual do comando, limpar tela, ver histórico ou repetir último comando', runnable: 'man ls' },
    ],
  },
  {
    id: 'apt',
    title: 'Atualizar Pacotes (APT)',
    commands: [
      { cmd: 'sudo apt-get update', desc: 'Atualiza a lista de todos os repositórios', runnable: 'sudo apt-get update' },
      { cmd: 'sudo apt-get upgrade', desc: 'Atualiza todos os aplicativos instalados', runnable: 'sudo apt-get upgrade' },
      { cmd: 'apt-cache search <app>', desc: 'Busca um aplicativo disponível no repositório Linux', runnable: 'apt-cache search nmap' },
      { cmd: 'sudo apt-get install <app>', desc: 'Instala um aplicativo (ex.: htop, nmap, tree, curl)', runnable: 'sudo apt-get install htop' },
      { cmd: '<programa> + Enter', desc: 'Verifica se o programa está instalado na máquina', runnable: 'htop' },
      { cmd: 'sudo apt-get purge <app>', desc: 'Remove o aplicativo e seus arquivos de configuração', runnable: 'sudo apt-get purge htop' },
      { cmd: 'sudo apt-get dist-upgrade', desc: 'Atualização profunda do Linux e dependências (usar com cautela)', runnable: 'sudo apt-get dist-upgrade' },
      { cmd: 'sudo apt-get autoremove', desc: 'Remove pacotes e dependências que não estão mais sendo usados', runnable: 'sudo apt-get autoremove' },
    ],
  },
  {
    id: 'search',
    title: 'Buscas em Arquivos e Logs',
    commands: [
      { cmd: 'head -n 1 arquivo [> destino]', desc: 'Exibe o topo (ou primeira linha) de um documento', runnable: 'head -n 2 notas.txt' },
      { cmd: 'tail -n 2 arquivo | tail -f log', desc: 'Exibe o final do arquivo ou acompanha logs em tempo real (-f)', runnable: 'tail -f /var/log/syslog' },
      { cmd: "grep 'palavra' arq | grep -i | grep -c | grep -r", desc: 'Busca palavra, ignora maiúsculas (-i), conta (-c) ou recursivo (-r)', runnable: "grep -i 'erro' /var/log/syslog" },
      { cmd: "find -name '*.txt' | find -iname | find -empty", desc: 'Procura arquivos por nome, sem caixa (-iname) ou pastas vazias (-empty)', runnable: "find /home/aluno -iname '*.txt'" },
      { cmd: 'locate <arquivo> | locate -S', desc: 'Busca rápida na base indexada ou exibe estatísticas (-S)', runnable: 'locate syslog' },
      { cmd: 'which <comando>', desc: 'Mostra o caminho completo do binário que está sendo executado', runnable: 'which ping' },
    ],
  },
  {
    id: 'editors',
    title: 'Editores de Texto (Nano e Vim)',
    commands: [
      { cmd: 'nano notas.txt', desc: 'Abre o Nano (Ctrl+O salvar · Ctrl+X sair · Ctrl+W buscar · Ctrl+K recortar · Ctrl+U colar · Alt+A/6 copiar · Alt+G linha · Alt+R substituir)', runnable: 'nano notas.txt' },
      { cmd: 'vim notas.txt', desc: 'Abre o Vim (i inserir · Esc normal · :w salvar · :x salvar e sair · :q! sair sem salvar · dd apaga linha · u desfaz · /busca · :%s/a/b/g)', runnable: 'vim notas.txt' },
    ],
  },
  {
    id: 'users',
    title: 'Usuários, Grupos e Permissões',
    commands: [
      { cmd: 'sudo adduser <usuario> / ls /home/', desc: 'Cria um novo usuário e lista os diretórios em /home/', runnable: 'sudo adduser estagiario' },
      { cmd: 'sudo usermod -L / -U / -c / -l', desc: 'Bloqueia (-L), desbloqueia (-U), muda nome de exibição (-c) ou login (-l)', runnable: 'sudo usermod -L estagiario' },
      { cmd: 'sudo userdel --remove <usuario>', desc: 'Remove um usuário e sua pasta pessoal do sistema', runnable: 'sudo userdel --remove estagiario' },
      { cmd: 'getent group | groups aluno', desc: 'Exibe todos os grupos do sistema ou os grupos de um usuário', runnable: 'getent group' },
      { cmd: 'sudo groupadd -g 1050 secops', desc: 'Cria um grupo com GID específico (-g)', runnable: 'sudo groupadd -g 1050 secops' },
      { cmd: 'sudo usermod -a -G secops aluno', desc: 'Adiciona um usuário a um grupo', runnable: 'sudo usermod -a -G secops aluno' },
      { cmd: 'sudo gpasswd -d aluno secops / sudo groupdel', desc: 'Retira um usuário de um grupo ou deleta o grupo', runnable: 'sudo gpasswd -d aluno secops' },
      { cmd: 'sudo su / exit / passwd', desc: 'Entra no superusuário root, volta com exit ou altera a senha', runnable: 'sudo su' },
      { cmd: 'chmod 755 arquivo', desc: 'Define permissões octais (leitura=4, escrita=2, execução=1)', runnable: 'chmod 755 projetos/diagnostico.sh' },
      { cmd: 'sudo chown user:grupo arq / sudo chgrp grupo arq', desc: 'Altera o dono e/ou o grupo do arquivo', runnable: 'sudo chown aluno:redes notas.txt' },
    ],
  },
  {
    id: 'network',
    title: 'Rede e Firewall no Linux',
    commands: [
      { cmd: 'ifconfig / hostname -I', desc: 'Verifica interfaces de rede, máscara, MAC e IP da máquina', runnable: 'ifconfig' },
      { cmd: 'ping 10.0.0.10 / nslookup portal.if.edu.br', desc: 'Testa conectividade ICMP e consulta IP pelo DNS', runnable: 'ping 10.0.0.10' },
      { cmd: 'netstat -at / netstat -au', desc: 'Lista conexões TCP (-at) e UDP (-au) abertas ou escutando', runnable: 'netstat -at' },
      { cmd: 'netcat -u 10.0.0.20 53', desc: 'Conecta em um host/DNS através de uma porta específica (TCP ou -u UDP)', runnable: 'netcat -u 10.0.0.20 53' },
      { cmd: 'tcpdump', desc: 'Captura conexões TCP/UDP que o computador envia ou recebe', runnable: 'tcpdump' },
      { cmd: 'sudo ufw app list', desc: 'Mostra os perfis de aplicações disponíveis para liberar no firewall', runnable: 'sudo ufw app list' },
    ],
  },
  {
    id: 'archives',
    title: 'Compactar e Descompactar',
    commands: [
      { cmd: 'tar -czvf backup.tar.gz notas.txt', desc: 'Compacta arquivos/pastas em formato .tar.gz', runnable: 'tar -czvf backup.tar.gz notas.txt' },
      { cmd: 'tar -tvf backup.tar.gz', desc: 'Lista o conteúdo interno de um arquivo .tar.gz sem extrair', runnable: 'tar -tvf backup.tar.gz' },
      { cmd: 'tar -xzvf backup.tar.gz -C /tmp', desc: 'Descompacta o .tar.gz em um diretório específico (-C)', runnable: 'tar -xzvf backup.tar.gz -C /tmp' },
      { cmd: 'zip -r pacote.zip projetos', desc: 'Compacta arquivos ou pastas em formato .zip', runnable: 'zip -r pacote.zip projetos' },
      { cmd: 'unzip pacote.zip -d /tmp', desc: 'Descompacta o .zip no diretório escolhido (-d)', runnable: 'unzip pacote.zip -d /tmp' },
    ],
  },
];

export interface LinuxPracticeChallenge {
  id: string;
  title: string;
  goal: string;
  hint: string;
  check: (executedCommand: string) => boolean;
}

export const LINUX_PRACTICE_CHALLENGES: LinuxPracticeChallenge[] = [
  {
    id: 'lx-1',
    title: '1. Ver arquivos ocultos e permissões',
    goal: 'Liste a pasta atual incluindo arquivos ocultos e detalhes.',
    hint: 'ls -la ou ls -lah',
    check: (cmd) => /^ls\s+.*-[a-zA-Z]*a/.test(cmd.trim()),
  },
  {
    id: 'lx-2',
    title: '2. Investigar erros no log do sistema',
    goal: 'Use grep ignorando maiúsculas/minúsculas para buscar "erro" em /var/log/syslog.',
    hint: "grep -i 'erro' /var/log/syslog",
    check: (cmd) => /grep\s+.*-i/i.test(cmd) && /syslog/i.test(cmd),
  },
  {
    id: 'lx-3',
    title: '3. Criar árvore de diretórios de uma vez',
    goal: 'Crie múltiplos diretórios aninhados usando mkdir -p.',
    hint: 'mkdir -p lab/redes/linux',
    check: (cmd) => /^mkdir\s+.*-[a-zA-Z]*p/.test(cmd.trim()),
  },
  {
    id: 'lx-4',
    title: '4. Dar permissão de execução com chmod',
    goal: 'Altere as permissões do script projetos/diagnostico.sh para 755.',
    hint: 'chmod 755 projetos/diagnostico.sh',
    check: (cmd) => /^chmod\s+755\s+/.test(cmd.trim()),
  },
  {
    id: 'lx-5',
    title: '5. Checar interfaces e conexões TCP',
    goal: 'Inspecione o IP da máquina com ifconfig, hostname -I ou conexões com netstat -at.',
    hint: 'ifconfig ou netstat -at',
    check: (cmd) => /^(ifconfig|hostname\s+-I|netstat\s+-at)/i.test(cmd.trim()),
  },
  {
    id: 'lx-6',
    title: '6. Compactar com tar -czvf',
    goal: 'Gere um arquivo compactado .tar.gz com o comando tar.',
    hint: 'tar -czvf backup.tar.gz notas.txt',
    check: (cmd) => /^tar\s+-[a-zA-Z]*c/.test(cmd.trim()),
  },
];
