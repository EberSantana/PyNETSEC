export interface LessonBlockPlan {
  id: string;
  meetings: string;
  durationMinutes: number;
  unit: string;
  title: string;
  pynetsecPath: string;
  objectives: string[];
  timeline: {
    opening: string;
    demo: string;
    practice: string;
    debrief: string;
  };
  triggerQuestions: string[];
  commonPitfalls: string[];
  linkedActivities: string;
}

export interface EvaluationRubricRow {
  criterion: string;
  weight: string;
  insufficient: string;
  developing: string;
  proficient: string;
  advanced: string;
}

export interface DownloadableMaterialItem {
  id: string;
  audience: 'aluno' | 'professor' | 'slides';
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  files: Array<{
    format: 'PDF' | 'DOCX' | 'PPTX';
    href: string;
    filename: string;
  }>;
}

export const COURSE_OVERVIEW = {
  title: 'PyNetSec — Programa Integrado de Python, Redes, Linux e Segurança da Informação',
  level: 'Ensino Médio Técnico (Informática, Manutenção e Suporte, Redes ou Desenvolvimento de Sistemas)',
  totalHours: '40 horas-aula (20 encontros de 100 minutos / 2 aulas geminadas)',
  methodology:
    'Aprendizagem Ativa baseada em Micro-Leitura + Repetição Guiada + Simulação Visual (Packet Tracer / TCP×UDP) + Missões CTF de 15 minutos.',
  ethicsStatement:
    'Toda prática ofensiva (Red Team) ocorre exclusivamente em alvos locais simulados no navegador e vinculada à correção defensiva (Blue/Purple Team).',
};

