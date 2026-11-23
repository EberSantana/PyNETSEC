import { DefenseBadgeId } from '../types/ctf';

export interface OfficeSecurityFlaw {
  id: number;
  title: string;
  shortLabel: string;
  category: 'Física' | 'Confidencialidade' | 'Disponibilidade' | 'Integridade';
  xPercent: number;
  yPercent: number;
  description: string;
  remediation: string;
}

export interface DikwStage {
  id: 'dados' | 'informacao' | 'conhecimento';
  title: string;
  metaphor: string;
  definition: string;
  example: string;
}

export interface SecurityMyth {
  id: string;
  statement: string;
  reality: string;
  riskTag: string;
}

export interface TriadPillar {
  id: 'confidencialidade' | 'integridade' | 'disponibilidade';
  title: string;
  shortCode: string;
  definition: string;
  violation: string;
  threatExample: string;
  controls: string[];
  accent: 'cyan' | 'emerald' | 'amber';
}

export interface ExtraAttribute {
  name: string;
  definition: string;
  mechanism: string;
}

export interface OrgPriorityProfile {
  id: string;
  organization: string;
  topPriority: string;
  ranking: { pillar: string; level: 'Crítico' | 'Alto' | 'Essencial'; reason: string }[];
}

export interface AttackFlowDiagram {
  id: 'normal' | 'interrupcao' | 'interceptacao' | 'modificacao' | 'fabricacao';
  title: string;
  violatedAttribute: string;
  attackClass: 'Normal' | 'Passivo' | 'Ativo';
  shireyGroup: string;
  description: string;
  realExample: string;
  prevention: string;
}

export interface AttackerProfile {
  id: string;
  name: string;
  intent: string;
  skillLevel: string;
  traits: string[];
  accent: 'cyan' | 'rose' | 'amber';
}

export interface AttackAnatomyStep {
  step: number;
  name: string;
  englishName: string;
  summary: string;
  techniques: string[];
  toolsOrSignals: string[];
  defense: string;
}

export interface TcpIpVulnLayer {
  id: string;
  layer: string;
  role: string;
  threats: string[];
  countermeasures: string[];
}

export interface MalwareEntry {
  id: string;
  name: string;
  tagline: string;
  definition: string;
  howObtained: string[];
  propagation: string;
  commonActions: string[];
  subtypes?: { name: string; detail: string }[];
  matrix: {
    autoNetwork: boolean;
    byEmail: boolean;
    selfReplicates: boolean;
    stealsData: boolean;
    remoteReturn: boolean;
    hidesItself: boolean;
  };
}

export interface CryptoConcept {
  id: string;
  title: string;
  badge: string;
  summary: string;
  howItWorks: string;
  algorithms: string[];
  guarantees: string[];
}

export interface PerimeterDefense {
  id: 'firewall' | 'proxy' | 'ids' | 'ssl';
  name: string;
  subtitle: string;
  analogy: string;
  definition: string;
  functions: string[];
  placement: string;
}

export interface PhysicalSecurityCategory {
  title: string;
  threats: string[];
  solutions: string[];
}

export interface InfoSecQuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DefensePillarGuide {
  id: 'firewall' | 'criptografia' | 'ids-ips';
  step: string;
  title: string;
  tagline: string;
  accent: 'cyan' | 'emerald' | 'amber';
  coreRole: string;
  howItWorks: string;
  mechanisms: { name: string; detail: string }[];
  practicalExampleTitle: string;
  practicalExample: string;
  commonMistake: string;
}

export interface IdsVsIpsRow {
  criterion: string;
  ids: string;
  ips: string;
}

