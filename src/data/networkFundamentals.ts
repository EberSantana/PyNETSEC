export interface NetworkTypeItem {
  id: 'pan' | 'lan' | 'wlan' | 'can' | 'man' | 'wan' | 'san' | 'vpn';
  acronym: string;
  fullName: string;
  ptName: string;
  rangeLabel: string;
  rangeMetersRank: number; // 1 (smallest) to 8 (widest/virtual)
  speedLabel: string;
  bullets: string[];
  examples: string;
  diagramCaption: string;
  accent: 'cyan' | 'emerald' | 'amber' | 'sky' | 'indigo' | 'rose';
}

export const NETWORK_TYPES: NetworkTypeItem[] = [
  {
    id: 'pan',
    acronym: 'PAN',
    fullName: 'Personal Area Network',
    ptName: 'Rede Pessoal',
    rangeLabel: 'Até 10 metros',
    rangeMetersRank: 1,
    speedLabel: 'Baixa / Média (Bluetooth)',
    bullets: [
      'Alcance curto de até 10 metros ao redor de uma única pessoa.',
      'Conecta dispositivos de uso individual sem precisar de infraestrutura complexa.',
    ],
    examples: 'Fone de ouvido Bluetooth, relógio inteligente (smartwatch), teclado sem fio e smartphone',
    diagramCaption: 'Dispositivos pessoais sincronizados em curto alcance via Bluetooth/USB.',
    accent: 'cyan',
  },
  {
    id: 'lan',
    acronym: 'LAN',
    fullName: 'Local Area Network',
    ptName: 'Rede Local',
    rangeLabel: 'Sala, casa ou escola (até ~1 km)',
    rangeMetersRank: 2,
    speedLabel: 'Alta (100 Mbps – 10 Gbps)',
    bullets: [
      'Abrange um espaço físico limitado, como uma residência, um escritório ou uma escola.',
      'Usa cabos Ethernet ou Wi-Fi com alta velocidade e baixa latência.',
    ],
    examples: 'Laboratório de informática do IF, rede doméstica, escritório corporativo',
    diagramCaption: 'Computadores e servidores conectados a um switch local com altíssima velocidade.',
    accent: 'emerald',
  },
  {
    id: 'wlan',
    acronym: 'WLAN',
    fullName: 'Wireless Local Area Network',
    ptName: 'Rede Local Sem Fio',
    rangeLabel: 'Ambiente local sem cabos (~30–100 m)',
    rangeMetersRank: 3,
    speedLabel: 'Alta (Wi-Fi 5 / 6 / 7)',
    bullets: [
      'É a versão sem fio de uma rede local (LAN), baseada no padrão IEEE 802.11 (Wi-Fi).',
      'Permite mobilidade de notebooks, tablets e celulares conectados a um Access Point.',
    ],
    examples: 'Wi-Fi da escola (eduroam), Wi-Fi residencial, pontos de acesso em cafés',
    diagramCaption: 'Access Point irradia ondas Wi-Fi conectando notebooks e celulares sem cabos.',
    accent: 'sky',
  },
  {
    id: 'can',
    acronym: 'CAN',
    fullName: 'Campus Area Network',
    ptName: 'Rede de Campus',
    rangeLabel: 'Prédios próximos (~1–5 km)',
    rangeMetersRank: 4,
    speedLabel: 'Alta (Backbone Fibra)',
    bullets: [
      'Maior que uma LAN e menor que uma MAN, interligando vários prédios próximos.',
      'Administrada por uma única instituição (como um campus universitário ou hospital).',
    ],
    examples: 'Prédios de um Instituto Federal, campus universitário, complexo hospitalar',
    diagramCaption: 'Múltiplas LANs de prédios vizinhos unidas por backbone de fibra óptica.',
    accent: 'amber',
  },
  {
    id: 'man',
    acronym: 'MAN',
    fullName: 'Metropolitan Area Network',
    ptName: 'Rede Metropolitana',
    rangeLabel: 'Cidade / região (10–50 km)',
    rangeMetersRank: 5,
    speedLabel: 'Muito Alta (Fibra Metropolitana)',
    bullets: [
      'Cobre uma cidade ou região metropolitana inteira (dezenas de quilômetros).',
      'Interliga filiais de uma empresa, provedores regionais ou órgãos públicos.',
    ],
    examples: 'Anel de fibra óptica ligando secretarias municipais ou filiais bancárias na cidade',
    diagramCaption: 'Anel metropolitano de alta capacidade conectando unidades em bairros distintos.',
    accent: 'indigo',
  },
  {
    id: 'wan',
    acronym: 'WAN',
    fullName: 'Wide Area Network',
    ptName: 'Rede de Longa Distância',
    rangeLabel: 'Países e continentes (Global)',
    rangeMetersRank: 6,
    speedLabel: 'Variável (Cabos submarinos / Satélite)',
    bullets: [
      'Abrange grandes áreas geográficas, conectando estados, países e continentes.',
      'A Internet é o maior exemplo de uma rede WAN no mundo.',
    ],
    examples: 'Internet global, enlaces internacionais entre datacenters e matrizes multinacionais',
    diagramCaption: 'Roteadores de borda interligando redes locais distantes pelo globo inteiro.',
    accent: 'cyan',
  },
  {
    id: 'san',
    acronym: 'SAN',
    fullName: 'Storage Area Network',
    ptName: 'Rede de Armazenamento',
    rangeLabel: 'Data Center (dedicada)',
    rangeMetersRank: 7,
    speedLabel: 'Ultra Alta (Fibre Channel / iSCSI)',
    bullets: [
      'Rede especializada de alta performance focada em conectar servidores a grandes volumes de dados.',
      'Muito usada em data centers para bancos de dados, virtualização e backups críticos.',
    ],
    examples: 'Data centers em nuvem, servidores conectados a arrays de discos NVMe/SSD',
    diagramCaption: 'Servidores acessam pools de armazenamento em blocos por switches dedicados.',
    accent: 'emerald',
  },
  {
    id: 'vpn',
    acronym: 'VPN',
    fullName: 'Virtual Private Network',
    ptName: 'Rede Privada Virtual',
    rangeLabel: 'Lógica / Global (sobre Internet)',
    rangeMetersRank: 8,
    speedLabel: 'Depende do enlace + criptografia',
    bullets: [
      'Cria um túnel criptografado sobre uma rede pública (como a Internet).',
      'Garante confidencialidade e segurança no acesso remoto aos sistemas internos de uma empresa.',
    ],
    examples: 'Trabalho remoto seguro (WireGuard, OpenVPN, IPsec), interligação segura entre filiais',
    diagramCaption: 'Túnel cifrado protege os pacotes contra espionagem ao atravessar redes públicas.',
    accent: 'rose',
  },
];

