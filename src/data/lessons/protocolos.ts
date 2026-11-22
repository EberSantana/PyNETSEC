import { StudyLesson } from '../../types/ctf';

export interface ProtocolMechanismStep {
  step: string;
  label: string;
  direction?: 'client-to-server' | 'server-to-client' | 'both';
  detail: string;
}

export interface HeaderFieldSpec {
  field: string;
  size: string;
  purpose: string;
}

export interface ProtocolProfile {
  id: 'tcp' | 'udp';
  acronym: string;
  fullName: string;
  rfc: string;
  tagline: string;
  analogy: string;
  headerSize: string;
  pythonSocket: string;
  summary: string;
  howItWorks: ProtocolMechanismStep[];
  headerFields: HeaderFieldSpec[];
  keyFeatures: {
    title: string;
    description: string;
  }[];
  strengths: string[];
  tradeoffs: string[];
}

export interface ProtocolComparisonRow {
  criterion: string;
  tcp: string;
  udp: string;
  practicalImpact: string;
}

export interface ProtocolUseCase {
  id: string;
  protocol: 'TCP' | 'UDP';
  service: string;
  ports: string;
  category: string;
  scenario: string;
  whyItFits: string;
}

export interface ProtocolGoldenRule {
  title: string;
  protocol: 'TCP' | 'UDP';
  question: string;
  answer: string;
}

export interface ProtocolosLessonContent {
  lessonId: string;
  title: string;
  subtitle: string;
  osiLayer: string;
  readTimeMinutes: number;
  overviewParagraphs: string[];
  tcp: ProtocolProfile;
  udp: ProtocolProfile;
  comparisonRows: ProtocolComparisonRow[];
  useCases: ProtocolUseCase[];
  goldenRules: ProtocolGoldenRule[];
  relatedMissionIds: string[];
}