export const TEACHER_LESSON_PLANS: LessonBlockPlan[] = [
  {
    id: 'BL01',
    meetings: 'Aulas 01 e 02',
    durationMinutes: 100,
    unit: 'Unidade 1 · Fundamentos Python',
    title: 'Boas-vindas ao PyNetSec, Variáveis, Strings e Limpeza de Logs',
    pynetsecPath: 'Estudar → 01. Python Prático (Aula 01) + Trilha → Circuito 01 (M01–M03)',
    objectives: [
      'Compreender o fluxo de trabalho do PyNetSec (Estudar → Trilha CTF → Laboratório) e configurar Nome/Turma.',
      'Declarar variáveis, formatar saídas com f-strings e higienizar textos com .strip(), .lower() e .replace().',
      'Interpretar mensagens de erro traduzidas no console Python sem travar.',
    ],
    timeline: {
      opening:
        '15 min — Apresentação do curso, pacto ético de uso do laboratório e cadastro de Nome/Turma no perfil do PyNetSec.',
      demo:
        '25 min — Projetar a Aula 01 no Centro de Estudos. Mostrar ao vivo como um log real chega "sujo" com espaços e maiúsculas e testar no Sandbox Rápido.',
      practice:
        '45 min — Alunos completam os 3 passos do Treino por Repetição da Aula 01 e avançam para as Missões M01, M02 e M03 no Laboratório.',
      debrief:
        '15 min — Projetar o Ranking/Progresso, revisar o erro mais comum da turma (esquecer aspas ou f antes da string) e conectar com auditoria de logs.',
    },
    triggerQuestions: [
      'Por que um sistema de login pode falhar se o usuário digitar " Admin " com espaço no fim?',
      'Qual a diferença entre imprimir uma variável e imprimir o nome dela entre aspas?',
    ],
    commonPitfalls: [
      'Esquecer a letra f antes das aspas na f-string (imprime "{ip}" literal). Intervenção: pedir que comparem a saída com o exemplo ao lado.',
      'Usar .strip() sem atribuir de volta à variável. Intervenção: reforçar que strings em Python são imutáveis.',
    ],
    linkedActivities: 'Aula 01 (3 treinos) + Missões M01, M02 e M03',
  },
  {
    id: 'BL02',
    meetings: 'Aulas 03 e 04',
    durationMinutes: 100,
    unit: 'Unidade 1 · Fundamentos Python',
    title: 'Tomada de Decisão (if/elif/else), Listas e Loops for em Segurança',
    pynetsecPath: 'Estudar → 01. Python Prático (Aulas 02 e 03) + Trilha → M04–M08',
    objectives: [
      'Aplicar estruturas condicionais if/elif/else com indentação correta de 4 espaços para validar portas e senhas.',
      'Percorrer listas de IPs, logs e eventos usando laços for e acumuladores.',
      'Automatizar verificações repetitivas que seriam lentas manualmente.',
    ],
    timeline: {
      opening:
        '15 min — Dinâmica rápida no quadro: "Como um firewall decide liberar ou bloquear a porta 22?" Traduzir a frase em português para if/else.',
      demo:
        '25 min — Demonstrar no PyNetSec a importância dos dois-pontos (:) e da tecla Tab (4 espaços). Rodar exemplo com lista de 5 portas filtrando as críticas.',
      practice:
        '45 min — Duplas completam os treinos das Aulas 02 e 03 e resolvem as Missões M04 a M08 (usando os Presets rápidos quando precisarem).',
      debrief:
        '15 min — Comparar duas soluções diferentes de alunos para a mesma missão e discutir legibilidade de código.',
    },
    triggerQuestions: [
      'O que acontece se o código dentro do if não estiver recuado para a direita?',
      'Como mudar uma regra de bloqueio para verificar 500 IPs em vez de apenas 1?',
    ],
    commonPitfalls: [
      'Confundir = (atribuição) com == (comparação). Intervenção: usar a analogia "um = guarda, dois == perguntam".',
      'IndentationError ao misturar espaços. Intervenção: orientar o uso da tecla Tab no editor do PyNetSec.',
    ],
    linkedActivities: 'Aulas 02 e 03 (6 treinos) + Missões M04 a M08',
  },
  {
    id: 'BL03',
    meetings: 'Aulas 05 e 06',
    durationMinutes: 100,
    unit: 'Unidade 1 · Fundamentos Python',
    title: 'Dicionários, Contagem de Eventos e Automação com ipaddress',
    pynetsecPath: 'Estudar → 01. Python Prático (Aulas 04 e 05) + Trilha → M09–M15',
    objectives: [
      'Utilizar dicionários (chave: valor) para contar tentativas de login por IP e detectar força bruta.',
      'Manipular endereços IPv4 e sub-redes CIDR reais usando o módulo ipaddress do Python.',
      'Diferenciar endereços privados (RFC 1918), públicos, endereço de rede e broadcast.',
    ],
    timeline: {
      opening:
        '15 min — Mostrar um extrato fictício de 20 tentativas de acesso SSH e perguntar: "Qual IP atacou mais vezes?" Introduzir contagem por dicionário.',
      demo:
        '25 min — Demonstrar contagem.get(ip, 0) + 1 e depois abrir o módulo ipaddress no Sandbox Python (ip_network("192.168.10.0/24")).',
      practice:
        '45 min — Resolução individual ou em duplas das Missões M09 e M10 (fechando Circuito 01) e M11 a M15 (Circuito 02 — Redes em Python).',
      debrief:
        '15 min — Revisão coletiva sobre quantos hosts úteis existem em uma rede /24 (254) e por que .0 e .255 são reservados.',
    },
    triggerQuestions: [
      'Por que 192.168.1.0/24 tem 256 endereços, mas apenas 254 podem ir em computadores?',
      'Como saber rapidamente se 192.168.10.25 e 192.168.10.1 estão na mesma LAN?',
    ],
    commonPitfalls: [
      'Tentar somar em uma chave inexistente do dicionário (KeyError). Intervenção: enfatizar o padrão .get(chave, 0) + 1.',
      'Passar IP de host com máscara para ip_network() sem strict=False. Intervenção: mostrar a diferença entre ip_address() e ip_network().',
    ],
    linkedActivities: 'Aulas 04 e 05 + Missões M09 a M15 (Conclusão Circuitos 01 e 02)',
  },
  {
    id: 'BL04',
    meetings: 'Aulas 07 e 08',
    durationMinutes: 100,
    unit: 'Unidade 2 · Arquitetura de Redes',
    title: 'Tipos de Redes (PAN/LAN/MAN/WAN), Topologias, Meios e Modelo OSI',
    pynetsecPath: 'Estudar → 02. Redes & TCP/UDP → Fundamentos & Topologias + Trilha → M22–M28',
    objectives: [
      'Classificar redes quanto à abrangência (PAN, LAN, WLAN, MAN, WAN) com exemplos do cotidiano escolar.',
      'Comparar topologias Estrela, Barramento, Anel e Malha avaliando impacto de falhas e custo.',
      'Relacionar as 7 camadas do Modelo OSI (e 4 da pilha TCP/IP) com equipamentos reais (cabo, switch, roteador, navegador).',
    ],
    timeline: {
      opening:
        '15 min — Mapear com a turma a rede do próprio laboratório de informática da escola: onde está o switch, o cabo UTP, o roteador e o link WAN.',
      demo:
        '25 min — Navegar na aba Fundamentos & Topologias do PyNetSec: simular falha de cabo nas topologias e percorrer o visualizador interativo do Modelo OSI.',
      practice:
        '45 min — Alunos exploram Meios de Transmissão (UTP, Fibra, Wi-Fi), modos Simplex/Half/Full-Duplex e concluem as Missões M22 a M28.',
      debrief:
        '15 min — Quiz relâmpago oral: o professor cita um componente (MAC, IP, Porta 443, Fibra) e a turma responde a camada OSI correspondente.',
    },
    triggerQuestions: [
      'Se o cabo principal de uma topologia em Barramento romper, o que acontece com o restante dos computadores?',
      'Por que o Switch trabalha na Camada 2 (MAC) e o Roteador na Camada 3 (IP)?',
    ],
    commonPitfalls: [
      'Confundir Hub (repete para todos / domínio de colisão único) com Switch (encaminha por MAC). Intervenção: usar a analogia megafone vs. telefonista.',
      'Achar que "Wi-Fi é a Internet". Intervenção: separar WLAN (acesso local sem fio) de WAN (conexão externa via ISP).',
    ],
    linkedActivities: 'Estudo Visual de Fundamentos + Missões M22 a M28',
  },
  {
    id: 'BL05',
    meetings: 'Aulas 09 e 10',
    durationMinutes: 100,
    unit: 'Unidade 2 · Protocolos de Transporte',
    title: 'TCP vs. UDP na Prática: Three-Way Handshake, Cabeçalhos e Portas',
    pynetsecPath: 'Estudar → 02. Redes & TCP/UDP → Simulador TCP × UDP & TCP vs. UDP (Teoria) + M33–M34',
    objectives: [
      'Explicar o funcionamento do Three-Way Handshake TCP (SYN → SYN-ACK → ACK) e a garantia de entrega.',
      'Justificar quando escolher UDP (baixa latência: DNS, jogos online, streaming) versus TCP (integridade: HTTP/HTTPS, SSH, arquivos).',
      'Identificar portas bem conhecidas (22, 53, 67/68, 80, 443) e o tamanho dos cabeçalhos (20+ bytes TCP vs. 8 bytes UDP).',
    ],
    timeline: {
      opening:
        '15 min — Provocação: "Por que um travamento em chamada de vídeo pula um pedaço da fala em vez de repetir tudo 5 segundos depois?"',
      demo:
        '25 min — Abrir o Simulador TCP × UDP lado a lado no PyNetSec. Rodar a animação passo a passo comparando o aperto de mão TCP com o disparo direto UDP.',
      practice:
        '45 min — Estudo da lição TCP vs. UDP (cabeçalhos e casos de uso) + resolução das Missões M29 a M35 (incluindo M33 e M34).',
      debrief:
        '15 min — Mesa-redonda rápida: classificar 6 aplicativos reais dos alunos (WhatsApp voz, PIX/banco, YouTube ao vivo, download de ISO, Minecraft, SSH) em TCP ou UDP.',
    },
    triggerQuestions: [
      'Por que o cabeçalho UDP tem apenas 8 bytes enquanto o TCP tem no mínimo 20 bytes?',
      'O que o TCP faz se o pacote #3 de um arquivo de 10 pacotes se perder no caminho?',
    ],
    commonPitfalls: [
      'Achar que UDP é "pior" que TCP. Intervenção: mostrar que velocidade e baixa latência são escolhas de engenharia, não defeitos.',
      'Inverter a ordem do Handshake (dizer ACK antes de SYN-ACK). Intervenção: usar a analogia da ligação telefônica ("Alô?" → "Alô, estou ouvindo!" → "Ótimo, vamos falar!").',
    ],
    linkedActivities: 'Simulador TCP × UDP + Lição Protocolos + Missões M29 a M35',
  },
  {
    id: 'BL06',
    meetings: 'Aulas 11 e 12',
    durationMinutes: 100,
    unit: 'Unidade 3 · Prática no Packet Tracer',
    title: 'Montando Redes LAN, Ponto-a-Ponto e Wi-Fi + DHCP no Packet Tracer',
    pynetsecPath: 'Laboratório → Packet Tracer (ou Estudar → Redes → Packet Tracer)',
    objectives: [
      'Montar topologias físicas e lógicas (LAN Estrela, Ponto-a-Ponto Crossover e WLAN com Access Point).',
      'Configurar endereços IPv4, máscaras de sub-rede, DNS e servidor DHCP (fluxo DORA).',
      'Observar quadros ARP, ICMP, DHCP, DNS e HTTP trafegando no Sniffer PDU ao vivo.',
    ],
    timeline: {
      opening:
        '15 min — Apresentar a bancada Packet Tracer do PyNetSec: equipamentos (PC, Notebook, Switch, Roteador, Servidor, AP) e tipos de cabos.',
      demo:
        '25 min — Carregar o cenário "LAN Estrela", executar ping 192.168.10.50 e curl portal.escola.local mostrando ARP + ICMP + Handshake TCP no Sniffer.',
      practice:
        '45 min — Roteiro em 3 desafios: (1) Corrigir o IP errado do PC-B no cenário Ponto-a-Ponto; (2) Rodar dhclient no NB-02 no cenário Wi-Fi; (3) Construir uma LAN com 3 PCs + 1 Switch + 1 Servidor na Bancada em Branco.',
      debrief:
        '15 min — Mostrar o Sniffer PDU de um aluno destacando a diferença entre ARP (Camada 2) e ICMP (Camada 3).',
    },
    triggerQuestions: [
      'Por que antes do primeiro ping aparece um pacote ARP amarelo viajando pelo switch?',
      'No cenário Ponto-a-Ponto, por que PC-A (192.168.1.10/24) não conseguiu falar com PC-B (192.168.50.20/24) mesmo com o cabo ligado?',
    ],
    commonPitfalls: [
      'Esquecer de ligar o cabo certo ou deixar equipamento sem IP. Intervenção: checar os pontinhos verdes/vermelhos nos cabos e usar "ip addr" no CLI.',
      'Ativar DHCP no servidor mas esquecer de verificar se existe enlace L2 até o notebook. Intervenção: lembrar que DHCP Discover é broadcast local.',
    ],
    linkedActivities: 'Packet Tracer: LAN Estrela + Ponto-a-Ponto + Wi-Fi DHCP + Bancada Livre',
  },
  {
    id: 'BL07',
    meetings: 'Aulas 13 e 14',
    durationMinutes: 100,
    unit: 'Unidade 3 · Roteamento e Troubleshooting',
    title: 'Roteamento entre Sub-redes (LAN ↔ LAN), Redundância e Diagnóstico',
    pynetsecPath: 'Laboratório → Packet Tracer (Cenários Roteador & Anel) + Estudar → Dicas de Troubleshooting',
    objectives: [
      'Explicar o papel do Gateway Padrão para conectar duas sub-redes distintas por meio de um Roteador L3.',
      'Usar traceroute para mapear saltos de roteamento e diagnosticar falhas de rota e de cabo rompido.',
      'Validar tolerância a falhas simulando rompimento de enlace na topologia em Anel.',
    ],
    timeline: {
      opening:
        '15 min — Pergunta-chave: "Se a rede dos alunos é 192.168.10.0/24 e a dos servidores é 10.0.20.0/24, um Switch sozinho resolve?"',
      demo:
        '25 min — Abrir o cenário "Duas Sub-redes com Roteador", inspecionar fa0/0 e fa0/1 de R1-CORE e rodar traceroute 10.0.20.50 no PC-A1. Depois apagar o gateway do PC-A1 para mostrar o pacote DROP.',
      practice:
        '45 min — Alunos executam troubleshooting dirigido: (1) Testar falha de gateway e corrigir; (2) No cenário Anel Redundante, clicar na fibra SW-01 ↔ SW-03 para derrubá-la (DOWN) e validar o desvio do ping; (3) Consultar o painel Dicas de Troubleshooting.',
      debrief:
        '15 min — Sistematizar a ordem de ouro do técnico de redes: Camada 1 (cabo/link) → Camada 2 (MAC/ARP) → Camada 3 (IP/Gateway) → Camada 7 (DNS/HTTP).',
    },
    triggerQuestions: [
      'O que acontece se o PC-A1 tiver gateway correto, mas o SRV-APP na outra rede estiver sem gateway?',
      'Como o traceroute descobre cada roteador no caminho? (Papel do campo TTL).',
    ],
    commonPitfalls: [
      'Configurar no PC o IP da interface errada do roteador (ex.: pôr 10.0.20.1 como gateway de quem está em 192.168.10.0/24). Intervenção: usar o alerta automático de sub-rede do inspetor.',
      'Pular direto para DNS sem testar ping por IP primeiro. Intervenção: reforçar o método de camadas.',
    ],
    linkedActivities: 'Packet Tracer: Roteador L3 + Anel Redundante + Painel Troubleshooting',
  },
  {
    id: 'BL08',
    meetings: 'Aulas 15 e 16',
    durationMinutes: 100,
    unit: 'Unidade 4 · Linux & Configuração LAN',
    title: 'Linux Essencial (FHS, Permissões) e Configuração de LAN no Terminal',
    pynetsecPath: 'Estudar → 04. Linux Essencial + 02. Redes → Configuração LAN (Linux) + Trilha → M36–M45',
    objectives: [
      'Navegar na árvore de diretórios FHS (/etc, /var/log, /home, /bin) e operar comandos básicos (ls, cat, grep, chmod, apt).',
      'Configurar interface LAN no Linux via iproute2 (ip link, ip addr, ip route) e net-tools (ifconfig, route) além de dhclient.',
      'Executar o check-list de validação de conectividade da Camada 1 até a Camada 7.',
    ],
    timeline: {
      opening:
        '15 min — Mostrar por que servidores e roteadores corporativos rodam Linux em modo texto (estabilidade, leveza, automação).',
      demo:
        '25 min — Percorrer o guia interativo "Configuração LAN (Linux)", alternando entre DHCP e IP Estático e entre ip e ifconfig, testando os comandos equivalentes no Terminal Linux.',
      practice:
        '45 min — Alunos completam o Check-list de 6 etapas de conectividade LAN e resolvem as Missões M36 a M45 no Circuito 05.',
      debrief:
        '15 min — Revisar diferenças entre configuração temporária (comando ip) e permanente (Netplan /etc/netplan/*.yaml).',
    },
    triggerQuestions: [
      'Por que o ping em 127.0.0.1 funciona mesmo sem cabo de rede conectado?',
      'Se o ping em 8.8.8.8 funciona mas "ping google.com" falha, onde está o problema?',
    ],
    commonPitfalls: [
      'Esquecer sudo ao alterar interface de rede ou arquivo /etc/resolv.conf. Intervenção: explicar privilégios de root e permissões chmod.',
      'Confundir barra / (raiz Linux) com barra invertida \\ (Windows). Intervenção: reforçar com exemplos de caminhos FHS.',
    ],
    linkedActivities: 'Guia LAN Linux (6 checks) + Terminal Linux + Missões M36 a M45',
  },
  {
    id: 'BL09',
    meetings: 'Aulas 17 e 18',
    durationMinutes: 100,
    unit: 'Unidade 5 · Segurança da Informação',
    title: 'Tríade CID, Firewall, Criptografia, IDS/IPS e Badges de Defesa',
    pynetsecPath: 'Estudar → 03. Segurança da Informação + Trilha → Circuito 03 (M16–M19)',
    objectives: [
      'Aplicar os pilares Confidencialidade, Integridade e Disponibilidade (CID) e normas ISO 27001/27002 em cenários reais.',
      'Diferenciar Firewall (controle de tráfego), Criptografia (sigilo e hash/integridade), IDS (detecção passiva) e IPS (prevenção ativa).',
      'Implementar codificação Base64, Cifra de César e verificação de integridade SHA-256 em Python.',
    ],
    timeline: {
      opening:
        '15 min — Explorar o mapa de falhas físicas/lógicas do escritório no módulo Segurança da Informação (senhas em post-it, tela desbloqueada, servidor sem acesso restrito).',
      demo:
        '25 min — Apresentar a seção Conceitos de Defesa (Firewall, Criptografia, IDS × IPS) e a diferença entre codificação (Base64), cifra reversível e hash unidirecional (SHA-256).',
      practice:
        '45 min — Alunos resolvem as 4 Missões Teóricas de Defesa (D01–D04) para desbloquear suas Badges no perfil e completam as Missões CTF M16 a M19.',
      debrief:
        '15 min — Exibir o mural de Badges conquistadas e debater: "Por que nunca devemos guardar senhas em texto puro nem em Base64 no banco de dados?"',
    },
    triggerQuestions: [
      'Qual a diferença prática entre um IDS e um IPS quando detectam um ataque de força bruta?',
      'Se um ransomware criptografa os arquivos da escola, qual(is) pilar(es) da tríade CID foi(ram) atingido(s)?',
    ],
    commonPitfalls: [
      'Achar que Base64 é criptografia segura. Intervenção: demonstrar em 10 segundos a decodificação sem chave.',
      'Confundir Hash (não volta ao original) com Criptografia Simétrica/Assimétrica. Intervenção: usar a analogia da impressão digital.',
    ],
    linkedActivities: 'Missões Teóricas D01–D04 (4 Badges) + Missões CTF M16 a M19',
  },
  {
    id: 'BL10',
    meetings: 'Aulas 19 e 20',
    durationMinutes: 100,
    unit: 'Unidade 5 · Encerramento Integrador',
    title: 'Chefão Duplo Blue/Red Team (M20A/M20B), Sandbox Ops e Chefão Final M50',
    pynetsecPath: 'Trilha → M20A, M20B, M46–M50 + Sandbox Python & Redes + Ranking/Badges',
    objectives: [
      'Integrar Python, Redes, Linux e Segurança em um incidente completo de resposta (Blue Team) e validação ética (Red/Purple Team).',
      'Usar ferramentas de diagnóstico e reconhecimento ético no Sandbox (ping, whois, nmap, sniff) de forma responsável.',
      'Propor medidas reais de remediação (Purple Team) para vulnerabilidades identificadas.',
    ],
    timeline: {
      opening:
        '15 min — Leitura coletiva do Termo de Ética da Arena CTF e divisão das metas finais (M20A/M20B e M46–M50).',
      demo:
        '20 min — Mostrar o Sandbox Python & Redes (comandos ping, nmap, sniff) e explicar o fluxo Purple Team: encontrar a falha só tem valor quando sabemos corrigi-la.',
      practice:
        '50 min — Maratona CTF supervisionada: conclusão das Missões M20A (Forense), M20B (Auditoria Ética + Reflexão Purple Team) e M46–M50.',
      debrief:
        '15 min — Encerramento com Placar da Turma (Google Sheets), emissão dos Cards/Badges de conquista e autoavaliação da turma.',
    },
    triggerQuestions: [
      'Quais duas correções reais impediriam o ataque simulado na Missão M20B em um servidor de produção?',
      'Como o profissional de suporte/redes usa o mesmo conhecimento de portas e logs para proteger a empresa?',
    ],
    commonPitfalls: [
      'Focar apenas em capturar a flag sem preencher a reflexão Purple Team. Intervenção: pontuar explicitamente a proposta de correção na rubrica.',
      'Tentar rodar ferramentas ofensivas fora do ambiente simulado. Intervenção: reforçar legislação (Lei Carolina Dieckmann / Marco Civil) e ética profissional.',
    ],
    linkedActivities: 'Missões M20A, M20B + Reflexão Purple Team + M46–M50 + Fechamento do Ranking',
  },
];