export interface TopologyItem {
  id: 'star' | 'ring' | 'bus' | 'tree' | 'mesh' | 'hybrid';
  name: string;
  subtitle: string;
  description: string;
  pros: string[];
  cons: string[];
  realWorldUse: string;
  faultTip: string;
}

export const NETWORK_TOPOLOGIES: TopologyItem[] = [
  {
    id: 'star',
    name: 'Topologia em Estrela',
    subtitle: 'Todos conectados a um nó central (Switch)',
    description:
      'Todos os dispositivos estão conectados a um ponto central, geralmente um switch. Facilita a identificação e correção de problemas porque a falha de um dispositivo não afeta os outros — porém a falha do ponto central derruba toda a rede.',
    pros: [
      'Fácil de instalar, monitorar e isolar falhas em cabos individuais',
      'Se um computador ou cabo falhar, os demais continuam operando normalmente',
    ],
    cons: [
      'Ponto único de falha: se o switch central parar, toda a rede fica inativa',
      'Consome mais cabo do que o barramento simples',
    ],
    realWorldUse: 'Padrão absoluto nas LANs modernas (escolas, escritórios e casas com roteador/switch).',
    faultTip: 'Clique em um PC (só ele cai) ou no Switch central (toda a rede cai!).',
  },
  {
    id: 'ring',
    name: 'Topologia em Anel',
    subtitle: 'Circuito fechado de dispositivo em dispositivo',
    description:
      'Cada dispositivo é conectado ao próximo, formando um circuito fechado. Permite comunicação ordenada e eficiente sem colisões aleatórias, mas a falha em um único dispositivo ou enlace pode interromper toda a rede.',
    pros: [
      'Tráfego ordenado em fluxo contínuo sem colisões de broadcast',
      'Desempenho previsível mesmo sob carga moderada',
    ],
    cons: [
      'Se um nó ou cabo falhar (em anel simples), todo o circuito é interrompido',
      'Adicionar ou remover máquinas exige abrir o anel',
    ],
    realWorldUse: 'Anéis metropolitanos de fibra óptica (com duplo anel redundante) e redes legadas Token Ring.',
    faultTip: 'Clique em qualquer estação para ver o rompimento do circuito inteiro.',
  },
  {
    id: 'bus',
    name: 'Topologia em Barramento',
    subtitle: 'Um único cabo compartilhado (Backbone)',
    description:
      'Todos os dispositivos compartilham um único canal de comunicação, o barramento (geralmente cabo coaxial com terminadores nas pontas). É simples e barata, mas sofre congestionamentos e a falha do barramento interrompe toda a comunicação.',
    pros: [
      'Configuração simples e econômica em quantidade de cabos',
      'Fácil de entender em redes pequenas e temporárias',
    ],
    cons: [
      'Congestionamento e colisões conforme mais dispositivos transmitem',
      'Rompimento no cabo principal derruba toda a rede e é difícil de localizar',
    ],
    realWorldUse: 'Redes Ethernet antigas (10BASE2 coaxial) e barramentos industriais/automotivos (CAN bus).',
    faultTip: 'Clique no barramento central para simular o corte do cabo principal.',
  },
  {
    id: 'tree',
    name: 'Topologia em Árvore (Hierárquica)',
    subtitle: 'Estrelas agrupadas sob um switch principal',
    description:
      'Combina elementos das topologias em estrela e barramento, criando uma hierarquia. Os dispositivos ficam agrupados em sub-redes (ramos) conectadas a um switch principal, oferecendo alta escalabilidade.',
    pros: [
      'Excelente escalabilidade: basta adicionar novos switches de ramo para expandir',
      'Organização natural por departamentos, andares ou laboratórios',
    ],
    cons: [
      'Se o switch raiz (tronco) falhar, as sub-redes perdem comunicação entre si',
      'Exige planejamento de largura de banda nos enlaces superiores',
    ],
    realWorldUse: 'Escolas, campus universitários (CAN) e prédios corporativos com múltiplos andares.',
    faultTip: 'Teste falhar um Switch de Departamento vs o Switch Principal (Raiz).',
  },
  {
    id: 'mesh',
    name: 'Topologia Mesh (Malha)',
    subtitle: 'Todos conectados a todos (alta redundância)',
    description:
      'Cada dispositivo está conectado diretamente aos outros, oferecendo altíssima redundância e tolerância a falhas. Requer muitos cabos e gestão mais complexa, sendo muito utilizada em ambientes críticos e redes Wi-Fi Mesh.',
    pros: [
      'Máxima tolerância a falhas: se uma rota cai, o tráfego desvia por outra',
      'Alta privacidade e zero gargalo em um único ponto central',
    ],
    cons: [
      'Alto custo e complexidade de cabeamento: n(n-1)/2 enlaces em malha total',
      'Configuração e manutenção mais exigentes',
    ],
    realWorldUse: 'Redes críticas industriais, backbones da Internet, roteamento militar e Wi-Fi Mesh.',
    faultTip: 'Clique em um nó para derrubá-lo e veja os dados desviando pela rota alternativa!',
  },
  {
    id: 'hybrid',
    name: 'Topologia Híbrida',
    subtitle: 'Combinação de dois ou mais modelos',
    description:
      'Combina elementos de diferentes topologias para atender requisitos específicos de cada setor — por exemplo, uma topologia em estrela em um departamento e uma topologia em anel em outro, interligadas por um roteador.',
    pros: [
      'Flexível: adapta o melhor modelo para cada área da instituição',
      'Facilita a integração de redes antigas com novas expansões',
    ],
    cons: [
      'Projeto, documentação e custo de equipamentos mais complexos',
      'Exige administradores familiarizados com múltiplas arquiteturas',
    ],
    realWorldUse: 'Grandes empresas, hospitais e universidades que unem diferentes infraestruturas.',
    faultTip: 'Clique no departamento em Estrela ou no Anel para comparar o impacto da falha.',
  },
];