export interface DefenseTheoryQuestion {
  id: string;
  scenario: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DefenseTheoryMission {
  id: string;
  order: number;
  pillar: 'firewall' | 'criptografia' | 'ids-ips' | 'integracao';
  pillarLabel: string;
  title: string;
  briefing: string;
  badgeId: DefenseBadgeId;
  badgeTitle: string;
  badgeSubtitle: string;
  badgeCode: string;
  badgePoints: number;
  badgePalette: 'cyan' | 'emerald' | 'crimson';
  accent: 'cyan' | 'emerald' | 'amber' | 'rose';
  questions: DefenseTheoryQuestion[];
}

export const COURSE_SYLLABUS = {
  course: 'Técnico de Nível Médio em Manutenção e Suporte em Informática',
  discipline: 'Segurança da Informação',
  grade: '3ª Série · Integrada',
  workload: '40h anuais (20h Teórica + 20h Prática)',
  axis: 'Informação e Comunicação',
  ementa:
    'Conceitos básicos de Segurança e Auditoria da Tecnologia da Informação: Segurança Lógica, Segurança Física, Segurança Ambiental, Política de Segurança, Continuidade Operacional, Planos de Contingência, Acesso Lógico, Controle de Acesso, Pontos de Controle e Normas de Gestão de Segurança da Informação.',
  units: [
    {
      number: '01',
      title: 'Princípios da Segurança da Informação',
      topics: [
        'Proteção da informação e Tríade CID',
        'Papéis e responsabilidades (Pessoas, Processos, Ferramentas)',
        'Ameaças comuns e anatomia de ataques',
        'Gerenciamento de riscos',
        'Classificação da informação',
        'Políticas e procedimentos (PSI)',
      ],
    },
    {
      number: '02',
      title: 'Normas e Padronização',
      topics: [
        'Principais normas de segurança (ISO/IEC 27001, 27002, 13335)',
        'Certificação de segurança da informação (SGSI)',
        'NBR ISO/IEC 27001 e 17799/27002',
        'Objetivos de controles e auditoria',
      ],
    },
    {
      number: '03',
      title: 'Criptografia',
      topics: [
        'Chaves e algoritmos de criptografia',
        'Criptografia simétrica e algoritmos simétricos',
        'Criptografia assimétrica e algoritmos assimétricos',
        'Envelope digital e Assinatura digital',
      ],
    },
    {
      number: '04',
      title: 'Malware e Defesas',
      topics: [
        'Definição e tipos de códigos maliciosos',
        'Anatomia do vírus, propagação e payload',
        'Vírus de macro, Worms, Bots/Botnets e Spyware',
        'Cavalo de Troia (Trojans), Backdoors e Rootkits',
      ],
    },
  ],
};

export const OFFICE_SECURITY_FLAWS: OfficeSecurityFlaw[] = [
  {
    id: 1,
    title: 'Software / Manual Exposto na Mesa',
    shortLabel: '1. Mídia "Word" solta',
    category: 'Integridade',
    xPercent: 14,
    yPercent: 52,
    description:
      'Caixas de instalação, mídias e chaves de licença deixadas sobre a mesa facilitam furto, instalação não autorizada ou uso de software sem controle.',
    remediation:
      'Controlar inventário de licenças em local trancado e restringir privilégios de instalação nos computadores.',
  },
  {
    id: 2,
    title: 'Monitor Desbloqueado com Dados Sigilosos',
    shortLabel: '2. Tela "Budget" aberta',
    category: 'Confidencialidade',
    xPercent: 32,
    yPercent: 52,
    description:
      'O computador sem usuário presente exibe o orçamento financeiro ("Church Budget") em tela aberta, expondo informações confidenciais a qualquer visitante.',
    remediation:
      'Ativar bloqueio automático de tela por inatividade (Win+L / Ctrl+Alt+L) e política de mesa e tela limpas.',
  },
  {
    id: 3,
    title: 'Backups Guardados Junto aos Equipamentos',
    shortLabel: '3. Backup 1 e 2 na mesa',
    category: 'Disponibilidade',
    xPercent: 54,
    yPercent: 48,
    description:
      'As caixas "Backup 1" e "Backup 2" estão empilhadas ao lado dos PCs. Um incêndio, furto ou curto-circuito destruiria os dados originais e as cópias ao mesmo tempo.',
    remediation:
      'Aplicar a regra 3-2-1: manter cópias em cofre antichamas e em local externo (off-site) ou nuvem criptografada.',
  },
  {
    id: 4,
    title: 'Café Quente em Cima do Monitor',
    shortLabel: '4. Xícara no monitor',
    category: 'Física',
    xPercent: 69,
    yPercent: 35,
    description:
      'Líquidos quentes sobre equipamentos eletrônicos representam risco imediato de curto-circuito, perda de hardware e indisponibilidade do posto de trabalho.',
    remediation:
      'Proibir alimentos e bebidas sobre equipamentos de TI na Política de Uso Aceitável.',
  },
  {
    id: 5,
    title: 'Senhas Coladas em Post-its na Tela',
    shortLabel: '5. Post-its no monitor',
    category: 'Confidencialidade',
    xPercent: 77,
    yPercent: 53,
    description:
      'Anotar senhas e códigos de acesso em bilhetes colados no monitor anula completamente o controle de autenticação.',
    remediation:
      'Usar gerenciador de senhas corporativo e autenticação de múltiplos fatores (MFA).',
  },
  {
    id: 6,
    title: 'Telefone Próximo a Mídias / Engenharia Social',
    shortLabel: '6. Telefone / Exposição',
    category: 'Confidencialidade',
    xPercent: 13,
    yPercent: 68,
    description:
      'Equipamento telefônico ao lado de documentos e telas abertas favorece vazamento acidental em chamadas e ataques de engenharia social.',
    remediation:
      'Validar identidade do solicitante antes de fornecer qualquer dado por telefone e nunca confirmar senhas verbalmente.',
  },
  {
    id: 7,
    title: 'Cabo de Energia Exposto sem Proteção (Nobreak)',
    shortLabel: '7. Tomada / Cabo solto',
    category: 'Disponibilidade',
    xPercent: 18,
    yPercent: 84,
    description:
      'Cabo solto no caminho das cadeiras e ligado diretamente na tomada sem nobreak/estabilizador pode ser desconectado por acidente e corromper dados.',
    remediation:
      'Organizar cabeamento em canaletas protegidas e ligar estações críticas a nobreak (UPS).',
  },
  {
    id: 8,
    title: 'Gaveteiro de Arquivos Destrancado e Aberto',
    shortLabel: '8. Gaveta aberta',
    category: 'Física',
    xPercent: 55,
    yPercent: 78,
    description:
      'Documentos físicos confidenciais armazenados em gavetas abertas e sem chave permitem acesso físico não autorizado e furto de informações.',
    remediation:
      'Trancar arquivos físicos ao se ausentar e classificar documentos em papel conforme a PSI.',
  },
];

export const DIKW_STAGES: DikwStage[] = [
  {
    id: 'dados',
    title: 'Dados',
    metaphor: 'Tijolos soltos',
    definition:
      'Representação bruta e normalizada de fatos, conceitos ou instruções (números, registros, textos isolados) ainda sem contexto completo.',
    example: '15/09/2011; 2010; 10.0.0.45; 403; 14:22:08',
  },
  {
    id: 'informacao',
    title: 'Informação',
    metaphor: 'Parede construída',
    definition:
      'Conjunto de dados devidamente ordenados, correlacionados e organizados de forma a terem significado útil para pessoas ou sistemas.',
    example: 'O IP 10.0.0.45 recebeu 38 respostas HTTP 403 em 1 minuto no portal de notas.',
  },
  {
    id: 'conhecimento',
    title: 'Conhecimento',
    metaphor: 'Casa pronta',
    definition:
      'Conjunto de várias informações organizadas em padrão lógico, capaz de orientar decisões estratégicas e ações de defesa.',
    example:
      'Trata-se de uma tentativa de enumeração de diretórios; devemos bloquear a origem no firewall e auditar o servidor web.',
  },
];

export const SECURITY_MYTHS: SecurityMyth[] = [
  {
    id: 'm1',
    statement: '“Isso nunca acontecerá conosco.”',
    reality:
      'Ataques automatizados (varreduras e bots) não escolhem vítimas por tamanho: qualquer IP exposto com vulnerabilidade vira alvo em minutos.',
    riskTag: 'Falsa sensação de segurança',
  },
  {
    id: 'm2',
    statement: '“Nunca fomos atacados.”',
    reality:
      'Sem logs, monitoramento e IDS, invasões passivas ou backdoors podem permanecer ativos por meses sem serem notados.',
    riskTag: 'Ausência de visibilidade',
  },
  {
    id: 'm3',
    statement: '“Utilizamos as últimas versões dos sistemas dos melhores fabricantes.”',
    reality:
      'Mesmo softwares atualizados sofrem com erros de configuração, senhas padrão (default), vulnerabilidades zero-day e engenharia social.',
    riskTag: 'Configuração & Fator humano',
  },
  {
    id: 'm4',
    statement: '“Problemas de segurança são de responsabilidade exclusiva do setor de TI.”',
    reality:
      'Segurança depende da tríade Pessoas, Processos e Ferramentas. Um clique em phishing no setor administrativo pode comprometer toda a rede.',
    riskTag: 'Cultura organizacional',
  },
  {
    id: 'm5',
    statement: '“Linux não pega vírus.”',
    reality:
      'Servidores e estações Linux são alvos frequentes de rootkits, cryptominers, ransomware, backdoors e falhas em serviços (SSH, Apache, kernel).',
    riskTag: 'Mito de plataforma',
  },
  {
    id: 'm6',
    statement: '“Ninguém vai descobrir essa brecha em nossa segurança.”',
    reality:
      'Segurança por obscuridade falha sempre: scanners automáticos testam portas, diretórios e credenciais conhecidas continuamente na Internet.',
    riskTag: 'Segurança por obscuridade',
  },
  {
    id: 'm7',
    statement: '“Tomamos todas as precauções, então testes não são necessários.”',
    reality:
      'Novas falhas surgem diariamente e mudanças no ambiente abrem brechas inesperadas. Auditorias, testes e backups validados são contínuos.',
    riskTag: 'Falta de auditoria',
  },
  {
    id: 'm8',
    statement: '“Nosso parceiro é confiável, podemos liberar acesso total para ele.”',
    reality:
      'Confiança excessiva entre redes amplia o impacto caso o parceiro seja invadido. Aplica-se sempre o Princípio do Menor Privilégio.',
    riskTag: 'Excesso de confiança',
  },
];

export const TRIAD_PILLARS: TriadPillar[] = [
  {
    id: 'confidencialidade',
    title: 'Confidencialidade',
    shortCode: 'C',
    definition:
      'Garante que a informação não será disponibilizada nem divulgada a indivíduos, entidades ou processos sem autorização explícita do proprietário.',
    violation: 'Exposição ou revelação não autorizada de dados (ex.: interceptação na rede ou vazamento).',
    threatExample: 'Captura de senhas em Wi-Fi público sem HTTPS ou leitura de planilha salarial aberta.',
    controls: [
      'Controle de acesso lógico e físico',
      'Criptografia de dados em trânsito (HTTPS/TLS, VPN) e em repouso',
      'Classificação da informação e autenticação multifator (MFA)',
    ],
    accent: 'cyan',
  },
  {
    id: 'integridade',
    title: 'Integridade',
    shortCode: 'I',
    definition:
      'Garante que a informação mantenha todas as características originais estabelecidas pelo proprietário, sem modificações impróprias ou não autorizadas.',
    violation: 'Adulteração, corrupção ou exclusão indevida de dados, arquivos ou registros.',
    threatExample: 'Alteração de notas no sistema acadêmico, defacement de site ou mudança de valor em transferência.',
    controls: [
      'Permissões rigorosas de arquivo (chmod, grupos de acesso, menor privilégio)',
      'Funções de Hash / Checksum (SHA-256) e assinaturas digitais',
      'Validação de origem (autenticação) e controle de versão',
    ],
    accent: 'emerald',
  },
  {
    id: 'disponibilidade',
    title: 'Disponibilidade',
    shortCode: 'D',
    definition:
      'Garante que a informação e os serviços computacionais estejam sempre acessíveis para uso legítimo pelos usuários autorizados quando precisarem.',
    violation: 'Retenção não autorizada de recursos, paralisação de servidores ou degradação severa de rede.',
    threatExample: 'Ataque de Negação de Serviço (DoS/DDoS), incêndio em datacenter, falta de energia ou ransomware.',
    controls: [
      'Redundância de servidores, links e energia (nobreaks e geradores)',
      'Backups periódicos testados + Planos DRP e PCN',
      'Mitigação de DoS/DDoS e cabeamento estruturado organizado',
    ],
    accent: 'amber',
  },
];

export const EXTRA_ATTRIBUTES: ExtraAttribute[] = [
  {
    name: 'Autenticidade',
    definition: 'Assegura que a informação ou mensagem provém realmente da fonte que declara ser.',
    mechanism: 'Certificados digitais, senhas fortes, MFA e assinaturas digitais.',
  },
  {
    name: 'Não-repúdio',
    definition: 'Impede que o autor de uma ação ou envio de mensagem negue posteriormente sua participação.',
    mechanism: 'Assinatura digital com chave privada e trilha de auditoria assinada.',
  },
  {
    name: 'Auditabilidade (Auditoria)',
    definition: 'Permite rastrear e verificar o que foi feito no sistema, por quem, quando e o que foi afetado.',
    mechanism: 'Logs centralizados, íntegros e protegidos contra alteração.',
  },
  {
    name: 'Controle de Acesso',
    definition: 'Capacidade de permitir ou negar acesso aos serviços e recursos conforme perfis autorizados.',
    mechanism: 'Listas de Controle de Acesso (ACLs), RBAC, AAA / TACACS+ e permissões de SO.',
  },
  {
    name: 'Confiabilidade',
    definition: 'Garante que, mesmo sob condições adversas ou falhas parciais, o sistema atuará conforme esperado.',
    mechanism: 'Arquitetura resiliente, testes de carga e tratamento seguro de erros.',
  },
  {
    name: 'Legalidade',
    definition: 'Assegura aderência dos sistemas e processos à legislação vigente e normas aplicáveis.',
    mechanism: 'Conformidade com LGPD, Marco Civil da Internet e normas NBR ISO/IEC.',
  },
];

export const ORG_PRIORITIES: OrgPriorityProfile[] = [
  {
    id: 'banco',
    organization: 'Instituição Bancária',
    topPriority: 'Integridade + Auditoria são críticas; depois Confidencialidade e Disponibilidade',
    ranking: [
      {
        pillar: 'Integridade & Auditoria',
        level: 'Crítico',
        reason: 'Um centavo adulterado em saldo ou ausência de rastreio destrói a confiança financeira e legal.',
      },
      {
        pillar: 'Confidencialidade',
        level: 'Alto',
        reason: 'Sigilo bancário exige proteção estrita de credenciais, extratos e chaves PIX.',
      },
      {
        pillar: 'Disponibilidade',
        level: 'Essencial',
        reason: 'Sistemas fora do ar paralisam pagamentos, embora a integridade jamais possa ser sacrificada.',
      },
    ],
  },
  {
    id: 'universidade',
    organization: 'Instituto Federal / Universidade',
    topPriority: 'Integridade + Disponibilidade em destaque para ensino e registros acadêmicos',
    ranking: [
      {
        pillar: 'Integridade',
        level: 'Crítico',
        reason: 'Notas, históricos escolares, pesquisas e diplomas precisam ser fidedignos e inalteráveis.',
      },
      {
        pillar: 'Disponibilidade',
        level: 'Crítico',
        reason: 'Aulas, laboratórios, AVAs e portais de matrícula precisam estar acessíveis à comunidade.',
      },
      {
        pillar: 'Confidencialidade',
        level: 'Alto',
        reason: 'Dados pessoais de estudantes (LGPD) e provas sigilosas requerem controle de acesso.',
      },
    ],
  },
  {
    id: 'hospital',
    organization: 'Hospital / Rede de Saúde',
    topPriority: 'Disponibilidade + Integridade salvam vidas; Confidencialidade protege prontuários',
    ranking: [
      {
        pillar: 'Disponibilidade',
        level: 'Crítico',
        reason: 'Paralisação de exames, UTI ou prontuários eletrônicos coloca vidas em risco imediato.',
      },
      {
        pillar: 'Integridade',
        level: 'Crítico',
        reason: 'Alteração em dosagem de medicamento ou tipo sanguíneo pode ser fatal.',
      },
      {
        pillar: 'Confidencialidade',
        level: 'Alto',
        reason: 'Prontuários médicos são dados sensíveis protegidos por sigilo profissional e LGPD.',
      },
    ],
  },
];

export const PSI_STANDARDS = {
  components: [
    { name: 'Objetivo', question: 'Por que a política existe e qual risco busca controlar?' },
    { name: 'Escopo', question: 'Aplica-se a toda a organização, servidores específicos ou apenas a um setor?' },
    { name: 'Responsabilidades', question: 'Quem deve cumprir, administrar e auditar? Quais são direitos e deveres?' },
    { name: 'Conformidade', question: 'Como fiscalizar e qual a sanção em caso de descumprimento (intencional ou falta de treino)?' },
  ],
  routerPolicyRules: [
    'Não configurar contas locais fixas nos roteadores de produção.',
    'Usar TACACS+ (AAA) para autenticação, autorização e contabilização centralizada.',
    'Criptografar obrigatoriamente a senha de "enable".',
    'Desabilitar broadcast IP direcionado, pacotes com IPs inválidos (ex.: RFC 1918 na borda), serviços pequenos TCP/UDP (echo, chargen, daytime, discard), source routing e interface web no roteador.',
    'Jamais manter a comunidade SNMP padrão "public".',
  ],
  serverAuthPolicyRules: [
    'Senhas com no mínimo 8 caracteres combinando maiúsculas, minúsculas, números e símbolos especiais.',
    'Autenticação de Múltiplo Fator (MFA) obrigatória para acesso remoto aos servidores.',
    'Acesso restrito exclusivamente a usuários autorizados do setor de TI.',
    'Servidores hospedados em segmento de rede isolado da rede de usuários finais.',
  ],
  norms: [
    {
      code: 'NBR ISO/IEC 27001',
      focus: 'Requisitos do SGSI (Certificável)',
      detail:
        'Define os requisitos formais para estabelecer, implementar, manter e melhorar continuamente um Sistema de Gestão da Segurança da Informação (SGSI), permitindo certificação oficial.',
    },
    {
      code: 'NBR ISO/IEC 27002 (ex-17799)',
      focus: 'Código de Prática e Controles',
      detail:
        'Fornece diretrizes práticas e objetivos de controle para seleção e implementação de medidas de segurança (acesso, criptografia, segurança física, continuidade e compliance).',
    },
    {
      code: 'ISO/IEC 13335',
      focus: 'Gestão de Ativos e Riscos de TI',
      detail:
        'Define conceitos fundamentais como Ativo ("qualquer coisa que tenha valor para a organização") e Ameaça ("causa potencial de um incidente indesejado").',
    },
  ],
};

export const ATTACK_FLOWS: AttackFlowDiagram[] = [
  {
    id: 'normal',
    title: 'Fluxo Normal',
    violatedAttribute: 'Nenhum (Comunicação íntegra)',
    attackClass: 'Normal',
    shireyGroup: 'Operação Legítima',
    description:
      'A mensagem sai da Origem (O) e chega ao Destino (D) sem interferência, cópia indevida ou atraso malicioso.',
    realExample: 'Requisição HTTPS válida do aluno ao portal acadêmico com certificado verificado.',
    prevention: 'Manter criptografia forte, autenticação ativa e monitoramento contínuo.',
  },
  {
    id: 'interrupcao',
    title: 'Interrupção',
    violatedAttribute: 'Disponibilidade',
    attackClass: 'Ativo',
    shireyGroup: 'Disruption (Interrupção)',
    description:
      'Um ativo ou canal de comunicação é destruído, bloqueado ou sobrecarregado, impedindo que a mensagem chegue ao destino.',
    realExample: 'Corte físico de fibra óptica, sabotagem de hardware ou ataque DoS/DDoS derrubando um servidor.',
    prevention: 'Redundância de links, firewall/anti-DDoS, nobreak e plano de continuidade (PCN).',
  },
  {
    id: 'interceptacao',
    title: 'Interceptação',
    violatedAttribute: 'Confidencialidade',
    attackClass: 'Passivo',
    shireyGroup: 'Disclosure (Snooping)',
    description:
      'Um agente não autorizado (I) captura ou lê informações em trânsito sem alterar o conteúdo original — muito difícil de detectar.',
    realExample: 'Sniffing de pacotes em rede Wi-Fi aberta, grampo de linha ou cópia ilegal de arquivo sigiloso.',
    prevention: 'Criptografia ponta a ponta (TLS/HTTPS, SSH, VPN) e segmentação de rede.',
  },
  {
    id: 'modificacao',
    title: 'Modificação',
    violatedAttribute: 'Integridade',
    attackClass: 'Ativo',
    shireyGroup: 'Deception / Disruption',
    description:
      'O invasor (M) intercepta a mensagem no meio do caminho (Man-in-the-Middle), altera seu conteúdo e encaminha a versão adulterada ao destino.',
    realExample: 'Alterar valor ou conta destino em uma requisição bancária ou modificar páginas web (Defacement).',
    prevention: 'Verificação de integridade (Hash/HMAC), assinatura digital, TLS e permissões rígidas.',
  },
  {
    id: 'fabricacao',
    title: 'Fabricação',
    violatedAttribute: 'Autenticidade',
    attackClass: 'Ativo',
    shireyGroup: 'Deception (Spoofing / Masquerading)',
    description:
      'O atacante (F) cria e injeta mensagens ou registros falsos no sistema se passando por um usuário ou serviço legítimo.',
    realExample: 'E-mail de phishing falsificando o remetente do banco, IP spoofing ou injeção de transações falsas.',
    prevention: 'Autenticação forte (MFA), certificados digitais, SPF/DKIM/DMARC e assinaturas criptográficas.',
  },
];

export const ATTACKER_PROFILES: AttackerProfile[] = [
  {
    id: 'hacker',
    name: 'Hackers',
    intent: 'Exploração técnica, pesquisa e domínio profundo de sistemas (na maioria dos casos sem causar danos)',
    skillLevel: 'Alto conhecimento em programação, redes e sistemas operacionais',
    traits: [
      'Elaboram suas próprias técnicas e ferramentas',
      'Compartilham conhecimento técnico com a comunidade',
      'No contexto ético (White Hat / Blue & Red Team autorizado), ajudam a encontrar e corrigir falhas',
    ],
    accent: 'cyan',
  },
  {
    id: 'cracker',
    name: 'Crackers',
    intent: 'Lucro ilícito, furto de dados, espionagem industrial ou destruição de sistemas',
    skillLevel: 'Alto conhecimento técnico aplicado com finalidade maliciosa',
    traits: [
      'Invadem sistemas para roubar arquivos, credenciais e dados de cartão de crédito',
      'Instalam backdoors e ransomware para extorsão ou sabotagem',
      'Provocam destruição ou vazamento deliberado de dados',
    ],
    accent: 'rose',
  },
  {
    id: 'script-kiddie',
    name: 'Script Kiddies',
    intent: 'Invadir ou causar transtornos por curiosidade ou má intenção sem dominar a base técnica',
    skillLevel: 'Baixo conhecimento em programação e fundamentos',
    traits: [
      'Utilizam scripts e ferramentas prontas criadas por terceiros',
      'Exploram vulnerabilidades já conhecidas e amplamente divulgadas',
      'Frequentemente deixam rastros evidentes e nem compreendem totalmente o impacto do ataque',
    ],
    accent: 'amber',
  },
];

export const ATTACK_ANATOMY_STEPS: AttackAnatomyStep[] = [
  {
    step: 1,
    name: 'Footprinting (Reconhecimento)',
    englishName: 'Reconnaissance',
    summary:
      'Coleta inicial de informações públicas ou por engenharia social para mapear a postura de segurança da organização.',
    techniques: [
      'Pesquisa de domínios, faixas de IP, nomes de servidores e padrões de e-mail',
      'Engenharia social (ligações fingindo ser funcionário para pedir senha ou IP de servidor)',
    ],
    toolsOrSignals: ['whois', 'nslookup / dig', 'Google Hacking', 'Redes sociais corporativas'],
    defense: 'Treinamento anti-engenharia social, revisão de dados públicos e política de divulgação.',
  },
  {
    step: 2,
    name: 'Scanning (Varredura)',
    englishName: 'Network Scanning',
    summary:
      'Descobre quais hosts estão ativos, quais portas TCP/UDP estão abertas, topologia da rede e sistema operacional (fingerprint).',
    techniques: [
      'Varredura de portas TCP/UDP (Port Scan) e detecção de banners',
      'Mapeamento de topologia e captura de pacotes (sniffing) em redes mal protegidas',
    ],
    toolsOrSignals: ['nmap', 'ping', 'traceroute', 'SNMP', 'sniffers'],
    defense: 'Firewall com bloqueio de varreduras, desabilitar portas desnecessárias e alertas de IDS/NIDS.',
  },
  {
    step: 3,
    name: 'Enumeration (Enumeração)',
    englishName: 'Enumeration',
    summary:
      'Coleta intrusiva mediante conexões diretas ao alvo para listar usuários válidos, versões exatas de serviços e compartilhamentos.',
    techniques: [
      'Identificação de logins válidos, banners HTTP/FTP/SSH e compartilhamentos de rede',
      'Escaneamento automatizado de vulnerabilidades conhecidas',
    ],
    toolsOrSignals: ['net view / nbtstat (Windows)', 'showmount (Unix/Linux)', 'Scanners de vulnerabilidade (ex.: Nessus)'],
    defense: 'Ocultar banners de versão, desativar compartilhamentos anônimos e monitorar logs de conexão.',
  },
  {
    step: 4,
    name: 'Ganhando Acesso (Invasão)',
    englishName: 'Gaining Access',
    summary:
      'Exploração prática das vulnerabilidades mapeadas para obter ao menos um acesso inicial como usuário comum.',
    techniques: [
      'Exploração de senhas padrão/fracas, SQL Injection, travessia de diretórios ou buffer overflow',
      'Password sniffing, quebra de senhas e sequestro de sessão (Session Hijacking)',
    ],
    toolsOrSignals: ['Exploits específicos de versão', 'Brute-force / Wordlists', 'Phishing'],
    defense: 'Patches atualizados, MFA, validação de entradas (queries parametrizadas) e senhas fortes.',
  },
  {
    step: 5,
    name: 'Escalada de Privilégios',
    englishName: 'Privilege Escalation',
    summary:
      'A partir de uma conta comum, o invasor busca privilégio máximo no sistema (root no Linux ou Administrator no Windows).',
    techniques: [
      'Exploração de bugs locais de kernel, serviços mal configurados (SUID/permissões) ou buffer overflow',
      'Uso de trojans ou credenciais administrativas reutilizadas',
    ],
    toolsOrSignals: ['Exploits locais', 'Credenciais administrativas em texto claro'],
    defense: 'Princípio do menor privilégio, atualização de kernel/SO e separação entre contas de usuário e admin.',
  },
  {
    step: 6,
    name: 'Acesso à Informação',
    englishName: 'Data Exfiltration / Tampering',
    summary:
      'Cumprimento do objetivo do ataque: ler, copiar, alterar ou sequestrar os ativos de informação da organização.',
    techniques: [
      'Violação da confidencialidade (exfiltração de bancos de dados e arquivos)',
      'Violação da integridade (adulteração de registros ou defacement de sites)',
    ],
    toolsOrSignals: ['Consultas anômalas em bancos', 'Transferências incomuns de volume de dados'],
    defense: 'Criptografia de dados sensíveis, DLP, segmentação de rede e monitoramento de saída.',
  },
  {
    step: 7,
    name: 'Ocultação de Rastros',
    englishName: 'Covering Tracks',
    summary:
      'O invasor tenta apagar evidências da invasão para permanecer despercebido, evitando deixar lacunas óbvias nos registros.',
    techniques: [
      'Desabilitar serviços de auditoria e remover seletivamente entradas do Event Log / syslog',
      'Ocultar arquivos e processos plantados',
    ],
    toolsOrSignals: ['Logs interrompidos abruptamente', 'Ferramentas de limpeza seletiva de logs'],
    defense: 'Envio de logs em tempo real para servidor centralizado (SIEM) somente-leitura fora do host.',
  },
  {
    step: 8,
    name: 'Instalação de Backdoors & Rootkits',
    englishName: 'Maintaining Access',
    summary:
      'Garante retorno futuro ao ambiente comprometido sem precisar repetir toda a invasão.',
    techniques: [
      'Instalação de backdoors (portas ocultas cliente/servidor) e trojans espiões',
      'Rootkits que substituem comandos legítimos do SO para esconder processos e conexões do invasor',
    ],
    toolsOrSignals: ['Portas incomuns em escuta', 'Binários do sistema com hash alterado'],
    defense: 'Verificação periódica de integridade de arquivos (checksum), IDS baseado em host e auditoria de portas.',
  },
  {
    step: 9,
    name: 'Negação de Serviço (DoS / DDoS)',
    englishName: 'Denial of Service',
    summary:
      'Bloqueio ou paralisação dos serviços da vítima por saturação de banda, esgotamento de recursos ou ataques coordenados (DDoS).',
    techniques: [
      'Arquitetura DDoS: Atacante → Master → Agentes (Zumbis/Botnet) → Flood na Vítima',
      'Consumo de banda, SYN Flood, falhas de protocolo ou sabotagem de DNS/roteamento',
    ],
    toolsOrSignals: ['Picos extremos de tráfego', 'Serviços legítimos inacessíveis (timeout)'],
    defense: 'Rate limiting, mitigação DDoS no provedor/borda, SYN cookies e redundância de infraestrutura.',
  },
];

export const TCPIP_VULNERABILITIES: TcpIpVulnLayer[] = [
  {
    id: 'l4-app',
    layer: 'Aplicação',
    role: 'Protocolos de alto nível e serviços (HTTP, FTP, SSH, SNMP, DNS)',
    threats: [
      'Senhas enviadas em texto claro (Telnet, FTP, HTTP sem TLS)',
      'SQL Injection / Formatação de Strings e Travessia de Diretórios (../)',
      'Vírus, Worms e Cavalos de Troia; serviços rodando com privilégio excessivo',
      'Erros de configuração (ex.: FTP anônimo com permissão de gravação) e contas default',
    ],
    countermeasures: [
      'Usar HTTPS/TLS, SFTP e SSH em vez de protocolos em texto claro',
      'Validar entradas, remover contas default/anônimas e aplicar patches',
    ],
  },
  {
    id: 'l3-trans',
    layer: 'Transporte',
    role: 'TCP e UDP — portas, controle de fluxo, sequenciamento e retransmissão',
    threats: [
      'Port Scan (varredura de portas TCP/UDP para mapear serviços ativos)',
      'SYN Flood (esgotamento de conexões meio-abertas no handshake TCP)',
      'TCP Session Hijacking (sequestro de sessão ativa) e Man-in-the-Middle (MITM)',
    ],
    countermeasures: [
      'Fechar portas desnecessárias no firewall (princípio deny-by-default)',
      'Ativar SYN cookies, TLS e detecção de port scan no IDS',
    ],
  },
  {
    id: 'l2-net',
    layer: 'Rede (Inter-Rede)',
    role: 'IP (IPv4/IPv6) e roteamento entre redes (BGP, OSPF)',
    threats: [
      'IPv4 nativo não oferece confidencialidade (pacotes legíveis na rede pública/ISP)',
      'IP Spoofing (endereço IP de origem falsificado) e vulnerabilidades em BGP/OSPF',
      'Roteadores com senha padrão do fabricante, firewalls mal configurados e buffer overflow',
    ],
    countermeasures: [
      'ACLs bem configuradas no roteador de borda, VPN/IPsec e hardening de roteadores',
      'Filtrar pacotes com IPs privados (RFC 1918) vindos da Internet',
    ],
  },
  {
    id: 'l1-link',
    layer: 'Enlace & Física',
    role: 'Cabos, conectores, Wi-Fi (802.11), switches, energia e protocolo ARP',
    threats: [
      'Vandalismo e acesso físico a racks, cabos lógicos e disjuntores',
      'Interferência elétrica/picos de energia e ruído em Wi-Fi 2.4 GHz (DoS físico)',
      'Captura de sinal sem fio sem criptografia e ARP Cache Poisoning (envenenamento ARP)',
    ],
    countermeasures: [
      'Acesso físico restrito a racks/datacenter, nobreaks e cabeamento protegido',
      'WPA2/WPA3 obrigatório no Wi-Fi e proteção contra ARP spoofing nos switches',
    ],
  },
];

export const MALWARE_CATALOG: MalwareEntry[] = [
  {
    id: 'virus',
    name: 'Vírus',
    tagline: 'Infecta arquivos/programas hospedeiros e exige execução para se propagar',
    definition:
      'Programa ou fragmento de código malicioso que se propaga inserindo cópias de si mesmo dentro de outros arquivos ou programas (como documentos com macros ou executáveis).',
    howObtained: ['E-mail com anexo infectado', 'Downloads de sites', 'Mídias removíveis (pendrives)', 'Compartilhamento de arquivos'],
    propagation: 'Insere cópias de si próprio em arquivos hospedeiros; depende da execução do arquivo infectado.',
    commonActions: ['Altera ou remove arquivos', 'Executa payload malicioso', 'Tenta se manter oculto no sistema'],
    subtypes: [
      { name: 'Vírus de Macro', detail: 'Embutido em documentos (planilhas/textos) que executam scripts automáticos ao abrir.' },
      { name: 'Anatomia: Propagação + Payload', detail: 'Combina rotina de replicação (como se espalha) com a carga útil (ação danosa executada).' },
    ],
    matrix: { autoNetwork: false, byEmail: true, selfReplicates: true, stealsData: false, remoteReturn: false, hidesItself: true },
  },
  {
    id: 'worm',
    name: 'Worm (Verme)',
    tagline: 'Auto-replicável pela rede sem precisar de arquivo hospedeiro',
    definition:
      'Código malicioso capaz de se propagar automaticamente através de redes, enviando cópias de si mesmo de computador para computador explorando vulnerabilidades.',
    howObtained: ['Recebido automaticamente pela rede', 'Exploração de vulnerabilidades', 'E-mail e redes sociais'],
    propagation: 'Envia cópias de si automaticamente pela rede ou por e-mail sem depender de hospedeiro.',
    commonActions: ['Consome grande quantidade de banda/CPU', 'Instala outros malwares', 'Desfere ataques na Internet'],
    matrix: { autoNetwork: true, byEmail: true, selfReplicates: true, stealsData: false, remoteReturn: false, hidesItself: false },
  },
  {
    id: 'bot',
    name: 'Bot & Botnet',
    tagline: 'Transforma o PC em "Zumbi" controlado remotamente por um mestre',
    definition:
      'Programa com mecanismos de comunicação remota (IRC, Web, P2P) que permite ao invasor controlar o computador infectado (Zumbi). Centenas ou milhares de Zumbis formam uma Botnet.',
    howObtained: ['Rede / exploração de vulnerabilidades', 'Downloads ou anexos maliciosos', 'Inserido por outro malware'],
    propagation: 'Muitos bots propagam-se automaticamente pela rede e e-mail como worms.',
    commonActions: ['Ataques coordenados de DDoS', 'Envio de spam e phishing em massa', 'Furto de dados e camuflagem do atacante'],
    matrix: { autoNetwork: true, byEmail: true, selfReplicates: true, stealsData: true, remoteReturn: false, hidesItself: false },
  },
  {
    id: 'trojan',
    name: 'Cavalo de Troia (Trojan)',
    tagline: 'Disfarçado de programa legítimo; não se replica sozinho',
    definition:
      'Programa que parece inofensivo (cartão animado, jogo, utilitário gratuito), mas executa funções maliciosas ocultas sem o conhecimento do usuário.',
    howObtained: ['Baixado de sites', 'E-mail / redes sociais / mensagens', 'Mídias removíveis'],
    propagation: 'Não se propaga automaticamente — depende de enganar o usuário para ser executado.',
    commonActions: ['Furta senhas e dados bancários', 'Abre backdoors', 'Instala outros malwares ou apaga arquivos'],
    subtypes: [
      { name: 'Trojan Downloader / Dropper', detail: 'Baixa da internet (Downloader) ou extrai de si mesmo (Dropper) outros códigos maliciosos.' },
      { name: 'Trojan Backdoor / DoS', detail: 'Libera acesso remoto ao invasor ou instala ferramenta de negação de serviço.' },
      { name: 'Trojan Spy / Banker', detail: 'Instala spyware para furtar senhas, cartões e credenciais de Internet Banking.' },
      { name: 'Trojan Destrutivo / Clicker / Proxy', detail: 'Apaga arquivos, força cliques em propagandas ou transforma o PC em proxy para spam.' },
    ],
    matrix: { autoNetwork: false, byEmail: true, selfReplicates: false, stealsData: true, remoteReturn: false, hidesItself: false },
  },
  {
    id: 'spyware',
    name: 'Spyware',
    tagline: 'Monitora silenciosamente as atividades do usuário e envia dados a terceiros',
    definition:
      'Software projetado para espionar ações do sistema e coletar dados pessoais, credenciais ou hábitos de navegação sem consentimento.',
    howObtained: ['Downloads duvidosos', 'Anexos e links maliciosos', 'Ação de outro malware (Trojan Spy)'],
    propagation: 'Não se propaga sozinho; foca em permanecer oculto coletando dados.',
    commonActions: ['Captura teclas e telas', 'Exibe propagandas invasivas', 'Envia informações sensíveis ao atacante'],
    subtypes: [
      { name: 'Keylogger', detail: 'Captura e armazena todas as teclas digitadas pelo usuário (senhas, mensagens).' },
      { name: 'Screenlogger', detail: 'Captura a posição do cursor e imagens da tela no momento dos cliques do mouse (teclados virtuais).' },
      { name: 'Adware', detail: 'Projetado especificamente para exibir anúncios indesejados e coletar hábitos de navegação.' },
    ],
    matrix: { autoNetwork: false, byEmail: true, selfReplicates: false, stealsData: true, remoteReturn: false, hidesItself: true },
  },
  {
    id: 'backdoor',
    name: 'Backdoor',
    tagline: 'Porta secreta deixada para facilitar o retorno do invasor',
    definition:
      'Programa ou modificação de serviço que abre um acesso oculto em um computador comprometido, permitindo o retorno remoto sem passar pela autenticação normal.',
    howObtained: ['Inserido por um invasor após invasão', 'Instalado por Trojan Backdoor ou exploração de falha'],
    propagation: 'Não se replica nem infecta outros arquivos; serve para persistência de acesso.',
    commonActions: ['Permite retorno remoto do invasor', 'Escuta portas ocultas no sistema', 'Procura manter-se escondido'],
    matrix: { autoNetwork: false, byEmail: false, selfReplicates: false, stealsData: false, remoteReturn: true, hidesItself: true },
  },
  {
    id: 'rootkit',
    name: 'Rootkit',
    tagline: 'Modifica o sistema operacional para esconder processos, arquivos e invasores',
    definition:
      'Conjunto de técnicas e programas que alteram partes legítimas do sistema operacional (como comandos de listagem de processos e conexões) para ocultar a presença do invasor.',
    howObtained: ['Inserido por invasor com privilégio elevado', 'Via execução de outro código malicioso / exploração de vulnerabilidades'],
    propagation: 'Não se propaga automaticamente; atua como camuflagem profunda de acesso persistente.',
    commonActions: ['Esconde arquivos, processos e portas', 'Substitui comandos do SO', 'Mantém acesso furtivo do atacante'],
    matrix: { autoNetwork: false, byEmail: false, selfReplicates: false, stealsData: false, remoteReturn: true, hidesItself: true },
  },
];

export const CRYPTO_CONCEPTS: CryptoConcept[] = [
  {
    id: 'simetrica',
    title: 'Criptografia Simétrica',
    badge: '1 Chave Secreta',
    summary:
      'Utiliza exatamente a mesma chave secreta para cifrar e decifrar a mensagem. É extremamente rápida e ideal para grandes volumes de dados.',
    howItWorks:
      'Remetente e destinatário combinam previamente a mesma chave secreta. O principal desafio é distribuir essa chave com segurança pela rede.',
    algorithms: ['AES (128 / 256 bits)', 'ChaCha20', '3DES (legado)', 'Cifra de César (didática)'],
    guarantees: ['Confidencialidade rápida para arquivos, discos e tráfego após troca de chave'],
  },
  {
    id: 'assimetrica',
    title: 'Criptografia Assimétrica',
    badge: 'Par de Chaves (Pública + Privada)',
    summary:
      'Usa duas chaves matematicamente ligadas: a Chave Pública (pode ser divulgada) e a Chave Privada (guardada em sigilo absoluto pelo dono).',
    howItWorks:
      'O que é cifrado com a chave pública só pode ser aberto pela chave privada correspondente — resolvendo o problema de troca de chaves em redes abertas.',
    algorithms: ['RSA', 'ECC (Curvas Elípticas)', 'Diffie-Hellman (troca de chaves)'],
    guarantees: ['Confidencialidade sem segredo prévio', 'Base para certificados digitais, TLS e assinaturas'],
  },
  {
    id: 'envelope',
    title: 'Envelope Digital',
    badge: 'Híbrida (Simétrica + Assimétrica)',
    summary:
      'Combina o melhor dos dois mundos: velocidade da criptografia simétrica para os dados + segurança da assimétrica para proteger a chave da sessão.',
    howItWorks:
      '1) Gera-se uma chave simétrica aleatória para cifrar o arquivo grande. 2) Cifra-se apenas essa chave simétrica usando a Chave Pública do destinatário. 3) Ambos viajam juntos no "envelope".',
    algorithms: ['TLS / HTTPS (ECDHE + AES-GCM)', 'PGP / GPG', 'S/MIME'],
    guarantees: ['Alta performance em arquivos/conexões grandes com troca segura de chaves'],
  },
  {
    id: 'assinatura',
    title: 'Assinatura Digital',
    badge: 'Hash + Chave Privada',
    summary:
      'Mecanismo criptográfico que comprova matematicamente quem criou um documento e que nenhum bit foi alterado depois da assinatura.',
    howItWorks:
      '1) Calcula-se o Hash (SHA-256) do documento. 2) O remetente cifra esse hash com sua Chave Privada. 3) Qualquer pessoa valida usando a Chave Pública do remetente e comparando com o hash recalculado.',
    algorithms: ['RSA-PSS + SHA-256', 'ECDSA / Ed25519', 'ICP-Brasil (Certificado Digital)'],
    guarantees: ['Autenticidade (quem assinou)', 'Integridade (não foi alterado)', 'Não-repúdio (autor não pode negar)'],
  },
];

export const PERIMETER_DEFENSES: PerimeterDefense[] = [
  {
    id: 'firewall',
    name: 'Firewall',
    subtitle: 'Barreira de filtragem entre redes (Host ou Perímetro)',
    analogy: 'Porta corta-fogo / antichamas que impede o avanço do fogo entre ambientes de um prédio.',
    definition:
      'Aplicativo ou equipamento posicionado entre o link de comunicação e a rede/computador que inspeciona e filtra o fluxo de pacotes conforme regras de permissão e bloqueio.',
    functions: [
      'Bloqueia portas e tráfego não autorizados sem travar o tráfego legítimo',
      'Separa a Internet pública, a zona desmilitarizada (DMZ) e a rede corporativa (LAN)',
      'Pode atuar em software no host (Windows Firewall, UFW/iptables) ou em hardware dedicado (appliance)',
    ],
    placement: 'Borda entre Internet, DMZ e LAN interna + proteção local nos hosts.',
  },
  {
    id: 'proxy',
    name: 'Servidor Proxy',
    subtitle: 'Intermediário de navegação Web (Cache + Filtro)',
    analogy: 'Recepcionista que busca encomendas lá fora em nome da equipe e verifica cada pacote antes de entregar.',
    definition:
      'Servidor intermediário entre o navegador dos usuários internos e a Internet. Todas as requisições HTTP/HTTPS passam por ele antes de sair.',
    functions: [
      'Melhora o desempenho armazenando em cache páginas acessadas com frequência',
      'Filtra conteúdos web proibidos, sites de phishing e downloads mal-intencionados',
      'Registra auditoria detalhada de acessos Web e oculta IPs internos da rede externa',
    ],
    placement: 'Entre a estação do usuário na LAN e a saída para a Internet.',
  },
  {
    id: 'ids',
    name: 'IDS / IPS (NIDS & NIPS)',
    subtitle: 'Detecção (Passivo) e Prevenção (Ativo Inline) de Intrusões',
    analogy:
      'IDS é a câmera com alarme que avisa o vigilante; IPS é a catraca inteligente que trava a porta no instante em que detecta o invasor.',
    definition:
      'O IDS monitora cópias do tráfego (NIDS) ou eventos do host (HIDS) para gerar alertas sem interromper a conexão. Já o IPS fica posicionado em linha (inline) e bloqueia ou descarta pacotes maliciosos em tempo real.',
    functions: [
      'Detecta port scans, assinaturas de exploits, SQL Injection, brute-force e anomalias de rede',
      'IDS gera alertas para o SOC/SIEM sem adicionar latência; IPS descarta pacotes ou reseta conexões TCP automaticamente',
      'Pode operar por detecção baseada em assinaturas conhecidas ou por análise de anomalias comportamentais',
    ],
    placement:
      'IDS em porta espelhada (SPAN/TAP) da borda/DMZ/LAN; IPS inline entre o roteador/firewall e a rede protegida.',
  },
  {
    id: 'ssl',
    name: 'Protocolo SSL / TLS',
    subtitle: 'Canal criptografado e identidade na Web (HTTPS)',
    analogy: 'Carro-forte lacrado com identificação oficial do banco levando sua transação até o servidor.',
    definition:
      'Criado originalmente pela Netscape em 1994 (SSL) e evoluído para o padrão moderno TLS, cria um túnel criptografado entre navegador e servidor web, indicado pelo ícone de cadeado.',
    functions: [
      'Protege confidencialidade de senhas, cartões e formulários em trânsito',
      'Garante integridade: impede adulteração ou injeção de dados no meio do caminho',
      'Comprova legitimidade do site através de certificados digitais emitidos por Autoridades Certificadoras (CAs)',
    ],
    placement: 'Camada de Apresentação/Transporte protegendo HTTP (HTTPS), e-mail e APIs.',
  },
];

export const PHYSICAL_SECURITY_CATEGORIES: PhysicalSecurityCategory[] = [
  {
    title: 'Ameaças Naturais & Ambientais',
    threats: [
      'Incêndios e explosões (ex.: incidente real em prédio de operadora afetando 6 estados)',
      'Inundações, desabamentos, tempestades e descargas atmosféricas (raios)',
      'Superaquecimento de servidores e falta de climatização adequada',
    ],
    solutions: [
      'Sistemas automáticos de combate a incêndio com gás inerte (sem água sobre eletrônicos)',
      'Climatização com Piso Elevado e separação de Corredor Quente e Corredor Frio',
      'Plano de Recuperação de Desastres (DRP) e Plano de Continuidade de Negócios (PCN)',
    ],
  },
  {
    title: 'Acesso Físico, Energia & Fator Humano',
    threats: [
      'Acesso físico não autorizado a salas de servidores e racks distribuídos',
      'Vandalismo, roubo/furto de equipamentos e curto-circuito / quedas de energia',
      'Negligência, despreparo e desinformação dos usuários internos',
    ],
    solutions: [
      'Crachás, controle biométrico, CFTV 24h e circulação restrita em áreas críticas',
      'Nobreaks (UPS) e Grupos Geradores para fornecimento ininterrupto de energia',
      'Cofres antichamas para mídias de backup + proteção física de cabos lógicos e elétricos',
    ],
  },
];

export const RISK_CONCENTRIC_LAYERS = [
  {
    layer: '1. Ser Humano (Camada mais externa)',
    detail: 'Engenharia social, phishing, senhas fracas, negligência — exige conscientização e PSI.',
  },
  {
    layer: '2. Aplicações',
    detail: 'Bugs de código, SQL Injection, falta de validação, serviços sem patch.',
  },
  {
    layer: '3. Sistema Operacional',
    detail: 'Permissões indevidas, contas padrão/inativas, falta de atualização e auditoria.',
  },
  {
    layer: '4. Rede (Núcleo de conectividade)',
    detail: 'Firewall, ACLs, segmentação DMZ/LAN, criptografia em trânsito e IDS.',
  },
];

export const INFOSEC_QUIZ: InfoSecQuizQuestion[] = [
  {
    id: 'q1',
    topic: 'Tríade CID',
    question:
      'Um atacante intercepta uma mensagem na rede e altera o número da conta bancária de destino antes de encaminhá-la. Qual pilar principal da Segurança da Informação foi violado?',
    options: ['Disponibilidade', 'Integridade', 'Auditabilidade', 'Legalidade'],
    correctIndex: 1,
    explanation:
      'A modificação não autorizada de dados viola a Integridade (além da Confidencialidade pela interceptação prévia).',
  },
  {
    id: 'q2',
    topic: 'Atributos Complementares',
    question:
      'Qual propriedade garante que o autor de uma ação ou documento assinado digitalmente não possa negar futuramente sua participação?',
    options: ['Disponibilidade', 'Não-repúdio', 'Confidencialidade', 'Escalabilidade'],
    correctIndex: 1,
    explanation:
      'O Não-repúdio (irretratabilidade) impede que o originador negue ter enviado a mensagem ou executado a ação, geralmente garantido por assinatura digital.',
  },
  {
    id: 'q3',
    topic: 'Fluxos de Ataque',
    question:
      'Nos quatro fluxos clássicos de ataque (Interrupção, Interceptação, Modificação e Fabricação), qual deles é classificado como ataque PASSIVO?',
    options: ['Interceptação', 'Interrupção', 'Modificação', 'Fabricação'],
    correctIndex: 0,
    explanation:
      'A Interceptação apenas monitora/espiona o tráfego sem alterar os dados, sendo um ataque passivo (difícil de detectar; combate-se com criptografia).',
  },
  {
    id: 'q4',
    topic: 'Perfis de Invasores',
    question:
      'Como são chamados os invasores com pouco conhecimento em programação que usam ferramentas e scripts prontos de terceiros para explorar falhas conhecidas?',
    options: ['Auditores SGSI', 'Script Kiddies', 'Engenheiros de Rede', 'Analistas de NIDS'],
    correctIndex: 1,
    explanation:
      'Script Kiddies possuem pouco domínio técnico próprio e dependem de ferramentas criadas por outras pessoas para explorar falhas já divulgadas.',
  },
  {
    id: 'q5',
    topic: 'Malware',
    question:
      'Qual a diferença fundamental entre um Vírus e um Worm (Verme)?',
    options: [
      'O vírus só afeta redes Wi-Fi e o worm só afeta pendrives',
      'O vírus depende de um arquivo hospedeiro executado pelo usuário; o worm propaga-se automaticamente pela rede',
      'O worm não consome recursos do computador',
      'O vírus sempre criptografa a conexão HTTPS',
    ],
    correctIndex: 1,
    explanation:
      'O vírus insere cópias em outros arquivos e precisa que o hospedeiro seja executado; o worm é autônomo e se propaga pela rede explorando vulnerabilidades.',
  },
  {
    id: 'q6',
    topic: 'Malware',
    question:
      'Qual código malicioso substitui partes legítimas do sistema operacional para ocultar processos, arquivos e conexões de um invasor?',
    options: ['Adware', 'Keylogger', 'Rootkit', 'Proxy'],
    correctIndex: 2,
    explanation:
      'O Rootkit modifica componentes ou comandos do sistema operacional para manter o invasor invisível às ferramentas normais de verificação.',
  },
  {
    id: 'q7',
    topic: 'Criptografia',
    question:
      'Na criptografia assimétrica aplicada a uma Assinatura Digital, qual chave o remetente utiliza para assinar o hash do documento?',
    options: [
      'Sua própria Chave Privada',
      'A Chave Pública do destinatário',
      'Uma senha padrão (default)',
      'A comunidade SNMP public',
    ],
    correctIndex: 0,
    explanation:
      'O remetente assina o hash com sua Chave Privada (que só ele possui); qualquer pessoa confirma a assinatura usando a Chave Pública do remetente.',
  },
  {
    id: 'q8',
    topic: 'Anatomia de um Ataque',
    question:
      'Na sequência das 9 etapas de um ataque, qual etapa usa ferramentas como Nmap, ping e traceroute para descobrir hosts ativos e portas abertas?',
    options: ['Escalada de privilégios', 'Scanning (Varredura)', 'Ocultação de rastros', 'Denial of Service'],
    correctIndex: 1,
    explanation:
      'O Scanning (etapa 2) identifica sistemas ativos, portas TCP/UDP abertas, topologia e fingerprint do sistema operacional.',
  },
  {
    id: 'q9',
    topic: 'Defesas de Perímetro',
    question:
      'Qual equipamento/serviço atua como intermediário entre o navegador Web e a Internet, oferecendo cache de páginas frequentes e filtragem de conteúdo?',
    options: ['Servidor Proxy', 'Nobreak (UPS)', 'Keylogger', 'Cifra de César'],
    correctIndex: 0,
    explanation:
      'O Servidor Proxy intermedia o acesso Web dos usuários, acelerando páginas recorrentes via cache e filtrando conteúdos indesejados.',
  },
  {
    id: 'q10',
    topic: 'Gestão de Riscos & Segurança Física',
    question:
      'Segundo os princípios de Gestão de Riscos e Segurança Física, qual medida reduz diretamente o risco de indisponibilidade por queda de energia em um datacenter?',
    options: [
      'Usar senhas com apenas 4 dígitos',
      'Desabilitar os logs de auditoria',
      'Utilizar Nobreak (UPS) e grupo gerador de energia',
      'Guardar os backups em cima do servidor principal',
    ],
    correctIndex: 2,
    explanation:
      'Sistemas ininterruptos de força (Nobreak/UPS) e geradores mitigam diretamente a indisponibilidade causada por falhas na rede elétrica.',
  },
];

export const BIBLIOGRAPHY_REFS = {
  basic: [
    'BEAL, Adriana. Segurança da Informação. São Paulo: Atlas, 2005.',
    'GIL, Antonio de Loureiro. Auditoria de Computadores. 5. ed. São Paulo: Atlas, 2000.',
    'BURNETT, S.; PAINE, S. Criptografia e Segurança – O Guia Oficial RSA. Rio de Janeiro, 2002.',
    'CAMPOS, André. Sistema de Segurança da Informação: Controlando os Riscos. 3. ed. Florianópolis: Visual Books, 2014.',
    'FONTES, Edison. Políticas e Normas para Segurança da Informação. Rio de Janeiro: Brasport, 2012.',
    'STALLINGS, William. Criptografia e Segurança de Redes. 6. ed. São Paulo: Pearson, 2014.',
  ],
  complementary: [
    'CABRAL, Carlos; CAPRINO, Willian. Trilhas em Segurança da Informação. Rio de Janeiro: Brasport, 2015.',
    'IMONIANA, Joshua Onome. Auditoria de Sistemas de Informação. 3. ed. São Paulo: Atlas, 2016.',
    'KIM, David; SOLOMON, Michael G. Fundamentos de Segurança de Sistemas de Informação. Rio de Janeiro: LTC, 2014.',
    'MANOEL, Sergio da Silva. Governança de Segurança da Informação. Rio de Janeiro: Brasport, 2014.',
    'SÊMOLA, Marcos. Gestão da Segurança da Informação: Uma Visão Executiva. Rio de Janeiro: Elsevier, 2013.',
    'LENTO, Luis Otávio Botelho. Segurança da Informação: Livro Didático. 2. ed. Palhoça: UnisulVirtual, 2010.',
    'ABNT NBR ISO/IEC 17799 / 27001 / 27002 — Gestão de Segurança da Informação.',
  ],
};

export const DEFENSE_PILLAR_GUIDES: DefensePillarGuide[] = [
  {
    id: 'firewall',
    step: '01',
    title: 'Firewall & Controle de Perímetro',
    tagline: 'Filtra pacotes, isola segmentos (LAN/DMZ) e aplica o princípio deny-by-default',
    accent: 'cyan',
    coreRole:
      'Controla o que entra e o que sai de um host ou rede com base em endereços IP, portas TCP/UDP, estado da conexão e regras de aplicação.',
    howItWorks:
      'Todo pacote atravessa uma tabela ordenada de regras. A política segura padrão (deny-by-default) bloqueia qualquer tráfego de entrada não previsto e libera explicitamente apenas os serviços necessários (ex.: HTTPS 443 na DMZ e SSH 22 restrito à sub-rede administrativa).',
    mechanisms: [
      {
        name: 'Stateless (Filtro de Pacotes)',
        detail:
          'Avalia cada pacote isoladamente (IP origem/destino, porta e protocolo) sem lembrar se pertence a uma conexão já estabelecida.',
      },
      {
        name: 'Stateful (Inspeção de Estado)',
        detail:
          'Mantém uma tabela de sessões ativas (TCP handshake, estados NEW/ESTABLISHED) e só aceita respostas correspondentes a conexões válidas.',
      },
      {
        name: 'NGFW & WAF (Camada 7)',
        detail:
          'Inspeciona o conteúdo da aplicação (HTTP/HTTPS, DNS, SQL Injection e XSS), integrando controle de aplicativos e prevenção de intrusões.',
      },
      {
        name: 'Segmentação com DMZ',
        detail:
          'Separa servidores expostos à Internet (Web/E-mail na DMZ) da rede interna (LAN e bancos de dados), impedindo movimentação lateral direta.',
      },
    ],
    practicalExampleTitle: 'Regra real de hardening em servidor Linux (UFW)',
    practicalExample:
      'sudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw allow 443/tcp\nsudo ufw allow from 10.0.10.0/24 to any port 22 proto tcp\nsudo ufw enable',
    commonMistake:
      'Achar que abrir apenas a porta 80/443 garante segurança total: um firewall tradicional de camada 4 não bloqueia SQL Injection ou credenciais vazadas trafegando dentro de uma requisição HTTP permitida.',
  },
  {
    id: 'criptografia',
    step: '02',
    title: 'Criptografia & Proteção de Dados',
    tagline: 'Garante confidencialidade, integridade, autenticidade e não-repúdio em trânsito e em repouso',
    accent: 'emerald',
    coreRole:
      'Transforma dados legíveis (texto claro) em texto cifrado indecifrável sem a chave correta e cria provas matemáticas de autoria e integridade.',
    howItWorks:
      'Na prática moderna (como HTTPS/TLS), os dois modelos trabalham juntos: a criptografia assimétrica (RSA/ECC + certificado) autentica o servidor e negocia uma chave de sessão segura; em seguida, a criptografia simétrica (AES-GCM ou ChaCha20) protege o tráfego em alta velocidade.',
    mechanisms: [
      {
        name: 'Simétrica (AES-256 / ChaCha20)',
        detail:
          'Mesma chave secreta cifra e decifra. Altíssima performance para discos, backups e grandes volumes de tráfego.',
      },
      {
        name: 'Assimétrica (RSA / ECC)',
        detail:
          'Par de chaves (Pública + Privada). Resolve a troca segura de segredos em redes abertas e viabiliza certificados digitais.',
      },
      {
        name: 'Hash Criptográfico (SHA-256)',
        detail:
          'Função de mão única (não reversível) que gera uma impressão digital fixa. Qualquer 1 bit alterado muda completamente o hash.',
      },
      {
        name: 'Envelope & Assinatura Digital',
        detail:
          'Envelope une simétrica + assimétrica; Assinatura cifra o hash com a Chave Privada do autor para garantir integridade e não-repúdio.',
      },
    ],
    practicalExampleTitle: 'Fluxo resumido de uma conexão HTTPS (TLS)',
    practicalExample:
      '1. Servidor envia Certificado Digital (com Chave Pública assinada por CA)\n2. Cliente valida a CA e negocia chave de sessão (ECDHE / Assimétrica)\n3. Dados da página trafegam cifrados com AES-256-GCM (Simétrica)\n4. Integridade verificada em cada registro contra adulteração (MITM)',
    commonMistake:
      'Confundir codificação (Base64) ou Hash com criptografia reversível: Base64 não usa chave secreta e qualquer pessoa decodifica; já um hash SHA-256 serve para integridade e verificação de senhas (com salt/bcrypt), não para "descriptografar".',
  },
  {
    id: 'ids-ips',
    step: '03',
    title: 'IDS & IPS (Detecção e Prevenção)',
    tagline: 'Enxerga ataques passando por portas permitidas e reage com alerta (IDS) ou bloqueio inline (IPS)',
    accent: 'amber',
    coreRole:
      'Analisa profundamente o tráfego de rede ou os eventos do sistema operacional para identificar varreduras, exploits, força bruta e movimentação suspeita.',
    howItWorks:
      'O IDS (Intrusion Detection System) atua de forma passiva recebendo uma cópia do tráfego (porta SPAN/TAP) e dispara alertas ao time de segurança (SOC/SIEM). O IPS (Intrusion Prevention System) fica em linha (inline) no caminho dos pacotes, podendo descartar o pacote malicioso ou encerrar a sessão em milissegundos.',
    mechanisms: [
      {
        name: 'Detecção por Assinatura',
        detail:
          'Compara pacotes com um banco de padrões conhecidos de ataques (CVEs, payloads de SQLi, varreduras Nmap). Baixo falso positivo, mas não pega zero-day desconhecido.',
      },
      {
        name: 'Detecção por Anomalia',
        detail:
          'Aprende o comportamento normal da rede (baseline) e sinaliza desvios bruscos (ex.: servidor interno enviando 5 GB de madrugada). Detecta ataques novos, mas exige ajuste para evitar falsos positivos.',
      },
      {
        name: 'NIDS / NIPS (Baseado em Rede)',
        detail:
          'Monitora segmentos inteiros (borda, DMZ, LAN) inspecionando pacotes entre múltiplos hosts com ferramentas como Snort e Suricata.',
      },
      {
        name: 'HIDS / HIPS (Baseado em Host)',
        detail:
          'Roda dentro do servidor/estação monitorando logs, chamadas de sistema, processos suspeitos e alteração de arquivos críticos (ex.: Wazuh, OSSEC).',
      },
    ],
    practicalExampleTitle: 'Regra didática de detecção (estilo Snort/Suricata)',
    practicalExample:
      '# IDS (apenas alerta no log/SIEM)\nalert tcp any any -> $HOME_NET 22 (msg:"SSH Brute Force"; threshold:type both, track by_src, count 10, seconds 30; sid:10001;)\n\n# IPS (bloqueia/descarta o pacote em linha)\ndrop tcp any any -> $HOME_NET 80 (msg:"SQLi UNION SELECT"; content:"UNION SELECT"; nocase; sid:10002;)',
    commonMistake:
      'Ativar um IPS em modo bloqueio agressivo sem fase prévia de ajuste (tuning): um falso positivo em um IPS inline pode derrubar uma aplicação legítima inteira da escola ou empresa.',
  },
];

export const IDS_VS_IPS_COMPARISON: IdsVsIpsRow[] = [
  {
    criterion: 'Modo de atuação',
    ids: 'Passivo — apenas monitora, registra evidências e envia alertas',
    ips: 'Ativo — monitora e age automaticamente bloqueando a ameaça',
  },
  {
    criterion: 'Posicionamento na rede',
    ids: 'Fora do caminho principal (porta espelhada SPAN ou TAP de rede)',
    ips: 'Em linha (inline), diretamente no caminho entre origem e destino',
  },
  {
    criterion: 'Ação diante de um exploit',
    ids: 'Dispara alerta ao SOC/SIEM; o pacote original ainda chega ao alvo',
    ips: 'Descarta o pacote (DROP), envia TCP RST ou bloqueia o IP de origem',
  },
  {
    criterion: 'Impacto na latência',
    ids: 'Zero impacto na velocidade da rede (trabalha sobre cópia do tráfego)',
    ips: 'Pequena latência adicional, pois todo pacote precisa ser inspecionado antes de seguir',
  },
  {
    criterion: 'Risco de falso positivo',
    ids: 'Baixo impacto operacional (gera alerta extra para o analista revisar)',
    ips: 'Alto impacto operacional (pode bloquear tráfego legítimo se mal calibrado)',
  },
  {
    criterion: 'Exemplos de ferramentas',
    ids: 'Snort (modo IDS), Suricata (modo IDS), Zeek, Wazuh (HIDS)',
    ips: 'Suricata/Snort em modo inline, NGFW com IPS integrado, Fail2Ban/HIPS',
  },
];

export const DEFENSE_THEORY_MISSIONS: DefenseTheoryMission[] = [
  {
    id: 'D01',
    order: 1,
    pillar: 'firewall',
    pillarLabel: 'Firewall & Perímetro',
    title: 'Guardião de Perímetro (Firewall)',
    briefing:
      'Analise cenários reais de filtragem de pacotes, política deny-by-default e segmentação DMZ/LAN para provar domínio sobre Firewalls.',
    badgeId: 'badge-firewall',
    badgeTitle: 'Guardião de Firewall',
    badgeSubtitle: 'Domínio em regras stateful, deny-by-default e segmentação DMZ',
    badgeCode: 'BADGE{firewall_deny_default}',
    badgePoints: 150,
    badgePalette: 'cyan',
    accent: 'cyan',
    questions: [
      {
        id: 'd01-q1',
        scenario:
          'Um servidor Web Linux em produção precisa receber acessos HTTPS (porta 443) da Internet e SSH (porta 22) somente da sub-rede administrativa 10.0.10.0/24.',
        question:
          'Qual política padrão de entrada (incoming) segue as boas práticas de hardening em um firewall?',
        options: [
          'Allow-by-default: liberar todas as portas e bloquear apenas a porta 23 (Telnet)',
          'Deny-by-default: bloquear toda entrada por padrão e criar exceções explícitas apenas para TCP 443 e TCP 22 vindo de 10.0.10.0/24',
          'Desativar o firewall do servidor e confiar apenas na senha do usuário root',
          'Liberar todas as portas UDP e restringir somente o protocolo ICMP (ping)',
        ],
        correctIndex: 1,
        explanation:
          'O princípio deny-by-default reduz a superfície de ataque ao mínimo: tudo entra bloqueado, e apenas portas e origens estritamente autorizadas recebem permissão explícita.',
      },
      {
        id: 'd01-q2',
        scenario:
          'Você está comparando um roteador com ACL simples (Stateless) e um Firewall Stateful na borda da rede escolar.',
        question:
          'Qual é a principal vantagem do Firewall Stateful sobre a filtragem puramente Stateless?',
        options: [
          'O Stateful acompanha o estado das conexões ativas (tabela de sessões) e valida se o pacote pertence a uma sessão legítima já estabelecida',
          'O Stateful substitui totalmente a necessidade de criptografia TLS/HTTPS',
          'O Stateful funciona apenas em redes sem fio Wi-Fi e ignora cabos Ethernet',
          'O Stateless bloqueia automaticamente vírus dentro de anexos de e-mail',
        ],
        correctIndex: 0,
        explanation:
          'Firewalls Stateful mantêm uma tabela de estado das conexões (ex.: handshake TCP), impedindo pacotes forjados ou respostas inesperadas fora de uma sessão válida.',
      },
      {
        id: 'd01-q3',
        scenario:
          'A equipe vai publicar um portal de notas acessível pela Internet que consulta um banco de dados interno sensível.',
        question:
          'Onde o servidor Web público deve ser posicionado na arquitetura de firewall para proteger a rede interna (LAN)?',
        options: [
          'Diretamente na mesma VLAN dos computadores da secretaria e do banco de dados, sem firewall entre eles',
          'Em uma DMZ (Zona Desmilitarizada) isolada por firewall, permitindo que a Internet fale com o Web na DMZ sem acesso direto ao banco na LAN',
          'Fora de qualquer controle de firewall para evitar aumento de latência',
          'Apenas em um computador doméstico conectado via proxy aberto',
        ],
        correctIndex: 1,
        explanation:
          'A DMZ atua como zona amortecedora: mesmo que o servidor Web exposto seja comprometido, o firewall interno bloqueia o acesso direto aos servidores críticos da LAN.',
      },
    ],
  },
  {
    id: 'D02',
    order: 2,
    pillar: 'criptografia',
    pillarLabel: 'Criptografia Aplicada',
    title: 'Arquiteto da Criptografia',
    briefing:
      'Escolha os mecanismos criptográficos corretos (simétrica, assimétrica, hash, assinatura e TLS) para proteger dados em trânsito e comprovar autoria.',
    badgeId: 'badge-crypto',
    badgeTitle: 'Arquiteto Criptográfico',
    badgeSubtitle: 'Domínio em AES, RSA/ECC, Envelope Digital, Hash e Assinatura Digital',
    badgeCode: 'BADGE{cripto_tls_assinatura}',
    badgePoints: 150,
    badgePalette: 'emerald',
    accent: 'emerald',
    questions: [
      {
        id: 'd02-q1',
        scenario:
          'Uma conexão HTTPS (TLS) precisa transferir 200 MB de arquivos rapidamente após estabelecer comunicação segura com um servidor na Internet.',
        question:
          'Como o TLS (e o conceito de Envelope Digital) resolve o dilema entre segurança na troca de chaves e alta velocidade?',
        options: [
          'Usa criptografia assimétrica para cifrar todos os 200 MB porque ela é muito mais rápida que a simétrica',
          'Usa criptografia assimétrica para autenticar e trocar/negociar uma chave de sessão, e criptografia simétrica (ex.: AES) para cifrar o volume de dados',
          'Usa Base64 para proteger o tráfego porque ocupa menos processamento',
          'Envia a chave secreta AES em texto claro antes do primeiro pacote HTTP',
        ],
        correctIndex: 1,
        explanation:
          'A criptografia híbrida combina o melhor dos dois mundos: assimétrica (RSA/ECDHE) para troca segura de chave sem segredo prévio e simétrica (AES/ChaCha20) para velocidade no tráfego.',
      },
      {
        id: 'd02-q2',
        scenario:
          'A direção precisa enviar um edital oficial em PDF garantindo que nenhum aluno possa alterá-lo sem detecção e que a escola não possa negar ter emitido o documento.',
        question:
          'Como funciona a Assinatura Digital para garantir integridade, autenticidade e não-repúdio?',
        options: [
          'Calcula-se o hash do arquivo e cifra-se esse hash com a Chave Privada do remetente; qualquer pessoa verifica com a Chave Pública do remetente',
          'Cifra-se o arquivo inteiro com a Chave Pública de quem vai ler e não se usa hash',
          'Compacta-se o arquivo em ZIP com senha simples compartilhada por e-mail',
          'Aplica-se apenas o algoritmo Base64 ao rodapé do PDF',
        ],
        correctIndex: 0,
        explanation:
          'Somente o dono da Chave Privada consegue assinar o hash. Se 1 bit do documento mudar, o hash recalculado não bate ao validar com a Chave Pública — garantindo integridade, autenticidade e não-repúdio.',
      },
      {
        id: 'd02-q3',
        scenario:
          'Um desenvolvedor júnior sugere armazenar as senhas dos alunos no banco de dados usando Base64 para economizar CPU.',
        question:
          'Por que essa decisão é uma falha grave e qual é a prática criptográfica correta para senhas?',
        options: [
          'Base64 só funciona em sistemas Linux; deveria usar Cifra de César com deslocamento 3',
          'Base64 é apenas codificação (reversível sem chave); senhas devem ser armazenadas com função de Hash segura + salt (como Argon2 ou bcrypt)',
          'Base64 não aceita caracteres numéricos; deveria gravar em texto claro dentro do firewall',
          'Não há problema em usar Base64 desde que o site tenha certificado SSL',
        ],
        correctIndex: 1,
        explanation:
          'Base64 não oferece nenhuma confidencialidade — qualquer pessoa decodifica instantaneamente. Senhas devem usar hashes lentos com salt (Argon2/bcrypt) para resistir a vazamentos.',
      },
    ],
  },
  {
    id: 'D03',
    order: 3,
    pillar: 'ids-ips',
    pillarLabel: 'IDS & IPS',
    title: 'Sentinela de Intrusão (IDS vs. IPS)',
    briefing:
      'Diferencie sensores passivos (IDS) de bloqueio ativo inline (IPS), métodos de detecção e o impacto operacional de falsos positivos.',
    badgeId: 'badge-ids-ips',
    badgeTitle: 'Sentinela IDS/IPS',
    badgeSubtitle: 'Domínio em detecção passiva, bloqueio inline, assinaturas e anomalias',
    badgeCode: 'BADGE{ids_ips_inline_guard}',
    badgePoints: 150,
    badgePalette: 'cyan',
    accent: 'amber',
    questions: [
      {
        id: 'd03-q1',
        scenario:
          'A rede sofreu uma tentativa de exploração SQL Injection pela porta 443 (permitida pelo firewall). A equipe quer uma camada capaz de bloquear automaticamente o pacote malicioso antes que ele atinja o servidor Web.',
        question:
          'Qual solução e posicionamento atendem diretamente a esse requisito?',
        options: [
          'Um IDS conectado em porta espelhada (SPAN), pois ele descarta pacotes em linha sem tocar na rede',
          'Um IPS posicionado inline (em linha) no caminho do tráfego, capaz de inspecionar e descartar (DROP) o pacote malicioso em tempo real',
          'Um servidor DNS secundário com cache estático',
          'Apenas um comando ping contínuo monitorando a latência do switch',
        ],
        correctIndex: 1,
        explanation:
          'O IDS é passivo (apenas alerta sobre uma cópia do tráfego). Para impedir ativamente que o exploit chegue ao servidor, é necessário um IPS posicionado inline.',
      },
      {
        id: 'd03-q2',
        scenario:
          'Um malware inédito (zero-day) começa a exfiltrar 4 GB de dados às 03h da manhã de um servidor que normalmente envia apenas 20 MB nesse horário.',
        question:
          'Qual técnica de detecção de IDS/IPS tem maior chance de identificar esse comportamento desconhecido?',
        options: [
          'Detecção baseada apenas em assinaturas fixas de vírus de 2018',
          'Detecção baseada em anomalias, que compara o tráfego atual com o perfil normal (baseline) da rede',
          'Filtro de pacotes stateless olhando apenas o endereço MAC do switch',
          'Desabilitar os logs do servidor para reduzir o tráfego de rede',
        ],
        correctIndex: 1,
        explanation:
          'Assinaturas só detectam ataques já catalogados. A detecção por anomalias identifica desvios comportamentais (como picos noturnos atípicos), sendo essencial contra zero-days.',
      },
      {
        id: 'd03-q3',
        scenario:
          'Após ativar um novo IPS em modo de bloqueio agressivo sem período de observação, vários alunos legítimos perdem acesso ao sistema acadêmico durante a prova.',
        question:
          'Qual fenômeno ocorreu e qual é a boa prática recomendada ao implantar um IPS?',
        options: [
          'Ocorreu um Falso Positivo bloqueando tráfego legítimo; a boa prática é iniciar em modo IDS (detecção/ajuste de regras) antes de habilitar bloqueio inline',
          'Ocorreu um ataque de engenharia social; deve-se desligar o TLS do servidor',
          'Ocorreu falta de espaço em disco; basta trocar o cabo UTP por coaxial',
          'O IPS funcionou corretamente, pois todo acesso durante provas deve ser bloqueado',
        ],
        correctIndex: 0,
        explanation:
          'Falsos positivos em um IPS inline causam indisponibilidade real. Por isso, times Blue Team fazem tuning das regras primeiro em modo passivo (IDS) antes de ativar bloqueios críticos.',
      },
    ],
  },
  {
    id: 'D04',
    order: 4,
    pillar: 'integracao',
    pillarLabel: 'Defesa em Profundidade',
    title: 'Estrategista Blue Team (Integração)',
    briefing:
      'Combine Firewall, Criptografia e IDS/IPS em incidentes integrados de Defesa em Profundidade para conquistar a insígnia máxima do módulo.',
    badgeId: 'badge-defense-depth',
    badgeTitle: 'Estrategista Blue Team',
    badgeSubtitle: 'Arquitetura completa integrando Firewall, Criptografia e IDS/IPS',
    badgeCode: 'BADGE{defesa_em_profundidade}',
    badgePoints: 200,
    badgePalette: 'crimson',
    accent: 'rose',
    questions: [
      {
        id: 'd04-q1',
        scenario:
          'Na rede Wi-Fi de um laboratório, um atacante passivo captura pacotes (sniffing) tentando roubar senhas enviadas para um portal interno.',
        question:
          'Qual controle impede diretamente que o atacante leia as credenciais capturadas no meio físico/rede?',
        options: [
          'Apenas fechar a porta 21 no firewall de borda',
          'Criptografia em trânsito (HTTPS/TLS + Wi-Fi WPA2/WPA3), garantindo confidencialidade mesmo se o tráfego for interceptado',
          'Instalar um nobreak (UPS) no rack principal',
          'Usar um IDS passivo sem criptografia, pois o IDS esconde senhas em texto claro',
        ],
        correctIndex: 1,
        explanation:
          'Contra ataques passivos de interceptação (sniffing), a defesa primordial é a criptografia em trânsito (TLS/HTTPS e WPA2/WPA3), tornando os dados capturados ilegíveis.',
      },
      {
        id: 'd04-q2',
        scenario:
          'Um atacante externo tenta realizar 500 tentativas de login SSH por minuto em um servidor de laboratório que precisava ficar acessível para manutenção.',
        question:
          'Qual combinação de controles representa melhor a Defesa em Profundidade (camadas complementares)?',
        options: [
          'Apenas ocultar o banner do SSH e manter senha padrão de 4 dígitos',
          'Firewall restringindo origem da porta 22 + autenticação por chave criptográfica SSH (assimétrica) + IPS/Fail2Ban bloqueando IPs após falhas repetidas',
          'Liberar SSH para 0.0.0.0/0 e remover os logs de /var/log/auth.log',
          'Substituir SSH por Telnet para facilitar o monitoramento no IDS',
        ],
        correctIndex: 1,
        explanation:
          'Defesa em profundidade sobrepõe barreiras independentes: Firewall reduz quem alcança a porta, Criptografia (chaves SSH) elimina senhas fracas e IPS/Fail2Ban contém a força bruta.',
      },
      {
        id: 'd04-q3',
        scenario:
          'Mesmo com firewall bem configurado e HTTPS ativo, um usuário interno executa um Trojan que abre uma conexão reversa suspeita para fora da rede.',
        question:
          'Por que o Firewall sozinho não impediu o incidente e como o IDS/IPS + segmentação ajudam na resposta?',
        options: [
          'Porque o firewall bloqueia conexões de saída por padrão em todos os sistemas domésticos',
          'Porque a conexão iniciou de dentro para fora em porta comum (ex.: 443); o IDS/IPS (ou HIDS) detecta o padrão anômalo/C2 e alerta/bloqueia a comunicação enquanto a segmentação limita o alcance',
          'Porque criptografia HTTPS desativa o funcionamento de todos os firewalls',
          'Porque Trojans só podem ser bloqueados trocando o sistema de cabos para fibra óptica',
        ],
        correctIndex: 1,
        explanation:
          'Nenhuma camada isolada é infalível: firewalls de perímetro frequentemente liberam saída na porta 443. Monitoramento IDS/HIDS, controle de saída e segmentação detectam e contêm o comprometimento.',
      },
    ],
  },
];