export const EVALUATION_RUBRIC: EvaluationRubricRow[] = [
  {
    criterion: '1. Lógica & Scripts Python (Circuitos 01 e 02)',
    weight: '25%',
    insufficient: 'Copia código sem entender erros básicos de sintaxe ou indentação.',
    developing: 'Resolve scripts guiados com ajuda das dicas, mas ainda erra loops ou dicionários.',
    proficient: 'Escreve scripts limpos com if/for/dict e módulo ipaddress validando dados de rede.',
    advanced: 'Adapta soluções com autonomia, interpreta tracebacks e cria automações no Sandbox.',
  },
  {
    criterion: '2. Redes & Packet Tracer (Montagem e Roteamento)',
    weight: '25%',
    insufficient: 'Não identifica sub-redes nem consegue conectar equipamentos corretamente.',
    developing: 'Configura IP estático na mesma LAN, mas apresenta dificuldade com Gateway e Roteador.',
    proficient: 'Monta LAN, Wi-Fi/DHCP e LAN↔LAN com roteador, validando ping, traceroute e DNS.',
    advanced: 'Diagnostica e corrige falhas de rota/cabo com método por camadas (L1→L7) analisando o Sniffer PDU.',
  },
  {
    criterion: '3. Linux & Troubleshooting Prático (Circuito 05)',
    weight: '25%',
    insufficient: 'Não navega no terminal nem reconhece comandos básicos de interface.',
    developing: 'Executa comandos com cola, mas confunde sintaxe de ip/ifconfig ou permissões.',
    proficient: 'Configura rede via ip/dhclient, usa grep/chmod e conclui o check-list de conectividade.',
    advanced: 'Combina comandos de rede e análise de logs para isolar causa raiz com rapidez.',
  },
  {
    criterion: '4. Segurança da Informação & Postura Ética (Circuito 03)',
    weight: '25%',
    insufficient: 'Confunde conceitos básicos de CID, Firewall e Criptografia.',
    developing: 'Identifica ameaças comuns, mas ainda confunde codificação (Base64) com hash/cifra.',
    proficient: 'Conquista as Badges de Defesa (D01–D04), resolve M16–M20B e diferencia IDS de IPS.',
    advanced: 'Elabora correções sólidas de Purple Team conectando defesa em profundidade ao mundo real.',
  },
];