export interface TransmissionMediumItem {
  id: 'twisted-pair' | 'fiber' | 'coaxial' | 'radio' | 'microwave' | 'infrared';
  category: 'guided' | 'unguided';
  name: string;
  signalType: string;
  connectorOrBand: string;
  typicalRange: string;
  emiImmunity: 'Alta (Imune)' | 'Média (Blindado)' | 'Sensível';
  passesObstacles: boolean;
  description: string;
  examples: string;
  obstacleBehavior: string;
}

export const TRANSMISSION_MEDIA: TransmissionMediumItem[] = [
  {
    id: 'twisted-pair',
    category: 'guided',
    name: 'Par Trançado (UTP / STP)',
    signalType: 'Pulsos elétricos em pares de cobre entrelaçados',
    connectorOrBand: 'Conector RJ-45 (Cat5e / Cat6 / Cat6A)',
    typicalRange: 'Até 100 metros (LAN)',
    emiImmunity: 'Média (Blindado)',
    passesObstacles: true,
    description:
      'Fios de cobre entrelaçados para cancelar interferências eletromagnéticas (UTP sem blindagem e STP com blindagem). Usa conector RJ-45, tem alcance típico de até 100 m e é o padrão mais comum em escritórios e residências.',
    examples: 'Cabos de rede Ethernet ligando PCs a switches e roteadores',
    obstacleBehavior:
      'No cabo UTP comum, fontes fortes de ruído elétrico (motores/alta tensão) podem causar atenuação; a versão STP com malha metálica reduz esse efeito.',
  },
  {
    id: 'fiber',
    category: 'guided',
    name: 'Fibra Óptica',
    signalType: 'Pulsos de luz (LED ou Laser) em vidro/plástico',
    connectorOrBand: 'Conectores LC / SC (Monomodo e Multimodo)',
    typicalRange: 'De centenas de metros até dezenas de km',
    emiImmunity: 'Alta (Imune)',
    passesObstacles: true,
    description:
      'Transmite dados por pulsos de luz em filamentos de vidro ou plástico (modos monomodo e multimodo). Oferece altíssima velocidade e alcance, exige menos repetidores e é totalmente imune a interferências eletromagnéticas.',
    examples: 'Internet banda larga FTTH, backbones de campus (CAN), cabos submarinos (WAN)',
    obstacleBehavior:
      'Como trafega luz em vez de eletricidade, o sinal permanece 100% íntegro mesmo sob forte interferência eletromagnética!',
  },
  {
    id: 'coaxial',
    category: 'guided',
    name: 'Cabo Coaxial',
    signalType: 'Sinal elétrico em condutor central blindado',
    connectorOrBand: 'Conectores BNC / F',
    typicalRange: '185 m a 500 m (redes legadas / TV)',
    emiImmunity: 'Média (Blindado)',
    passesObstacles: true,
    description:
      'Condutor central de cobre envolto por isolamento e malha de blindagem, geralmente com conectores BNC. Apresenta maior atenuação que o par trançado em redes modernas e é mais usado em aplicações específicas, como TV a cabo.',
    examples: 'TV a cabo, internet via cabo (DOCSIS), circuitos fechados de câmeras (CFTV)',
    obstacleBehavior:
      'A malha metálica protege razoavelmente contra ruído externo, mas o cabo é rígido e tem maior perda de sinal em altas frequências.',
  },
  {
    id: 'radio',
    category: 'unguided',
    name: 'Ondas de Rádio',
    signalType: 'Ondas eletromagnéticas omnidirecionais (RF)',
    connectorOrBand: '2,4 GHz / 5 GHz / 6 GHz / Celular',
    typicalRange: '10 m (Bluetooth) a vários km (4G/5G)',
    emiImmunity: 'Sensível',
    passesObstacles: true,
    description:
      'Propagam-se pelo ar em múltiplas direções e conseguem atravessar obstáculos como paredes, servindo de base para tecnologias como Wi-Fi, Bluetooth e redes celulares.',
    examples: 'Wi-Fi (WLAN), Bluetooth (PAN), telefonia 4G/5G, rádio FM',
    obstacleBehavior:
      'Atravessa paredes e móveis (com alguma perda de intensidade), permitindo mobilidade dentro de salas e prédios.',
  },
  {
    id: 'microwave',
    category: 'unguided',
    name: 'Micro-ondas',
    signalType: 'Feixes direcionais de alta frequência',
    connectorOrBand: 'Antenas parabólicas / Torres / Satélites',
    typicalRange: 'Dezenas de km (torre a torre) até satélites',
    emiImmunity: 'Sensível',
    passesObstacles: false,
    description:
      'Operam em altas frequências e costumam exigir linha de visada direta (sem obstáculos grandes entre as antenas). Muito usadas em enlaces de longa distância, torres de telecomunicação e comunicação via satélite.',
    examples: 'Enlaces ponto a ponto entre torres de provedores, comunicação via satélite',
    obstacleBehavior:
      'Exige linha de visada direta: prédios, morros ou tempestades intensas degradam ou bloqueiam o feixe!',
  },
  {
    id: 'infrared',
    category: 'unguided',
    name: 'Infravermelho (IR)',
    signalType: 'Feixes luminosos infravermelhos de curto alcance',
    connectorOrBand: 'Emissor LED IR → Sensor receptor',
    typicalRange: 'Curto alcance (alguns metros em sala fechada)',
    emiImmunity: 'Alta (Imune)',
    passesObstacles: false,
    description:
      'Usa feixes luminosos de curto alcance em ambientes fechados, exigindo linha de visada direta e sem atravessar paredes — o que evita interferência entre cômodos vizinhos.',
    examples: 'Controles remotos de TV/ar-condicionado, sensores industriais de curta distância',
    obstacleBehavior:
      'Bloqueado imediatamente por qualquer parede ou objeto opaco colocado no caminho do feixe luminoso.',
  },
];