export const PROTOCOLOS_DEEP_DIVE: ProtocolosLessonContent = {
  lessonId: 'L10',
  title: 'Protocolos de Transporte: TCP vs. UDP',
  subtitle:
    'Diferenças arquiteturais, funcionamento interno na Camada 4 e escolha correta para cada aplicação de rede',
  osiLayer: 'Camada 4 — Transporte (Modelo OSI / TCP-IP)',
  readTimeMinutes: 6,
  overviewParagraphs: [
    'Enquanto o protocolo IP (Camada 3) sabe apenas como levar pacotes de um computador até outro através de roteadores, ele não garante que os dados cheguem intactos, nem sabe qual programa dentro do computador deve receber cada pacote. Quem resolve isso é a Camada 4 (Transporte), utilizando números de porta (0 a 65535) e dois protocolos principais: TCP e UDP.',
    'O TCP (Transmission Control Protocol) prioriza confiabilidade, integridade e ordenação: ele abre uma sessão antes de enviar qualquer dado, numera cada pedaço, exige confirmações e retransmite tudo o que se perder pelo caminho.',
    'O UDP (User Datagram Protocol) prioriza velocidade e latência mínima: ele dispara datagramas diretamente sem negociação prévia, sem controle de ordem e sem retransmissão — ideal para tráfego em tempo real, onde esperar um pacote atrasado estraga a experiência.',
  ],
  tcp: {
    id: 'tcp',
    acronym: 'TCP',
    fullName: 'Transmission Control Protocol (Protocolo de Controle de Transmissão)',
    rfc: 'RFC 793 / RFC 9293',
    tagline: 'Orientado à conexão, confiável, ordenado e com controle de fluxo',
    analogy:
      'Carta registrada com aviso de recebimento e páginas numeradas: se faltar a página 3, o destinatário pede reenvio antes de montar o livro.',
    headerSize: '20 bytes (mínimo) até 60 bytes com opções',
    pythonSocket: 'socket.SOCK_STREAM',
    summary:
      'O TCP estabelece um circuito lógico confiável ponta a ponta entre cliente e servidor. Ele garante que todos os bytes enviados cheguem sem corrupção, sem duplicatas e exatamente na mesma sequência em que foram transmitidos.',
    howItWorks: [
      {
        step: '01',
        label: 'SYN (Synchronize)',
        direction: 'client-to-server',
        detail:
          'O cliente envia um segmento com a flag SYN ativada e um Número de Sequência Inicial (ISN) aleatório para pedir a abertura da conexão.',
      },
      {
        step: '02',
        label: 'SYN-ACK (Synchronize-Acknowledge)',
        direction: 'server-to-client',
        detail:
          'O servidor aceita o pedido, responde com SYN + ACK, informa seu próprio ISN e confirma o recebimento somando +1 ao número do cliente.',
      },
      {
        step: '03',
        label: 'ACK (Acknowledge)',
        direction: 'client-to-server',
        detail:
          'O cliente confirma o ISN do servidor. O Three-Way Handshake está concluído e a conexão entra no estado ESTABLISHED para troca de dados.',
      },
      {
        step: '04',
        label: 'Transferência Confiável & Janela Deslizante',
        direction: 'both',
        detail:
          'Os dados são divididos em segmentos numerados. Se um segmento não recebe ACK dentro do tempo limite (RTO), o remetente retransmite automaticamente.',
      },
      {
        step: '05',
        label: 'Encerramento em 4 Vias (FIN / ACK)',
        direction: 'both',
        detail:
          'Quando terminam a comunicação, ambos os lados trocam segmentos FIN e ACK para liberar portas e memória de forma limpa.',
      },
    ],
    headerFields: [
      {
        field: 'Porta Origem / Destino',
        size: '4 bytes (16 bits cada)',
        purpose: 'Identifica a aplicação remetente (porta efêmera) e o serviço destino (ex.: 443).',
      },
      {
        field: 'Número de Sequência (SEQ)',
        size: '4 bytes (32 bits)',
        purpose: 'Marca a posição do primeiro byte do segmento para remontagem na ordem correta.',
      },
      {
        field: 'Número de Confirmação (ACK)',
        size: '4 bytes (32 bits)',
        purpose: 'Indica qual é o próximo byte esperado pelo receptor, confirmando tudo o que veio antes.',
      },
      {
        field: 'Flags de Controle (SYN, ACK, FIN, RST, PSH)',
        size: '9 bits',
        purpose: 'Controlam abertura, confirmação, encerramento normal (FIN) ou aborto imediato (RST).',
      },
      {
        field: 'Tamanho da Janela (Window Size)',
        size: '2 bytes (16 bits)',
        purpose: 'Controle de fluxo: avisa quantos bytes o receptor consegue guardar no buffer sem transbordar.',
      },
      {
        field: 'Checksum',
        size: '2 bytes (16 bits)',
        purpose: 'Detecta bits corrompidos no cabeçalho e nos dados durante o trajeto físico.',
      },
    ],
    keyFeatures: [
      {
        title: 'Retransmissão Automática',
        description:
          'Perdas por congestionamento ou ruído são recuperadas via temporizador (timeout) ou Fast Retransmit (3 ACKs duplicados).',
      },
      {
        title: 'Controle de Fluxo (Flow Control)',
        description:
          'Impede que um servidor rápido sobrecarregue um celular ou computador mais lento usando a Janela Deslizante.',
      },
      {
        title: 'Controle de Congestionamento',
        description:
          'Algoritmos como Slow Start e CUBIC/BBR reduzem a taxa de envio quando detectam gargalos nos roteadores da internet.',
      },
    ],
    strengths: [
      'Entrega 100% garantida e ordenada dos dados',
      'Detecta e corrige perdas automaticamente sem esforço da aplicação',
      'Adapta a velocidade à capacidade real da rede e do receptor',
    ],
    tradeoffs: [
      'Maior latência inicial devido ao Three-Way Handshake (1 RTT antes dos dados)',
      'Cabeçalho maior (mínimo 20 bytes) e consumo de memória por sessão ativa',
      'Head-of-Line Blocking: um único pacote perdido trava a entrega dos seguintes até ser reenviado',
    ],
  },
  udp: {
    id: 'udp',
    acronym: 'UDP',
    fullName: 'User Datagram Protocol (Protocolo de Datagramas de Usuário)',
    rfc: 'RFC 768',
    tagline: 'Sem conexão, cabeçalho mínimo de 8 bytes e latência ultrabaixa',
    analogy:
      'Cartão-postal ou transmissão de rádio ao vivo: você envia imediatamente sem esperar recibo — se uma sílaba falhar, a conversa segue em frente.',
    headerSize: '8 bytes fixos (sempre)',
    pythonSocket: 'socket.SOCK_DGRAM',
    summary:
      'O UDP oferece uma interface mínima sobre o IP: adiciona apenas portas de origem/destino, comprimento e verificação básica de integridade. Ele não abre conexão, não guarda estado e entrega cada datagrama de forma independente.',
    howItWorks: [
      {
        step: '01',
        label: 'Encapsulamento Imediato (0 Handshake)',
        direction: 'client-to-server',
        detail:
          'A aplicação entrega a mensagem ao sistema operacional, que adiciona apenas 8 bytes de cabeçalho UDP e despacha o datagrama na hora.',
      },
      {
        step: '02',
        label: 'Envio "Fire-and-Forget" (Dispare e Esqueça)',
        direction: 'client-to-server',
        detail:
          'O remetente não espera confirmação (ACK) nem mantém buffer para retransmissão. O próximo datagrama já sai imediatamente.',
      },
      {
        step: '03',
        label: 'Recepção Independente',
        direction: 'server-to-client',
        detail:
          'Se o datagrama chegar intacto (checksum válido), é entregue à porta da aplicação; se se perder ou chegar fora de ordem, o UDP não interfere.',
      },
      {
        step: '04',
        label: 'Inteligência na Aplicação (Opcional)',
        direction: 'both',
        detail:
          'Protocolos modernos como QUIC (HTTP/3) usam UDP como base ultrarrápida e implementam sua própria confiabilidade sem o bloqueio do TCP.',
      },
    ],
    headerFields: [
      {
        field: 'Porta de Origem',
        size: '2 bytes (16 bits)',
        purpose: 'Identifica a porta de retorno do cliente (opcional em envios unidirecionais).',
      },
      {
        field: 'Porta de Destino',
        size: '2 bytes (16 bits)',
        purpose: 'Direciona o datagrama ao processo servidor correto (ex.: 53 para DNS, 67 para DHCP).',
      },
      {
        field: 'Comprimento (Length)',
        size: '2 bytes (16 bits)',
        purpose: 'Tamanho total em bytes do cabeçalho UDP (8 B) somado aos dados transportados.',
      },
      {
        field: 'Checksum',
        size: '2 bytes (16 bits)',
        purpose: 'Valida integridade básica; se o pacote estiver corrompido, é descartado silenciosamente.',
      },
    ],
    keyFeatures: [
      {
        title: 'Cabeçalho Fixo de 8 Bytes',
        description:
          'Reduz drasticamente o overhead por pacote (60% menor que o cabeçalho mínimo de 20 bytes do TCP).',
      },
      {
        title: 'Zero Atraso de Conexão',
        description:
          'Elimina o handshake de 3 etapas, permitindo consultas instantâneas como resolução DNS em um único par pergunta/resposta.',
      },
      {
        title: 'Suporte a Broadcast e Multicast',
        description:
          'Permite enviar o mesmo datagrama para vários dispositivos ao mesmo tempo (essencial para DHCP, descoberta LAN e IPTV).',
      },
    ],
    strengths: [
      'Latência mínima e taxa constante para áudio, vídeo e jogos competitivos',
      'Baixíssimo custo de CPU e memória no servidor (stateless)',
      'Suporta envio um-para-muitos (broadcast e multicast)',
    ],
    tradeoffs: [
      'Não garante entrega: pacotes podem sumir sem aviso',
      'Datagramas podem chegar fora de ordem ou duplicados',
      'Não possui controle de congestionamento nativo — a aplicação precisa se autorregular',
    ],
  },
  comparisonRows: [
    {
      criterion: 'Tipo de Conexão',
      tcp: 'Orientado à conexão (Three-Way Handshake)',
      udp: 'Sem conexão (Connectionless)',
      practicalImpact: 'TCP exige negociação antes de transmitir; UDP envia dados no primeiro pacote.',
    },
    {
      criterion: 'Confiabilidade',
      tcp: 'Alta — usa ACK, timeout e retransmissão',
      udp: 'Melhor esforço (Best-effort) — sem ACK',
      practicalImpact: 'No TCP nenhum byte se perde; no UDP um pacote perdido é descartado.',
    },
    {
      criterion: 'Ordenação dos Dados',
      tcp: 'Garantida via números de sequência (SEQ)',
      udp: 'Não garantida',
      practicalImpact: 'Arquivos e páginas HTML montam intactos no TCP; áudio ao vivo prefere descartar atrasos.',
    },
    {
      criterion: 'Tamanho do Cabeçalho',
      tcp: '20 bytes (mínimo) a 60 bytes',
      udp: '8 bytes fixos',
      practicalImpact: 'Em 100 pacotes, TCP gasta no mínimo 2.000 B de cabeçalho contra 800 B do UDP.',
    },
    {
      criterion: 'Velocidade e Latência',
      tcp: 'Moderada (controle extra e confirmações)',
      udp: 'Muito alta / latência mínima',
      practicalImpact: 'Jogos online e chamadas de voz ficam muito mais responsivos em UDP.',
    },
    {
      criterion: 'Controle de Fluxo e Congestionamento',
      tcp: 'Sim (Janela Deslizante, Slow Start, BBR)',
      udp: 'Não possui nativamente',
      practicalImpact: 'TCP evita travar links lentos automaticamente.',
    },
    {
      criterion: 'Broadcast / Multicast',
      tcp: 'Não suportado (apenas ponto a ponto)',
      udp: 'Suportado nativamente',
      practicalImpact: 'DHCP e descoberta de dispositivos na rede local dependem de UDP.',
    },
    {
      criterion: 'Constante em Python (socket)',
      tcp: 'socket.SOCK_STREAM',
      udp: 'socket.SOCK_DGRAM',
      practicalImpact: 'Define diretamente qual protocolo da Camada 4 o script Python vai abrir.',
    },
  ],
  useCases: [
    {
      id: 'uc-https',
      protocol: 'TCP',
      service: 'HTTP / HTTPS (Web 1.1 e 2)',
      ports: '80 / 443',
      category: 'Navegação Web',
      scenario: 'Carregamento de sites, sistemas bancários, portais acadêmicos e APIs REST.',
      whyItFits:
        'Se um único trecho de HTML, JSON ou certificado TLS chegar corrompido ou fora de ordem, a página ou transação quebra.',
    },
    {
      id: 'uc-ssh',
      protocol: 'TCP',
      service: 'SSH e SFTP',
      ports: '22',
      category: 'Administração & Arquivos',
      scenario: 'Acesso remoto seguro ao terminal Linux e transferência criptografada de arquivos.',
      whyItFits:
        'Cada tecla digitada no terminal e cada byte de um arquivo transferido precisam chegar completos e na ordem exata.',
    },
    {
      id: 'uc-email',
      protocol: 'TCP',
      service: 'SMTP, IMAP e POP3',
      ports: '587 / 993 / 995',
      category: 'E-mail Corporativo',
      scenario: 'Envio e sincronização de mensagens e anexos entre servidores de e-mail.',
      whyItFits:
        'E-mails e anexos PDF não toleram perda silenciosa de trechos — a integridade vale mais que alguns milissegundos.',
    },
    {
      id: 'uc-db',
      protocol: 'TCP',
      service: 'PostgreSQL / MySQL',
      ports: '5432 / 3306',
      category: 'Banco de Dados',
      scenario: 'Consultas SQL, inserções de notas e transações financeiras em servidores de dados.',
      whyItFits:
        'Comandos SQL parciais ou perdidos corromperiam registros críticos; a sessão confiável TCP é obrigatória.',
    },
    {
      id: 'uc-games',
      protocol: 'UDP',
      service: 'Jogos Online (FPS / MOBA)',
      ports: '27015 / Dinâmicas',
      category: 'Tempo Real',
      scenario: 'Atualização de posição de jogadores e disparos dezenas de vezes por segundo.',
      whyItFits:
        'Se um pacote de posição de 200ms atrás se perder, não adianta reenviá-lo: a nova coordenada já substituiu a antiga.',
    },
    {
      id: 'uc-voip',
      protocol: 'UDP',
      service: 'VoIP e Videochamadas (Meet / Discord)',
      ports: '3478 / 5060 / RTP',
      category: 'Áudio e Vídeo',
      scenario: 'Aulas ao vivo, chamadas de voz e videoconferências interativas.',
      whyItFits:
        'Uma pequena falha de 1 quadro é quase imperceptível, mas travar a chamada esperando retransmissão TCP cria atraso insuportável.',
    },
    {
      id: 'uc-dns',
      protocol: 'UDP',
      service: 'DNS (Resolução de Nomes)',
      ports: '53',
      category: 'Infraestrutura',
      scenario: 'Traduzir "if.edu.br" para um endereço IP antes de abrir o site.',
      whyItFits:
        'A consulta cabe em um único pacote pequeno. Sem handshake TCP, a resposta chega em 1 viagem de ida e volta (TCP só entra em respostas grandes ou transferência de zona).',
    },
    {
      id: 'uc-dhcp',
      protocol: 'UDP',
      service: 'DHCP',
      ports: '67 / 68',
      category: 'Rede Local',
      scenario: 'Entregar IP, máscara, gateway e DNS automaticamente quando um celular entra no Wi-Fi.',
      whyItFits:
        'O aparelho ainda nem possui endereço IP e precisa enviar um broadcast para toda a LAN — algo impossível no TCP.',
    },
    {
      id: 'uc-quic',
      protocol: 'UDP',
      service: 'QUIC / HTTP3',
      ports: '443 (UDP)',
      category: 'Web Moderna',
      scenario: 'YouTube, Google e navegação móvel alternando entre Wi-Fi e 4G/5G.',
      whyItFits:
        'Usa UDP para eliminar o handshake lento e o bloqueio de fila do TCP, trazendo criptografia TLS 1.3 e recuperação inteligente na própria camada de aplicação.',
    },
  ],
  goldenRules: [
    {
      title: 'Quando escolher TCP?',
      protocol: 'TCP',
      question: 'Um byte perdido corrompe o resultado final?',
      answer:
        'Sim → Use TCP (downloads, bancos, HTTPS clássico, SSH, e-mail, SQL). A precisão é mais importante do que alguns milissegundos.',
    },
    {
      title: 'Quando escolher UDP?',
      protocol: 'UDP',
      question: 'A informação antiga perde o valor se chegar atrasada?',
      answer:
        'Sim → Use UDP (jogos online, videochamadas, lives, DNS rápido, DHCP). Velocidade e fluidez vencem a retransmissão.',
    },
  ],
  relatedMissionIds: ['M14', 'M32', 'M33', 'M34'],
};