export const DOWNLOADABLE_MATERIALS: DownloadableMaterialItem[] = [
  {
    id: 'ebook-aluno',
    audience: 'aluno',
    title: 'E-book do Aluno — Guia Completo PyNetSec',
    subtitle: 'Ensino Médio Técnico · Python, Redes, Packet Tracer, Linux & Segurança',
    description:
      'Apostila ilustrada em linguagem acessível para acompanhar todas as aulas do ambiente PyNetSec: guia de comandos Python, fundamentos de redes, TCP vs. UDP, roteiro de Packet Tracer, configuração LAN no Linux, Segurança da Informação e mapa das 50 missões.',
    highlights: [
      '7 capítulos alinhados 100% às telas do PyNetSec',
      'Tabelas de consulta rápida de Python, Linux, Portas TCP/UDP e Troubleshooting',
      'Passo a passo dos cenários Packet Tracer (LAN, P2P, Roteador, Wi-Fi DHCP e Anel)',
      'Sem spoilers das flags — ideal para distribuir à turma inteira',
    ],
    files: [
      {
        format: 'PDF',
        href: '/materiais/PyNetSec_Ebook_Aluno.pdf',
        filename: 'PyNetSec_Ebook_Aluno.pdf',
      },
      {
        format: 'DOCX',
        href: '/materiais/PyNetSec_Ebook_Aluno.docx',
        filename: 'PyNetSec_Ebook_Aluno.docx',
      },
    ],
  },
  {
    id: 'guia-professor',
    audience: 'professor',
    title: 'E-book & Guia de Aula do Professor',
    subtitle: 'Plano de 40h (20 Aulas) · Roteiro Minuto a Minuto · Rubrica · Gabaritos',
    description:
      'Manual docente completo para ministrar a disciplina no Ensino Médio Técnico: cronograma de 20 aulas com divisão exata do tempo, perguntas disparadoras, erros comuns dos alunos e como intervir, rubrica de avaliação e gabarito de todas as 50 missões CTF + missões de defesa.',
    highlights: [
      '10 blocos detalhados cobrindo 20 aulas geminadas (40h totais)',
      'Guia de operação do Modo Livre, Google Sheets Ranking e Packet Tracer em sala',
      'Rubrica de avaliação formativa em 4 dimensões (25% cada)',
      'Gabarito completo das 50 missões CTF, 4 missões de defesa (D01–D04) e cenários Packet Tracer',
    ],
    files: [
      {
        format: 'PDF',
        href: '/materiais/PyNetSec_Guia_Professor.pdf',
        filename: 'PyNetSec_Guia_Professor.pdf',
      },
      {
        format: 'DOCX',
        href: '/materiais/PyNetSec_Guia_Professor.docx',
        filename: 'PyNetSec_Guia_Professor.docx',
      },
    ],
  },
  {
    id: 'slides-aulas',
    audience: 'slides',
    title: 'Apresentação de Aulas em PowerPoint (22 Slides)',
    subtitle: 'Widescreen 16:9 · Diagramas Nativos · Notas do Apresentador em Cada Slide',
    description:
      'Deck pronto para projetar em sala de aula cobrindo todos os pilares do PyNetSec (Python, Topologias, OSI, TCP vs. UDP, Packet Tracer, Roteamento, Linux LAN, Troubleshooting e Segurança da Informação), com roteiro de fala nas notas do apresentador.',
    highlights: [
      '22 slides editáveis em PowerPoint (.pptx) com alta legibilidade em projetor',
      'Diagramas visuais de Three-Way Handshake TCP, DHCP DORA e Roteamento LAN↔LAN',
      'Tabelas comparativas prontas de Topologias, Portas TCP/UDP e IDS × IPS',
      'Notas do apresentador com dicas de condução e perguntas para a turma',
    ],
    files: [
      {
        format: 'PPTX',
        href: '/materiais/PyNetSec_Apresentacao_Aulas.pptx',
        filename: 'PyNetSec_Apresentacao_Aulas.pptx',
      },
    ],
  },
];