export interface TransmissionModeItem {
  id: 'simplex' | 'half-duplex' | 'full-duplex';
  name: string;
  directionLabel: string;
  simultaneousLabel: string;
  latencyLabel: string;
  description: string;
  examples: string;
}

export const TRANSMISSION_MODES: TransmissionModeItem[] = [
  {
    id: 'simplex',
    name: 'Simplex',
    directionLabel: 'Unidirecional',
    simultaneousLabel: 'Não se aplica',
    latencyLabel: 'Simples, sem canal de retorno',
    description:
      'O fluxo de dados ocorre em apenas um sentido: um dispositivo apenas transmite e o outro apenas recebe.',
    examples: 'Rádio broadcast, TV aberta, teclado enviando dados para o computador/monitor',
  },
  {
    id: 'half-duplex',
    name: 'Half-Duplex',
    directionLabel: 'Bidirecional',
    simultaneousLabel: 'Não (um por vez)',
    latencyLabel: 'Maior latência pela alternância',
    description:
      'O fluxo ocorre nos dois sentidos, mas nunca ao mesmo tempo. Os dispositivos se revezam para enviar e receber no mesmo canal.',
    examples: 'Walkie-talkie ("câmbio!"), redes Ethernet antigas com hub',
  },
  {
    id: 'full-duplex',
    name: 'Full-Duplex',
    directionLabel: 'Bidirecional',
    simultaneousLabel: 'Sim (ao mesmo tempo)',
    latencyLabel: 'Maior desempenho e menor latência',
    description:
      'O fluxo ocorre nos dois sentidos de forma simultânea. Ambos os lados enviam e recebem dados ao mesmo tempo usando canais ou vias separadas.',
    examples: 'Ligação telefônica, redes Ethernet modernas com switch',
  },
];