export const PROTOCOLOS_STUDY_LESSON: StudyLesson = {
  id: 'L10',
  order: 10,
  circuit: 2,
  title: 'Protocolos de Transporte: TCP vs. UDP',
  subtitle: 'Prepara para Missões M14, M32, M33 e M34',
  readTimeMinutes: 6,
  relatedMissionIds: ['M14', 'M32', 'M33', 'M34'],
  intro: [
    'Na Camada 4 (Transporte), TCP e UDP decidem como os dados viajam entre aplicações identificadas por portas (0–65535).',
    'O TCP (SOCK_STREAM) abre conexão com Three-Way Handshake (SYN → SYN-ACK → ACK), usa cabeçalho mínimo de 20 bytes e garante entrega ordenada com retransmissão automática.',
    'O UDP (SOCK_DGRAM) envia datagramas sem conexão com cabeçalho fixo de 8 bytes, entregando latência mínima para jogos online, videochamadas, DNS, DHCP e HTTP/3 (QUIC).',
  ],
  commandTable: [
    {
      command: 'SYN → SYN-ACK → ACK',
      meaning: 'Three-Way Handshake que estabelece uma conexão confiável TCP',
      example: 'Cliente pede (SYN), servidor aceita (SYN-ACK), cliente confirma (ACK)',
    },
    {
      command: 'TCP: 20 bytes | UDP: 8 bytes',
      meaning: 'Tamanho mínimo do cabeçalho de controle na Camada 4',
      example: '100 pacotes: TCP = 2000B de overhead vs. UDP = 800B',
    },
    {
      command: 'socket.SOCK_STREAM',
      meaning: 'Constante Python para criar sockets orientados à conexão (TCP)',
      example: 'socket.socket(socket.AF_INET, socket.SOCK_STREAM)',
    },
    {
      command: 'socket.SOCK_DGRAM',
      meaning: 'Constante Python para criar sockets de datagrama sem conexão (UDP)',
      example: 'socket.socket(socket.AF_INET, socket.SOCK_DGRAM)',
    },
    {
      command: 'Portas IANA (0–1023 / 1024–49151)',
      meaning: 'Identificam serviços: Bem Conhecidas (22, 53, 80, 443) e Registradas (3306, 5432)',
      example: 'SSH=22/TCP, DNS=53/UDP, HTTPS=443/TCP, PostgreSQL=5432/TCP',
    },
  ],
  sandboxExamples: [
    {
      label: 'Comparar overhead TCP × UDP',
      code: `pacotes = 250
overhead_tcp = pacotes * 20
overhead_udp = pacotes * 8
economia = overhead_tcp - overhead_udp

print(f"TCP ({pacotes} pacotes): {overhead_tcp} bytes de cabecalho")
print(f"UDP ({pacotes} pacotes): {overhead_udp} bytes de cabecalho")
print(f"Economia usando UDP: {economia} bytes ({economia / overhead_tcp * 100:.0f}%)")`,
    },
    {
      label: 'Simular Three-Way Handshake',
      code: `fluxo = ["SYN", "SYN-ACK", "ACK", "DATA#1", "ACK#1", "FIN"]
handshake_valido = fluxo[:3] == ["SYN", "SYN-ACK", "ACK"]

print("Sequencia inicial:", " -> ".join(fluxo[:3]))
print("Conexao TCP estabelecida?", handshake_valido)`,
    },
    {
      label: 'Classificar aplicações',
      code: `aplicacoes = [
    ("Portal HTTPS", 443, False),
    ("Consulta DNS", 53, True),
    ("Videochamada Meet", 3478, True),
    ("Acesso SSH", 22, False),
]

for nome, porta, tempo_real in aplicacoes:
    proto = "UDP" if tempo_real else "TCP"
    sock = "SOCK_DGRAM" if proto == "UDP" else "SOCK_STREAM"
    print(f"{nome:18} | Porta {porta:<4} | {proto} ({sock})")`,
    },
  ],
  drills: [
    {
      id: 'L10-D1',
      step: 1,
      title: 'Repetição 1 · Escolher TCP ou UDP pelo caso de uso',
      prompt:
        'Complete a condição para atribuir "UDP" quando baixa_latencia for True e "TCP" quando for False.',
      starterCode: `cenario = "Jogo FPS Online"
baixa_latencia = True
# Use "UDP" se baixa_latencia for True, senao "TCP"
protocolo = "" if baixa_latencia else ""
print(f"{cenario}: {protocolo}")`,
      hint: 'Escreva: protocolo = "UDP" if baixa_latencia else "TCP"',
      validate: (stdout) =>
        stdout.trim() === 'Jogo FPS Online: UDP'
          ? {
              passed: true,
              feedback:
                'Excelente! Aplicações em tempo real como jogos FPS priorizam baixa latência com UDP.',
            }
          : {
              passed: false,
              feedback: 'A saída esperada é "Jogo FPS Online: UDP".',
            },
    },
    {
      id: 'L10-D2',
      step: 2,
      title: 'Repetição 2 · Validar o Three-Way Handshake TCP',
      prompt:
        'Complete a lista esperada do handshake TCP (["SYN", "SYN-ACK", "ACK"]) para imprimir "CONEXAO_OK".',
      starterCode: `pacotes = ["SYN", "SYN-ACK", "ACK", "HTTP_GET"]
if pacotes[:3] == ["SYN", "", "ACK"]:
    print("CONEXAO_OK")
else:
    print("HANDSHAKE_INCOMPLETO")`,
      hint: 'A segunda etapa enviada pelo servidor é "SYN-ACK".',
      validate: (stdout) =>
        stdout.trim() === 'CONEXAO_OK'
          ? {
              passed: true,
              feedback:
                'Perfeito! SYN → SYN-ACK → ACK confirma que cliente e servidor estão sincronizados.',
            }
          : {
              passed: false,
              feedback: 'Preencha a segunda etapa com "SYN-ACK" para imprimir "CONEXAO_OK".',
            },
    },
    {
      id: 'L10-D3',
      step: 3,
      title: 'Repetição 3 · Calcular cabeçalho TCP (20B) vs. UDP (8B)',
      prompt:
        'Calcule os bytes de cabeçalho para 50 pacotes TCP (20B cada) e 50 pacotes UDP (8B cada).',
      starterCode: `qtd = 50
tcp_bytes = qtd * 
udp_bytes = qtd * 
print(f"TCP={tcp_bytes}B | UDP={udp_bytes}B")`,
      hint: 'Multiplique qtd por 20 para TCP e por 8 para UDP.',
      validate: (stdout) =>
        stdout.trim() === 'TCP=1000B | UDP=400B'
          ? {
              passed: true,
              feedback:
                'Dominado! Agora você está pronto para enfrentar as missões de redes M32, M33 e M34.',
            }
          : {
              passed: false,
              feedback: 'A saída esperada é "TCP=1000B | UDP=400B".',
            },
    },
  ],
};