export type EverydayProtocolCategoryId = 'web' | 'local' | 'files-mail';

export interface EverydayProtocolItem {
  id: string;
  category: EverydayProtocolCategoryId;
  name: string;
  fullName: string;
  portOrLayer: string;
  description: string;
  whereYouSeeIt: string;
  visualBadge: string;
  screenMockupTitle: string;
  screenMockupLines: string[];
  accent: 'cyan' | 'emerald' | 'amber' | 'rose';
}

export const EVERYDAY_PROTOCOL_CATEGORIES: {
  id: EverydayProtocolCategoryId;
  number: number;
  title: string;
  subtitle: string;
}[] = [
  {
    id: 'web',
    number: 1,
    title: 'Navegação na Web',
    subtitle: 'HTTP/HTTPS · DNS · QUIC / HTTP3',
  },
  {
    id: 'local',
    number: 2,
    title: 'Conexão e Rede Local',
    subtitle: 'DHCP · IP · Wi-Fi (IEEE 802.11)',
  },
  {
    id: 'files-mail',
    number: 3,
    title: 'Transferência de Arquivos e E-mails',
    subtitle: 'SMTP / IMAP / POP3 · FTP / SFTP · SMB',
  },
];

export const EVERYDAY_PROTOCOLS: EverydayProtocolItem[] = [
  {
    id: 'http-https',
    category: 'web',
    name: 'HTTP e HTTPS',
    fullName: 'HyperText Transfer Protocol (Secure)',
    portOrLayer: 'Portas 80 / 443 · Camada 7',
    description:
      'É o mais visível de todos. Aparece logo no início do endereço na barra do navegador (https://...) e no ícone de cadeado, que indica que a conexão está criptografada com TLS.',
    whereYouSeeIt: 'Barra de endereço do navegador (https://...) e ícone de cadeado de segurança.',
    visualBadge: '🔒 https://',
    screenMockupTitle: 'Barra do Navegador (Chrome / Edge)',
    screenMockupLines: [
      '🔒 https://portal.if.edu.br/boletim',
      'Conexão segura · Certificado TLSv1.3 válido (porta 443)',
      '⚠️ Sem cadeado (http://) = dados trafegam em texto puro!',
    ],
    accent: 'emerald',
  },
  {
    id: 'dns',
    category: 'web',
    name: 'DNS',
    fullName: 'Domain Name System',
    portOrLayer: 'Porta 53 (UDP) · Camada 7',
    description:
      'É a "agenda telefônica" da internet. Você vê ele funcionando na prática quando digita google.com.br e o site abre, mas também quando aparece aquele erro clássico no navegador.',
    whereYouSeeIt: 'Ao digitar qualquer domínio ou ver o erro "DNS_PROBE_FINISHED_NXDOMAIN".',
    visualBadge: 'google.com.br → IP',
    screenMockupTitle: 'Resolução DNS & Erro Clássico',
    screenMockupLines: [
      '✓ google.com.br  →  142.250.219.195 (Site encontrado)',
      '✕ site-inexistente.lab  →  Não é possível acessar esse site',
      'Código do navegador: DNS_PROBE_FINISHED_NXDOMAIN',
    ],
    accent: 'cyan',
  },
  {
    id: 'quic-http3',
    category: 'web',
    name: 'QUIC / HTTP3',
    fullName: 'Quick UDP Internet Connections',
    portOrLayer: 'Porta 443 (UDP) · Camadas 4/7',
    description:
      'Usado por serviços como YouTube e Google para carregar vídeos e páginas mais rápido, especialmente no celular quando você troca do Wi-Fi para o 4G/5G sem a conexão cair.',
    whereYouSeeIt: 'Carregamento rápido no YouTube/Google e coluna "h3" na aba Network (F12).',
    visualBadge: 'h3 · Wi-Fi ↔ 5G',
    screenMockupTitle: 'Troca de Rede no Celular (Streaming)',
    screenMockupLines: [
      'Protocolo ativo: h3 (HTTP/3 sobre QUIC/UDP)',
      'Evento: Wi-Fi da casa → 5G na rua (Connection ID mantido)',
      'Resultado: Vídeo no YouTube continua sem travar ou reconectar!',
    ],
    accent: 'cyan',
  },
  {
    id: 'dhcp',
    category: 'local',
    name: 'DHCP',
    fullName: 'Dynamic Host Configuration Protocol',
    portOrLayer: 'Portas 67 / 68 (UDP) · Camada 7',
    description:
      'É o responsável por entregar um endereço IP automático quando você conecta seu celular no Wi-Fi de casa ou de um café. Se o roteador travar, você vê a mensagem "Obtendo endereço IP..." travada na tela.',
    whereYouSeeIt: 'Ao conectar no Wi-Fi (entrega automática ou tela travada em "Obtendo endereço IP...").',
    visualBadge: 'Obtendo IP...',
    screenMockupTitle: 'Configurações de Wi-Fi (Smartphone)',
    screenMockupLines: [
      'Rede: WiFi_Escola_5G · Status: Conectado via DHCP',
      'Passo 1: Celular pede IP (DHCP Discover) → Roteador oferece (Offer)',
      '⚠️ Roteador travado? Tela congela em: "Obtendo endereço IP..."',
    ],
    accent: 'amber',
  },
  {
    id: 'ip',
    category: 'local',
    name: 'IP',
    fullName: 'Internet Protocol (IPv4 / IPv6)',
    portOrLayer: 'Camada 3 (Rede)',
    description:
      'Fica visível nas configurações de Wi-Fi do seu aparelho (algo como 192.168.0.15 na rede local) ou quando você pesquisa "meu IP" no Google para ver seu endereço público na internet.',
    whereYouSeeIt: 'Detalhes do Wi-Fi (IP privado local) e busca "meu IP" no Google (IP público).',
    visualBadge: '192.168.0.15',
    screenMockupTitle: 'Endereço Local vs Público',
    screenMockupLines: [
      'IP Local (Wi-Fi): 192.168.0.15  (Máscara: 255.255.255.0)',
      'Gateway padrão:   192.168.0.1   (Seu roteador)',
      'IP Público (Google "meu IP"): 177.84.210.42 (Provedor ISP)',
    ],
    accent: 'cyan',
  },
  {
    id: 'wifi-80211',
    category: 'local',
    name: 'Wi-Fi (IEEE 802.11)',
    fullName: 'Padrão de Rede Local Sem Fio',
    portOrLayer: 'Camadas 1 e 2 (Física / Enlace)',
    description:
      'Embora seja um padrão de camada física e enlace, você vê as versões dele na prática ao escolher entre redes 2.4 GHz (maior alcance) e 5 GHz (maior velocidade) ou Wi-Fi 6 no celular.',
    whereYouSeeIt: 'Lista de redes sem fio (2.4 GHz vs 5 GHz) e ícone de Wi-Fi 6 no aparelho.',
    visualBadge: '2.4 GHz · 5 GHz',
    screenMockupTitle: 'Seletor de Redes Wi-Fi',
    screenMockupLines: [
      '📶 Lab_IF_2.4GHz  — Atravessa mais paredes, velocidade moderada',
      '📶 Lab_IF_5GHz    — Mais rápida, menos interferência, menor alcance',
      '📶 Wi-Fi 6 (802.11ax) — Alta eficiência com muitos alunos conectados',
    ],
    accent: 'emerald',
  },
  {
    id: 'email-protocols',
    category: 'files-mail',
    name: 'SMTP, IMAP e POP3',
    fullName: 'Protocolos de Envio e Recebimento de E-mail',
    portOrLayer: 'Portas 587 / 993 / 995 · Camada 7',
    description:
      'Aparecem sempre que você configura uma conta de e-mail manualmente em aplicativos como Outlook, Thunderbird ou no app nativo do celular (servidor de entrada IMAP/POP3 para receber e SMTP para enviar).',
    whereYouSeeIt: 'Tela de configuração manual de contas no Outlook, Thunderbird ou celular.',
    visualBadge: 'IMAP / SMTP',
    screenMockupTitle: 'Configuração Manual de E-mail',
    screenMockupLines: [
      'Receber (IMAP): imap.gmail.com · Porta 993 (SSL/TLS — sincroniza pastas)',
      'Receber (POP3): pop.gmail.com  · Porta 995 (baixa mensagens no aparelho)',
      'Enviar  (SMTP): smtp.gmail.com · Porta 587 (STARTTLS — envio autenticado)',
    ],
    accent: 'cyan',
  },
  {
    id: 'ftp-sftp',
    category: 'files-mail',
    name: 'FTP e SFTP',
    fullName: 'File Transfer Protocol / SSH File Transfer',
    portOrLayer: 'Portas 21 (FTP) / 22 (SFTP) · Camada 7',
    description:
      'Muito usados por quem gerencia sites ou servidores. Às vezes aparecem em links antigos de download no navegador (ftp://...) ou em clientes de transferência como o FileZilla.',
    whereYouSeeIt: 'Programas como FileZilla / WinSCP ou endereços ftp:// e sftp://.',
    visualBadge: 'sftp:// :22',
    screenMockupTitle: 'Cliente FileZilla (Upload de Site)',
    screenMockupLines: [
      '⚠️ ftp://servidor.lab:21   — Senha e arquivos em texto puro (evite!)',
      '🔒 sftp://servidor.lab:22  — Criptografado sobre SSH (padrão seguro)',
      'Ação: Enviando index.html → /var/www/html/ (24 KB)',
    ],
    accent: 'rose',
  },
  {
    id: 'smb',
    category: 'files-mail',
    name: 'SMB',
    fullName: 'Server Message Block',
    portOrLayer: 'Porta 445 (TCP) · Camadas 5/7',
    description:
      'É o protocolo que faz a mágica de compartilhar pastas e impressoras entre computadores Windows (e Linux via Samba) na mesma rede local.',
    whereYouSeeIt: 'Explorador de Arquivos do Windows usando caminhos \\\\NomeDoComputador\\Pasta.',
    visualBadge: '\\\\PC\\Pasta',
    screenMockupTitle: 'Explorador de Arquivos (Rede Local)',
    screenMockupLines: [
      'Caminho: \\\\ServidorIF\\Materiais_Redes',
      'Protocolo: SMBv3 (TCP porta 445 · Criptografia de transporte)',
      'Recursos: Pastas compartilhadas e Impressora_Lab02 na mesma LAN',
    ],
    accent: 'amber',
  },
];

