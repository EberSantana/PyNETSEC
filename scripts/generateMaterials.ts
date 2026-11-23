import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import PptxGenJS from 'pptxgenjs';

import { CIRCUITS, MISSIONS } from '../src/data/missions';
import { STUDY_LESSONS } from '../src/data/studyLessons';
import {
  EVERYDAY_PROTOCOLS,
  NETWORK_TOPOLOGIES,
  NETWORK_TYPES,
  TRANSMISSION_MEDIA,
} from '../src/data/networkFundamentals';
import { PROTOCOL_LESSON } from '../src/data/lessons/protocolos';
import { PACKET_TRACER_PRESETS } from '../src/data/packetTracerPresets';
import {
  LINUX_COMMAND_CATEGORIES,
  LINUX_FHS_DIRECTORIES,
} from '../src/data/linuxCheatsheet';
import {
  DEFENSE_PILLAR_GUIDES,
  DEFENSE_THEORY_MISSIONS,
  IDS_VS_IPS_COMPARISON,
  TRIAD_PILLARS,
} from '../src/data/infoSecData';
import {
  COURSE_OVERVIEW,
  EVALUATION_RUBRIC,
  TEACHER_LESSON_PLANS,
} from '../src/data/teachingGuideData';

const OUT_DIR = path.resolve(process.cwd(), 'public/materiais');

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Normalize non-WinAnsi Unicode symbols so PDFKit standard Helvetica renders cleanly with Portuguese accents. */
function pdfSafe(input: string): string {
  return input
    .replace(/\u2192/g, '->')
    .replace(/\u2190/g, '<-')
    .replace(/\u2194/g, '<->')
    .replace(/\u2713|\u2714/g, '[OK]')
    .replace(/\u2717|\u2718/g, '[X]')
    .replace(/\u2022/g, '-')
    .replace(/\u25CF/g, '*')
    .replace(/\u2014/g, ' - ')
    .replace(/\u2013/g, '-')
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u00D7/g, 'x')
    .replace(/\u00B7/g, ' | ')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');
}

// ============================================================================
// SHARED DOCX HELPERS
// ============================================================================

const COLORS = {
  navy: '0F172A',
  slate: '334155',
  muted: '64748B',
  cyan: '0891B2',
  cyanLight: 'ECFEFF',
  emerald: '059669',
  emeraldLight: 'ECFDF5',
  amber: 'B45309',
  amberLight: 'FFFBEB',
  border: 'CBD5E1',
  codeBg: 'F1F5F9',
  headerBg: '0F172A',
  stripeBg: 'F8FAFC',
};

function docxH1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 140 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: COLORS.cyan },
    },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32,
        color: COLORS.navy,
        font: 'Calibri',
      }),
    ],
  });
}

function docxH2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 25,
        color: COLORS.cyan,
        font: 'Calibri',
      }),
    ],
  });
}

function docxH3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22,
        color: COLORS.navy,
        font: 'Calibri',
      }),
    ],
  });
}

function docxP(text: string, opts?: { boldPrefix?: string; italic?: boolean; color?: string }): Paragraph {
  const runs: TextRun[] = [];
  if (opts?.boldPrefix) {
    runs.push(
      new TextRun({
        text: opts.boldPrefix,
        bold: true,
        size: 21,
        color: COLORS.navy,
        font: 'Calibri',
      })
    );
  }
  runs.push(
    new TextRun({
      text,
      italics: opts?.italic,
      size: 21,
      color: opts?.color ?? COLORS.slate,
      font: 'Calibri',
    })
  );
  return new Paragraph({
    spacing: { after: 110, line: 276 },
    children: runs,
  });
}

function docxBullet(text: string, boldPrefix?: string): Paragraph {
  const runs: TextRun[] = [];
  if (boldPrefix) {
    runs.push(
      new TextRun({
        text: boldPrefix,
        bold: true,
        size: 20,
        color: COLORS.navy,
        font: 'Calibri',
      })
    );
  }
  runs.push(
    new TextRun({
      text,
      size: 20,
      color: COLORS.slate,
      font: 'Calibri',
    })
  );
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 70, line: 260 },
    children: runs,
  });
}

function docxCallout(title: string, body: string, fill = COLORS.cyanLight, accent = COLORS.cyan): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: accent },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: accent },
              left: { style: BorderStyle.SINGLE, size: 18, color: accent },
              right: { style: BorderStyle.SINGLE, size: 4, color: accent },
            },
            margins: { top: 120, bottom: 120, left: 180, right: 160 },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: title, bold: true, size: 21, color: accent, font: 'Calibri' }),
                ],
              }),
              new Paragraph({
                spacing: { after: 0, line: 260 },
                children: [
                  new TextRun({ text: body, size: 20, color: COLORS.navy, font: 'Calibri' }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function docxCodeBlock(code: string): Table {
  const lines = code.split('\n');
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: COLORS.codeBg },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
              left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
              right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
            },
            margins: { top: 100, bottom: 100, left: 160, right: 160 },
            children: lines.map(
              (line) =>
                new Paragraph({
                  spacing: { after: 20, line: 230 },
                  children: [
                    new TextRun({
                      text: line || ' ',
                      font: 'Consolas',
                      size: 18,
                      color: COLORS.navy,
                    }),
                  ],
                })
            ),
          }),
        ],
      }),
    ],
  });
}

function docxTable(headers: string[], rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(
          (h) =>
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: COLORS.headerBg },
              margins: { top: 90, bottom: 90, left: 110, right: 110 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: h, bold: true, size: 19, color: 'FFFFFF', font: 'Calibri' }),
                  ],
                }),
              ],
            })
        ),
      }),
      ...rows.map(
        (row, rIdx) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  shading:
                    rIdx % 2 === 1
                      ? { type: ShadingType.CLEAR, fill: COLORS.stripeBg }
                      : undefined,
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
                    bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
                    left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
                    right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
                  },
                  margins: { top: 75, bottom: 75, left: 105, right: 105 },
                  children: [
                    new Paragraph({
                      spacing: { after: 0, line: 240 },
                      children: [
                        new TextRun({
                          text: cell,
                          size: 18,
                          color: COLORS.slate,
                          font: 'Calibri',
                        }),
                      ],
                    }),
                  ],
                })
            ),
          })
      ),
    ],
  });
}

function docxCover(kicker: string, title: string, subtitle: string, metaLines: string[]): (Paragraph | Table)[] {
  return [
    new Paragraph({ spacing: { before: 1200, after: 160 } }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: kicker.toUpperCase(),
          bold: true,
          size: 22,
          color: COLORS.cyan,
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 56,
          color: COLORS.navy,
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 500 },
      children: [
        new TextRun({
          text: subtitle,
          size: 26,
          color: COLORS.muted,
          font: 'Calibri',
        }),
      ],
    }),
    docxCallout(
      'Ficha Técnica do Material',
      metaLines.join('\n'),
      COLORS.cyanLight,
      COLORS.cyan
    ),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

// ============================================================================
// 1. GENERATE STUDENT E-BOOK (DOCX)
// ============================================================================

async function generateStudentDocx() {
  const children: (Paragraph | Table)[] = [];

  children.push(
    ...docxCover(
      'PyNetSec · Ensino Médio Técnico',
      'E-book do Aluno: Python, Redes, Packet Tracer, Linux e Segurança da Informação',
      'Apostila prática integrada ao ambiente interativo PyNetSec — Estude a teoria, monte topologias e conquiste as 50 missões CTF.',
      [
        `Público-alvo: ${COURSE_OVERVIEW.level}`,
        `Carga Horária Sugerida: ${COURSE_OVERVIEW.totalHours}`,
        'Ambiente Integrado: Centro de Estudos (4 Pilares) + Simulador Packet Tracer + Sandbox Python + Terminal Linux + 50 Missões CTF',
        'Edição: 2026 · Material Didático Livre para Sala de Aula e Estudo Individual',
      ]
    )
  );

  // Sumário
  children.push(docxH1('Sumário do E-book do Aluno'));
  [
    'Capítulo 1 — Como Estudar com o PyNetSec (Fluxo Estudar -> Trilha -> Laboratório)',
    'Capítulo 2 — Python Prático para Redes e Segurança (Comandos e Exemplos)',
    'Capítulo 3 — Fundamentos de Redes, Topologias, Meios e Protocolos Cotidianos',
    'Capítulo 4 — Camada de Transporte: TCP vs. UDP, Handshake e Portas',
    'Capítulo 5 — Laboratório Packet Tracer, Configuração LAN Linux e Troubleshooting',
    'Capítulo 6 — Segurança da Informação, Tríade CID, Firewall, Criptografia e IDS/IPS',
    'Capítulo 7 — Linux Essencial (FHS e Comandos) + Mapa da Trilha das 50 Missões',
  ].forEach((s) => children.push(docxBullet(s)));

  // CAPÍTULO 1
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(docxH1('Capítulo 1 — Como Estudar com o PyNetSec'));
  children.push(
    docxP(
      'O PyNetSec foi desenhado para transformar teoria de tecnologia em prática imediata no navegador. Você não precisa instalar nada para programar em Python 3, simular redes no estilo Packet Tracer, testar comandos Linux ou resolver desafios de Segurança da Informação.'
    )
  );
  children.push(
    docxCallout(
      'Regra de Ouro do Estudo Fluido (3 Passos)',
      '1. ESTUDAR: Leia o guia rápido e faça os 3 treinos curtos ou simuladores visuais.\n2. TRILHA CTF: Escolha a missão do circuito correspondente (cada missão leva ~15 minutos).\n3. LABORATÓRIO: Escreva seu código ou monte sua rede no Packet Tracer e valide sua conquista!',
      COLORS.cyanLight,
      COLORS.cyan
    )
  );
  children.push(docxH2('Os 5 Circuitos da Trilha PyNetSec'));
  children.push(
    docxTable(
      ['Circuito', 'Título', 'Escopo', 'Missões'],
      CIRCUITS.map((c) => [c.code, c.title, c.description, String(c.missionCount)])
    )
  );

  // CAPÍTULO 2
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(docxH1('Capítulo 2 — Python Prático para Redes e Segurança'));
  children.push(
    docxP(
      'Python é uma das linguagens mais utilizadas por administradores de redes e analistas de segurança por sua sintaxe limpa e bibliotecas prontas (como ipaddress, base64 e hashlib). Abaixo está o guia consolidado de todas as aulas do Pilar 01.'
    )
  );

  for (const lesson of STUDY_LESSONS) {
    children.push(docxH2(`Aula ${String(lesson.order).padStart(2, '0')} — ${lesson.title}`));
    children.push(docxP(lesson.subtitle, { italic: true, color: COLORS.muted }));
    for (const p of lesson.intro) {
      children.push(docxP(p));
    }
    if (lesson.commandTable.length > 0) {
      children.push(
        docxTable(
          ['Comando / Sintaxe', 'O que faz', 'Exemplo prático'],
          lesson.commandTable.map((r) => [r.command, r.meaning, r.example])
        )
      );
      children.push(new Paragraph({ spacing: { after: 100 } }));
    }
    if (lesson.sandboxExamples[0]) {
      children.push(docxP(`Exemplo de código (${lesson.sandboxExamples[0].label}):`, { boldPrefix: '' }));
      children.push(docxCodeBlock(lesson.sandboxExamples[0].code));
    }
  }

  // CAPÍTULO 3
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(docxH1('Capítulo 3 — Fundamentos de Redes, Topologias e Meios'));
  children.push(docxH2('3.1 Tipos de Rede por Abrangência'));
  children.push(
    docxTable(
      ['Sigla', 'Nome', 'Alcance', 'Exemplo Real'],
      NETWORK_TYPES.map((t) => [t.acronym, `${t.fullName} (${t.ptName})`, t.rangeLabel, t.examples])
    )
  );

  children.push(docxH2('3.2 Topologias de Rede e Impacto de Falhas'));
  children.push(
    docxTable(
      ['Topologia', 'Como funciona', 'O que ocorre se um cabo romper'],
      NETWORK_TOPOLOGIES.map((t) => [t.name, t.description, t.faultTip])
    )
  );

  children.push(docxH2('3.3 Meios de Transmissão'));
  children.push(
    docxTable(
      ['Meio', 'Conector / Alcance', 'Características e Exemplos'],
      TRANSMISSION_MEDIA.map((m) => [
        m.name,
        `${m.connectorOrBand} · ${m.typicalRange}`,
        `${m.description} Ex.: ${m.examples}`,
      ])
    )
  );

  children.push(docxH2('3.4 Protocolos do Cotidiano'));
  children.push(
    docxTable(
      ['Protocolo', 'Porta / Camada', 'Função Prática'],
      EVERYDAY_PROTOCOLS.map((p) => [p.name, p.portOrLayer, `${p.fullName}: ${p.description}`])
    )
  );

  // CAPÍTULO 4
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(docxH1('Capítulo 4 — Camada de Transporte: TCP vs. UDP'));
  PROTOCOL_LESSON.overviewParagraphs.forEach((p) => children.push(docxP(p)));
  children.push(
    docxCallout(
      'Resumo de Ouro: Confiabilidade vs. Velocidade',
      `TCP (${PROTOCOL_LESSON.tcp.headerSize}): ${PROTOCOL_LESSON.tcp.summary}\nUDP (${PROTOCOL_LESSON.udp.headerSize}): ${PROTOCOL_LESSON.udp.summary}`,
      COLORS.emeraldLight,
      COLORS.emerald
    )
  );
  children.push(docxH2('4.1 Comparativo Direto TCP × UDP'));
  children.push(
    docxTable(
      ['Critério', 'TCP (Confiável)', 'UDP (Rápido / Direto)'],
      PROTOCOL_LESSON.comparisonRows.map((row) => [row.criterion, row.tcp, row.udp])
    )
  );

  children.push(docxH2('4.2 Three-Way Handshake (TCP) vs. Envio Direto (UDP)'));
  children.push(docxH3('Etapas do TCP'));
  PROTOCOL_LESSON.tcp.howItWorks.forEach((s) =>
    children.push(docxBullet(s.detail, `${s.step} · ${s.label}: `))
  );
  children.push(docxH3('Etapas do UDP'));
  PROTOCOL_LESSON.udp.howItWorks.forEach((s) =>
    children.push(docxBullet(s.detail, `${s.step} · ${s.label}: `))
  );

  children.push(docxH2('4.3 Casos de Uso Reais'));
  children.push(
    docxTable(
      ['Aplicação', 'Protocolo', 'Portas', 'Por que usa esse protocolo?'],
      PROTOCOL_LESSON.useCases.map((u) => [u.service, u.protocol, u.ports, u.whyItFits])
    )
  );

  // CAPÍTULO 5
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(docxH1('Capítulo 5 — Packet Tracer, LAN no Linux e Troubleshooting'));
  children.push(
    docxP(
      'No PyNetSec você possui um simulador estilo Packet Tracer onde pode arrastar PCs, Notebooks, Switches, Roteadores, Servidores e Access Points, conectar cabos, derrubar links e executar comandos de rede vendo os quadros ARP, ICMP, DHCP, DNS, TCP e HTTP viajarem ao vivo.'
    )
  );
  children.push(docxH2('5.1 Ambientes Prontos no Packet Tracer PyNetSec'));
  children.push(
    docxTable(
      ['Ambiente', 'Tipo de Rede', 'Sub-rede', 'Atividade Prática'],
      PACKET_TRACER_PRESETS.map((p) => [p.title, p.networkType, p.subtitle, p.objective])
    )
  );

  children.push(docxH2('5.2 Guia Passo a Passo: Configurando uma LAN no Linux'));
  children.push(
    docxTable(
      ['Passo', 'Ferramenta Moderna (ip)', 'Ferramenta Clássica (ifconfig)', 'Objetivo'],
      [
        ['1. Ver e subir placa', 'ip link show && sudo ip link set eth0 up', 'ifconfig -a && sudo ifconfig eth0 up', 'Ativar interface física (Camada 1/2)'],
        ['2A. IP via DHCP', 'sudo dhclient -v eth0', 'sudo dhclient -v eth0', 'Receber IP, máscara, gateway e DNS automaticamente (DORA)'],
        ['2B. IP Estático', 'sudo ip addr add 192.168.10.25/24 dev eth0', 'sudo ifconfig eth0 192.168.10.25 netmask 255.255.255.0', 'Configurar endereço IPv4 fixo manualmente'],
        ['3. Gateway Padrão', 'sudo ip route add default via 192.168.10.1', 'sudo route add default gw 192.168.10.1', 'Definir rota de saída para outras redes / Internet'],
        ['4. Servidor DNS', 'echo "nameserver 10.0.0.20" | sudo tee /etc/resolv.conf', 'echo "nameserver 10.0.0.20" | sudo tee /etc/resolv.conf', 'Traduzir nomes de domínio em endereços IP'],
        ['5. Validar Rede', 'ip neigh && ping -c 3 192.168.10.1 && ss -tulnp', 'arp -a && ping -c 3 192.168.10.1 && netstat -tulnp', 'Conferir tabela ARP, gateway e portas abertas'],
      ]
    )
  );

  children.push(docxH2('5.3 Check-list de Diagnóstico de Conectividade (L1 até L7)'));
  [
    '1. Camada 1/2 — Interface UP: Rode "ip link show" e confirme estado UP e cabo conectado.',
    '2. Camada 3 — IP e Máscara: Rode "ip addr" e confira se o IP pertence à mesma sub-rede do Gateway.',
    '3. Pilha Local — Loopback: Rode "ping 127.0.0.1" para provar que o TCP/IP do sistema está saudável.',
    '4. Gateway + ARP: Rode "ping <gateway>" e depois "ip neigh" ou "arp -a" para validar a LAN.',
    '5. Roteamento Externo: Rode "ping 8.8.8.8" ou "traceroute <destino>" para validar saída pelo roteador.',
    '6. Aplicação / DNS: Rode "nslookup portal.escola.local" ou "curl <domínio>" para testar resolução de nomes e HTTP.',
  ].forEach((item) => children.push(docxBullet(item)));

  // CAPÍTULO 6
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(docxH1('Capítulo 6 — Segurança da Informação e Defesa em Profundidade'));
  children.push(docxH2('6.1 A Tríade CID'));
  children.push(
    docxTable(
      ['Pilar', 'Definição', 'Controles de Proteção', 'Exemplo de Ameaça'],
      TRIAD_PILLARS.map((p) => [p.title, p.definition, p.controls.join('; '), p.threatExample])
    )
  );

  children.push(docxH2('6.2 Pilares Práticos de Defesa (Firewall, Criptografia, IDS/IPS)'));
  for (const guide of DEFENSE_PILLAR_GUIDES) {
    children.push(docxH3(`${guide.title} — ${guide.tagline}`));
    children.push(docxP(guide.coreRole));
    children.push(docxP(guide.howItWorks));
    guide.mechanisms.forEach((m) => children.push(docxBullet(m.detail, `${m.name}: `)));
    children.push(docxP(guide.practicalExample, { boldPrefix: `${guide.practicalExampleTitle}: ` }));
  }

  children.push(docxH2('6.3 Comparativo IDS × IPS'));
  children.push(
    docxTable(
      ['Critério', 'IDS (Detecção)', 'IPS (Prevenção)'],
      IDS_VS_IPS_COMPARISON.map((r) => [r.criterion, r.ids, r.ips])
    )
  );

  // CAPÍTULO 7
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(docxH1('Capítulo 7 — Linux Essencial e Mapa das 50 Missões'));
  children.push(docxH2('7.1 Árvore de Diretórios FHS do Linux'));
  children.push(
    docxTable(
      ['Diretório', 'Rótulo', 'Finalidade no Sistema'],
      LINUX_FHS_DIRECTORIES.map((d) => [d.path, d.label, d.description])
    )
  );

  children.push(docxH2('7.2 Comandos Essenciais de Terminal Linux'));
  const linuxRows: string[][] = [];
  for (const cat of LINUX_COMMAND_CATEGORIES) {
    for (const cmd of cat.commands) {
      linuxRows.push([cat.title, cmd.cmd, cmd.desc, cmd.runnable ?? cmd.cmd]);
    }
  }
  children.push(docxTable(['Categoria', 'Comando', 'Descrição', 'Exemplo'], linuxRows));

  children.push(docxH2('7.3 Checklist de Progresso — Suas 50 Missões CTF'));
  children.push(
    docxP(
      'Marque cada missão conforme você capturar sua Flag no Laboratório PyNetSec (sem spoilers nesta apostila do aluno!):'
    )
  );
  children.push(
    docxTable(
      ['ID', 'Circuito', 'Título da Missão', 'Tópico', 'XP', 'Concluída'],
      MISSIONS.map((m) => [m.id, `C0${m.circuit}`, m.title, m.topic, `${m.points}`, '[  ]'])
    )
  );

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 21, color: COLORS.slate },
        },
      },
    },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'PyNetSec · E-book do Aluno (Ensino Médio Técnico)',
                    size: 17,
                    color: COLORS.muted,
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Página ', size: 17, color: COLORS.muted, font: 'Calibri' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 17, color: COLORS.muted }),
                  new TextRun({ text: ' de ', size: 17, color: COLORS.muted, font: 'Calibri' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 17, color: COLORS.muted }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT_DIR, 'PyNetSec_Ebook_Aluno.docx'), buffer);
}

// ============================================================================
// 2. GENERATE TEACHER E-BOOK & LESSON GUIDE (DOCX)
// ============================================================================

async function generateTeacherDocx() {
  const children: (Paragraph | Table)[] = [];

  children.push(
    ...docxCover(
      'PyNetSec · Manual Docente & Guia de Aulas (Ensino Médio Técnico)',
      'E-book do Professor: Plano de 40h, Roteiro Aula a Aula, Rubrica e Gabaritos',
      'Guia metodológico detalhado para conduzir aulas práticas de Python, Redes, Packet Tracer, Linux e Segurança da Informação no ambiente PyNetSec.',
      [
        `Curso / Nível: ${COURSE_OVERVIEW.level}`,
        `Carga Horária: ${COURSE_OVERVIEW.totalHours}`,
        `Metodologia: ${COURSE_OVERVIEW.methodology}`,
        `Ética e Governança: ${COURSE_OVERVIEW.ethicsStatement}`,
      ]
    )
  );

  children.push(docxH1('1. Apresentação Pedagógica e Operação do Ambiente'));
  children.push(
    docxP(
      'Este manual foi estruturado para professores do Ensino Médio Técnico que desejam transformar conteúdos abstratos de Programação, Redes de Computadores, Linux e Segurança da Informação em aulas altamente práticas, visualmente claras e com correção imediata.'
    )
  );
  children.push(
    docxCallout(
      'Como preparar a sala em 3 minutos antes da aula',
      '1. Abra o PyNetSec no projetor e oriente os alunos a preencherem Nome e Turma no menu Perfil.\n2. Ative o "Modo Livre do Professor" no menu Perfil se quiser liberar missões fora de ordem (ex.: começar direto por Redes ou Linux).\n3. Se desejar placar automático da turma em tempo real, configure a URL do Web App Google Apps Script na aba Google Sheets.\n4. Use o Simulador Packet Tracer e o Simulador TCP × UDP no projetor durante a demonstração antes de liberar a prática individual/em duplas.',
      COLORS.amberLight,
      COLORS.amber
    )
  );

  children.push(docxH2('Matriz de Integração Curricular (40h / 20 Encontros)'));
  children.push(
    docxTable(
      ['Bloco', 'Aulas', 'Unidade', 'Tema Central', 'Módulos no PyNetSec'],
      TEACHER_LESSON_PLANS.map((b) => [b.id, b.meetings, b.unit, b.title, b.pynetsecPath])
    )
  );

  // ROTEIRO DETALHADO AULA A AULA
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(docxH1('2. Roteiro Detalhado Aula a Aula (Minuto a Minuto)'));
  children.push(
    docxP(
      'Cada bloco foi planejado para um encontro geminado de 100 minutos (2 aulas de 50 min), podendo ser dividido facilmente em duas aulas avulsas (Teoria + Demo na Aula 1; Prática + Debriefing na Aula 2).'
    )
  );

  for (const plan of TEACHER_LESSON_PLANS) {
    children.push(docxH2(`${plan.id} · ${plan.meetings} — ${plan.title}`));
    children.push(docxP(`${plan.unit} · Duração: ${plan.durationMinutes} min · Caminho: ${plan.pynetsecPath}`, { italic: true, color: COLORS.muted }));

    children.push(docxH3('Objetivos de Aprendizagem'));
    plan.objectives.forEach((o) => children.push(docxBullet(o)));

    children.push(docxH3('Cronograma Sugerido (100 minutos)'));
    children.push(
      docxTable(
        ['Momento', 'Condução Docente'],
        [
          ['Abertura & Contexto', plan.timeline.opening],
          ['Exposição + Demo no PyNetSec', plan.timeline.demo],
          ['Prática Guiada & Desafios', plan.timeline.practice],
          ['Fechamento & Verificação', plan.timeline.debrief],
        ]
      )
    );

    children.push(docxH3('Perguntas Disparadoras para Engajar a Turma'));
    plan.triggerQuestions.forEach((q) => children.push(docxBullet(q)));

    children.push(docxH3('Erros Comuns de Alunos e Como Intervir'));
    plan.commonPitfalls.forEach((p) => children.push(docxBullet(p)));

    children.push(docxP(plan.linkedActivities, { boldPrefix: 'Atividades vinculadas: ' }));
  }

  // RUBRICA DE AVALIAÇÃO
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(docxH1('3. Rubrica de Avaliação Prática e Formativa'));
  children.push(
    docxP(
      'Sugestão de avaliação contínua combinando a trilha de missões CTF, os desafios práticos no Packet Tracer/Linux e a reflexão ética Purple Team.'
    )
  );
  children.push(
    docxTable(
      ['Dimensão Avaliada', 'Peso', 'Insuficiente (0–4)', 'Em Desenv. (5–6)', 'Proficiente (7–8,5)', 'Avançado (9–10)'],
      EVALUATION_RUBRIC.map((r) => [
        r.criterion,
        r.weight,
        r.insufficient,
        r.developing,
        r.proficient,
        r.advanced,
      ])
    )
  );

  // GABARITO PACKET TRACER
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(docxH1('4. Guia de Mediação e Gabarito — Cenários Packet Tracer'));
  children.push(
    docxTable(
      ['Cenário', 'Falha / Desafio Didático', 'Comandos de Validação Esperados'],
      PACKET_TRACER_PRESETS.map((p) => [
        `${p.title} (${p.networkType})`,
        p.objective,
        p.suggestedCommands.map((c) => c.command).join('  |  '),
      ])
    )
  );

  // GABARITO MISSÕES DE DEFESA (D01-D04)
  children.push(docxH1('5. Gabarito Comentado — Missões Teóricas de Defesa (Badges)'));
  for (const dm of DEFENSE_THEORY_MISSIONS) {
    children.push(docxH2(`${dm.id} — ${dm.title} (Badge: ${dm.badgeTitle} · ${dm.badgeCode})`));
    const qRows = dm.questions.map((q, idx) => [
      `Q${idx + 1}`,
      `${q.scenario} — ${q.question}`,
      q.options[q.correctIndex] ?? '',
      q.explanation,
    ]);
    children.push(docxTable(['#', 'Cenário & Pergunta', 'Resposta Correta', 'Justificativa Docente'], qRows));
  }

  // GABARITO COMPLETO DAS 50 MISSÕES CTF
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(docxH1('6. Gabarito de Referência — Todas as 50 Missões CTF'));
  children.push(
    docxCallout(
      'Uso Exclusivo do Professor',
      'Esta tabela reúne as 50 flags oficiais e a estrutura de dica 2 de cada missão para agilizar correções e apoio individual durante o laboratório.',
      COLORS.emeraldLight,
      COLORS.emerald
    )
  );
  children.push(new Paragraph({ spacing: { after: 100 } }));
  children.push(
    docxTable(
      ['ID', 'Circuito', 'Título', 'XP', 'Flag Esperada', 'Pista de Mediação (Estrutura)'],
      MISSIONS.map((m) => [
        m.id,
        `C0${m.circuit}`,
        m.title,
        String(m.points),
        m.flag,
        m.hints[1],
      ])
    )
  );

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 21, color: COLORS.slate },
        },
      },
    },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'PyNetSec · Guia de Aula & E-book do Professor (Uso Docente)',
                    size: 17,
                    color: COLORS.muted,
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Página ', size: 17, color: COLORS.muted, font: 'Calibri' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 17, color: COLORS.muted }),
                  new TextRun({ text: ' de ', size: 17, color: COLORS.muted, font: 'Calibri' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 17, color: COLORS.muted }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT_DIR, 'PyNetSec_Guia_Professor.docx'), buffer);
}

// ============================================================================
// 3. SHARED PDFKIT ENGINE (CLEAN TYPOGRAPHY + HEADERS + TABLES)
// ============================================================================

class PdfBookBuilder {
  doc: PDFKit.PDFDocument;
  private outStream: fs.WriteStream;
  private headerText: string;

  constructor(filePath: string, title: string, headerText: string) {
    this.headerText = pdfSafe(headerText);
    this.doc = new PDFDocument({
      size: 'A4',
      margins: { top: 62, bottom: 58, left: 50, right: 50 },
      bufferPages: true,
      info: {
        Title: pdfSafe(title),
        Author: 'PyNetSec Educacao Tecnica',
        Subject: 'Ensino Medio Tecnico - Python, Redes, Linux e Seguranca',
      },
    });
    this.outStream = fs.createWriteStream(filePath);
    this.doc.pipe(this.outStream);
  }

  ensureSpace(minHeight: number) {
    if (this.doc.y + minHeight > this.doc.page.height - this.doc.page.margins.bottom) {
      this.doc.addPage();
    }
  }

  addCover(kicker: string, title: string, subtitle: string, meta: string[], accentHex: string) {
    const w = this.doc.page.width;
    const h = this.doc.page.height;

    // Dark obsidian full-bleed cover
    this.doc.rect(0, 0, w, h).fill('#090D16');
    this.doc.rect(0, 0, 14, h).fill(accentHex);

    this.doc
      .fillColor(accentHex)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(pdfSafe(kicker).toUpperCase(), 60, 120, { width: w - 110 });

    this.doc
      .fillColor('#F8FAFC')
      .font('Helvetica-Bold')
      .fontSize(28)
      .text(pdfSafe(title), 60, 152, { width: w - 110, lineGap: 5 });

    this.doc
      .fillColor('#94A3B8')
      .font('Helvetica')
      .fontSize(13)
      .text(pdfSafe(subtitle), 60, this.doc.y + 18, { width: w - 110, lineGap: 4 });

    // Metadata box
    const boxY = 420;
    this.doc.roundedRect(60, boxY, w - 120, 185, 8).fill('#111827');
    this.doc.roundedRect(60, boxY, w - 120, 185, 8).strokeColor('#1E293B').lineWidth(1).stroke();

    this.doc
      .fillColor(accentHex)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('FICHA TECNICA DO MATERIAL', 80, boxY + 20);

    let y = boxY + 44;
    meta.forEach((line) => {
      this.doc
        .fillColor('#E2E8F0')
        .font('Helvetica')
        .fontSize(10.5)
        .text(pdfSafe(line), 80, y, { width: w - 160, lineGap: 3 });
      y = this.doc.y + 8;
    });

    this.doc
      .fillColor('#64748B')
      .font('Helvetica')
      .fontSize(9.5)
      .text('PyNetSec - Plataforma Educativa de Python, Redes, Linux e Seguranca da Informacao', 60, h - 70);

    this.doc.addPage();
  }

  h1(text: string) {
    this.ensureSpace(55);
    this.doc.moveDown(0.5);
    const y = this.doc.y;
    this.doc
      .fillColor('#0F172A')
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(pdfSafe(text), 50, y, { width: 495 });
    const lineY = this.doc.y + 4;
    this.doc.moveTo(50, lineY).lineTo(545, lineY).strokeColor('#0891B2').lineWidth(1.5).stroke();
    this.doc.y = lineY + 10;
  }

  h2(text: string) {
    this.ensureSpace(40);
    this.doc.moveDown(0.35);
    this.doc
      .fillColor('#0891B2')
      .font('Helvetica-Bold')
      .fontSize(12.5)
      .text(pdfSafe(text), 50, this.doc.y, { width: 495 });
    this.doc.moveDown(0.25);
  }

  h3(text: string) {
    this.ensureSpace(30);
    this.doc.moveDown(0.2);
    this.doc
      .fillColor('#1E293B')
      .font('Helvetica-Bold')
      .fontSize(10.5)
      .text(pdfSafe(text), 50, this.doc.y, { width: 495 });
    this.doc.moveDown(0.15);
  }

  p(text: string, opts?: { boldPrefix?: string; color?: string }) {
    this.ensureSpace(26);
    this.doc.fontSize(9.8).fillColor(opts?.color ?? '#334155');
    if (opts?.boldPrefix) {
      this.doc
        .font('Helvetica-Bold')
        .fillColor('#0F172A')
        .text(pdfSafe(opts.boldPrefix), 50, this.doc.y, { continued: true, width: 495, lineGap: 2.5 })
        .font('Helvetica')
        .fillColor(opts?.color ?? '#334155')
        .text(pdfSafe(text), { width: 495, lineGap: 2.5 });
    } else {
      this.doc.font('Helvetica').text(pdfSafe(text), 50, this.doc.y, { width: 495, lineGap: 2.5 });
    }
    this.doc.moveDown(0.35);
  }

  bullet(text: string, boldPrefix?: string) {
    this.ensureSpace(20);
    this.doc.fontSize(9.5);
    if (boldPrefix) {
      this.doc
        .font('Helvetica-Bold')
        .fillColor('#0F172A')
        .text(`- ${pdfSafe(boldPrefix)}`, 60, this.doc.y, { continued: true, width: 485, lineGap: 2 })
        .font('Helvetica')
        .fillColor('#334155')
        .text(pdfSafe(text), { width: 485, lineGap: 2 });
    } else {
      this.doc
        .font('Helvetica')
        .fillColor('#334155')
        .text(`- ${pdfSafe(text)}`, 60, this.doc.y, { width: 485, lineGap: 2 });
    }
    this.doc.moveDown(0.2);
  }

  callout(title: string, body: string, bgHex = '#ECFEFF', accentHex = '#0891B2') {
    const safeTitle = pdfSafe(title);
    const safeBody = pdfSafe(body);
    this.doc.font('Helvetica').fontSize(9.5);
    const bodyHeight = this.doc.heightOfString(safeBody, { width: 470, lineGap: 2.5 });
    const boxH = bodyHeight + 36;
    this.ensureSpace(boxH + 12);

    const startY = this.doc.y;
    this.doc.roundedRect(50, startY, 495, boxH, 5).fill(bgHex);
    this.doc.rect(50, startY, 4, boxH).fill(accentHex);

    this.doc
      .fillColor(accentHex)
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(safeTitle, 64, startY + 9, { width: 470 });

    this.doc
      .fillColor('#0F172A')
      .font('Helvetica')
      .fontSize(9.5)
      .text(safeBody, 64, startY + 24, { width: 470, lineGap: 2.5 });

    this.doc.y = startY + boxH + 10;
  }

  codeBlock(code: string) {
    const safeCode = pdfSafe(code);
    this.doc.font('Courier').fontSize(8.5);
    const h = this.doc.heightOfString(safeCode, { width: 475, lineGap: 2 }) + 18;
    this.ensureSpace(h + 8);
    const startY = this.doc.y;
    this.doc.roundedRect(50, startY, 495, h, 4).fill('#F1F5F9');
    this.doc.roundedRect(50, startY, 495, h, 4).strokeColor('#CBD5E1').lineWidth(0.7).stroke();
    this.doc
      .fillColor('#0F172A')
      .font('Courier')
      .fontSize(8.5)
      .text(safeCode, 60, startY + 9, { width: 475, lineGap: 2 });
    this.doc.y = startY + h + 8;
  }

  table(headers: string[], rows: string[][], colRatios?: number[]) {
    const totalW = 495;
    const ratios = colRatios ?? headers.map(() => 1 / headers.length);
    const colWidths = ratios.map((r) => Math.floor(totalW * r));

    const drawHeader = () => {
      this.ensureSpace(34);
      const y = this.doc.y;
      const headerH = 22;
      this.doc.rect(50, y, totalW, headerH).fill('#0F172A');
      let x = 50;
      headers.forEach((h, i) => {
        this.doc
          .fillColor('#FFFFFF')
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(pdfSafe(h), x + 5, y + 6, { width: colWidths[i] - 10, ellipsis: true });
        x += colWidths[i];
      });
      this.doc.y = y + headerH;
    };

    drawHeader();

    rows.forEach((row, rIdx) => {
      this.doc.font('Helvetica').fontSize(8.2);
      const heights = row.map((cell, i) =>
        this.doc.heightOfString(pdfSafe(cell), { width: colWidths[i] - 10, lineGap: 1.5 })
      );
      const rowH = Math.max(18, Math.max(...heights) + 10);

      if (this.doc.y + rowH > this.doc.page.height - this.doc.page.margins.bottom) {
        this.doc.addPage();
        drawHeader();
      }

      const y = this.doc.y;
      if (rIdx % 2 === 1) {
        this.doc.rect(50, y, totalW, rowH).fill('#F8FAFC');
      }
      this.doc.rect(50, y, totalW, rowH).strokeColor('#E2E8F0').lineWidth(0.5).stroke();

      let x = 50;
      row.forEach((cell, i) => {
        this.doc
          .fillColor('#334155')
          .font('Helvetica')
          .fontSize(8.2)
          .text(pdfSafe(cell), x + 5, y + 5, { width: colWidths[i] - 10, lineGap: 1.5 });
        x += colWidths[i];
      });
      this.doc.y = y + rowH;
    });

    this.doc.moveDown(0.5);
  }

  async finalize(): Promise<void> {
    const range = this.doc.bufferedPageRange();
    for (let i = 1; i < range.count; i += 1) {
      this.doc.switchToPage(i);
      // Header
      this.doc
        .fillColor('#64748B')
        .font('Helvetica')
        .fontSize(8)
        .text(this.headerText, 50, 28, { width: 495, align: 'right' });
      // Footer
      this.doc
        .fillColor('#64748B')
        .font('Helvetica')
        .fontSize(8)
        .text(`Pagina ${i} de ${range.count - 1}`, 50, this.doc.page.height - 34, {
          width: 495,
          align: 'center',
        });
    }

    return new Promise((resolve, reject) => {
      this.outStream.on('finish', resolve);
      this.outStream.on('error', reject);
      this.doc.end();
    });
  }
}

async function generateStudentPdf() {
  const pdf = new PdfBookBuilder(
    path.join(OUT_DIR, 'PyNetSec_Ebook_Aluno.pdf'),
    'PyNetSec - E-book do Aluno',
    'PyNetSec | E-book do Aluno (Ensino Medio Tecnico)'
  );

  pdf.addCover(
    'PyNetSec | Ensino Medio Tecnico',
    'E-book do Aluno: Python, Redes, Packet Tracer, Linux e Seguranca',
    'Apostila oficial integrada ao ambiente interativo PyNetSec — estude a teoria, monte topologias de rede e conquiste as 50 missoes CTF.',
    [
      `Publico-alvo: ${COURSE_OVERVIEW.level}`,
      `Carga Horaria Sugerida: ${COURSE_OVERVIEW.totalHours}`,
      'Modulos: Centro de Estudos (4 Pilares) + Simulador Packet Tracer + Sandbox + Terminal Linux',
      'Edicao 2026 - Sem spoilers das flags (pronto para distribuir a turma)',
    ],
    '#22D3EE'
  );

  pdf.h1('Capitulo 1 - Como Estudar com o PyNetSec');
  pdf.p(
    'O PyNetSec reune teoria direta ao ponto, simuladores interativos e 50 missoes praticas no navegador. Siga sempre o ciclo: 01. Estudar (micro-leitura + treinos) -> 02. Trilha CTF (missoes de 15 minutos) -> 03. Laboratorio (Packet Tracer, Sandbox Python e Terminal Linux).'
  );
  pdf.table(
    ['Circuito', 'Titulo', 'Foco de Aprendizagem', 'Missoes'],
    CIRCUITS.map((c) => [c.code, c.title, c.description, String(c.missionCount)]),
    [0.16, 0.24, 0.48, 0.12]
  );

  pdf.doc.addPage();
  pdf.h1('Capitulo 2 - Python Pratico para Redes e Seguranca');
  for (const lesson of STUDY_LESSONS) {
    pdf.h2(`Aula ${String(lesson.order).padStart(2, '0')} - ${lesson.title}`);
    lesson.intro.forEach((p) => pdf.p(p));
    if (lesson.commandTable.length > 0) {
      pdf.table(
        ['Comando', 'Significado', 'Exemplo'],
        lesson.commandTable.map((r) => [r.command, r.meaning, r.example]),
        [0.28, 0.42, 0.3]
      );
    }
    if (lesson.sandboxExamples[0]) {
      pdf.codeBlock(lesson.sandboxExamples[0].code);
    }
  }

  pdf.doc.addPage();
  pdf.h1('Capitulo 3 - Fundamentos de Redes, Topologias e Meios');
  pdf.h2('3.1 Tipos de Redes');
  pdf.table(
    ['Sigla', 'Nome', 'Alcance', 'Exemplo Real'],
    NETWORK_TYPES.map((t) => [t.acronym, `${t.fullName} (${t.ptName})`, t.rangeLabel, t.examples]),
    [0.12, 0.28, 0.2, 0.4]
  );
  pdf.h2('3.2 Topologias de Rede');
  pdf.table(
    ['Topologia', 'Caracteristica', 'Impacto de Falha'],
    NETWORK_TOPOLOGIES.map((t) => [t.name, t.description, t.faultTip]),
    [0.18, 0.41, 0.41]
  );
  pdf.h2('3.3 Meios de Transmissao');
  pdf.table(
    ['Meio', 'Conector / Alcance', 'Descricao e Exemplos'],
    TRANSMISSION_MEDIA.map((m) => [m.name, `${m.connectorOrBand} / ${m.typicalRange}`, m.description]),
    [0.24, 0.28, 0.48]
  );
  pdf.h2('3.4 Protocolos do Cotidiano');
  pdf.table(
    ['Protocolo', 'Porta', 'Funcao'],
    EVERYDAY_PROTOCOLS.map((p) => [p.name, p.portOrLayer, `${p.fullName}: ${p.description}`]),
    [0.16, 0.16, 0.68]
  );

  pdf.doc.addPage();
  pdf.h1('Capitulo 4 - Protocolos de Transporte: TCP vs. UDP');
  PROTOCOL_LESSON.overviewParagraphs.forEach((p) => pdf.p(p));
  pdf.table(
    ['Criterio', 'TCP (Confiavel)', 'UDP (Rapido)'],
    PROTOCOL_LESSON.comparisonRows.map((r) => [r.criterion, r.tcp, r.udp]),
    [0.24, 0.38, 0.38]
  );
  pdf.h2('Casos de Uso Reais');
  pdf.table(
    ['Aplicacao', 'Proto', 'Portas', 'Justificativa'],
    PROTOCOL_LESSON.useCases.map((u) => [u.service, u.protocol, u.ports, u.whyItFits]),
    [0.24, 0.1, 0.14, 0.52]
  );

  pdf.doc.addPage();
  pdf.h1('Capitulo 5 - Packet Tracer, LAN Linux e Troubleshooting');
  pdf.h2('5.1 Ambientes Prontos no Packet Tracer PyNetSec');
  pdf.table(
    ['Ambiente', 'Tipo', 'Sub-rede', 'Objetivo Pratico'],
    PACKET_TRACER_PRESETS.map((p) => [p.title, p.networkType, p.subtitle, p.objective]),
    [0.22, 0.18, 0.18, 0.42]
  );
  pdf.h2('5.2 Configuracao Passo a Passo de LAN no Linux');
  pdf.table(
    ['Etapa', 'Comando Moderno (ip)', 'Classico (ifconfig)', 'Finalidade'],
    [
      ['1. Placa UP', 'sudo ip link set eth0 up', 'sudo ifconfig eth0 up', 'Ativar interface de rede'],
      ['2A. DHCP', 'sudo dhclient -v eth0', 'sudo dhclient -v eth0', 'Obter IP/Gateway/DNS via DORA'],
      ['2B. Estatico', 'sudo ip addr add 192.168.10.25/24 dev eth0', 'sudo ifconfig eth0 192.168.10.25 netmask 255.255.255.0', 'Definir IPv4 manual'],
      ['3. Gateway', 'sudo ip route add default via 192.168.10.1', 'sudo route add default gw 192.168.10.1', 'Rota para redes externas'],
      ['4. DNS', 'echo "nameserver 10.0.0.20" | sudo tee /etc/resolv.conf', 'Mesmo arquivo /etc/resolv.conf', 'Resolver nomes de dominio'],
      ['5. Auditoria', 'ip neigh && ping -c 3 192.168.10.1 && ss -tulnp', 'arp -a && ping -c 3 192.168.10.1 && netstat -tulnp', 'Validar ARP, rota e portas'],
    ],
    [0.14, 0.31, 0.3, 0.25]
  );
  pdf.callout(
    'Check-list de Validacao de Conectividade (L1 -> L7)',
    '1) ip link (placa UP)  |  2) ip addr (IP/Mascara validos)  |  3) ping 127.0.0.1 (Loopback)  |  4) ping Gateway + ip neigh (ARP)  |  5) ping 8.8.8.8 / traceroute (Roteamento)  |  6) nslookup / curl (DNS e Aplicacao).'
  );

  pdf.doc.addPage();
  pdf.h1('Capitulo 6 - Seguranca da Informacao e Defesa');
  pdf.table(
    ['Pilar CID', 'Definicao', 'Controles', 'Ameaca'],
    TRIAD_PILLARS.map((t) => [t.title, t.definition, t.controls.join('; '), t.threatExample]),
    [0.18, 0.3, 0.26, 0.26]
  );
  for (const g of DEFENSE_PILLAR_GUIDES) {
    pdf.h2(`${g.title} - ${g.tagline}`);
    pdf.p(g.coreRole);
    pdf.p(g.howItWorks);
    g.mechanisms.forEach((m) => pdf.bullet(m.detail, `${m.name}: `));
  }
  pdf.h2('IDS vs. IPS');
  pdf.table(
    ['Criterio', 'IDS (Deteccao)', 'IPS (Prevencao)'],
    IDS_VS_IPS_COMPARISON.map((r) => [r.criterion, r.ids, r.ips]),
    [0.24, 0.38, 0.38]
  );

  pdf.doc.addPage();
  pdf.h1('Capitulo 7 - Linux Essencial e Mapa das 50 Missoes');
  pdf.table(
    ['Diretorio', 'Rotulo', 'Finalidade'],
    LINUX_FHS_DIRECTORIES.map((d) => [d.path, d.label, d.description]),
    [0.14, 0.2, 0.66]
  );
  pdf.h2('Checklist das 50 Missoes CTF');
  pdf.table(
    ['ID', 'Circ.', 'Titulo', 'Topico', 'XP', 'OK'],
    MISSIONS.map((m) => [m.id, `C0${m.circuit}`, m.title, m.topic, String(m.points), '[ ]']),
    [0.1, 0.08, 0.38, 0.28, 0.08, 0.08]
  );

  await pdf.finalize();
}

async function generateTeacherPdf() {
  const pdf = new PdfBookBuilder(
    path.join(OUT_DIR, 'PyNetSec_Guia_Professor.pdf'),
    'PyNetSec - E-book e Guia de Aula do Professor',
    'PyNetSec | Guia de Aula do Professor (Uso Docente)'
  );

  pdf.addCover(
    'PyNetSec | Manual Docente - Ensino Medio Tecnico',
    'E-book & Guia de Aula do Professor (40h / 20 Aulas)',
    'Plano de curso detalhado minuto a minuto, estrategia de mediacao no Packet Tracer e CTF, rubrica de avaliacao e gabarito de todas as missoes.',
    [
      `Curso: ${COURSE_OVERVIEW.level}`,
      `Carga Horaria: ${COURSE_OVERVIEW.totalHours}`,
      `Metodologia: ${COURSE_OVERVIEW.methodology}`,
      'Conteudo Docente: 10 Blocos de Aula + Rubrica 4x4 + Gabarito das 50 Missoes CTF e Badges D01-D04',
    ],
    '#34D399'
  );

  pdf.h1('1. Metodologia e Preparacao do Ambiente PyNetSec');
  pdf.p(COURSE_OVERVIEW.methodology);
  pdf.p(COURSE_OVERVIEW.ethicsStatement, { boldPrefix: 'Etica Profissional: ' });
  pdf.callout(
    'Checklist Rapido do Professor Antes da Aula',
    '1) Orientar cadastro de Nome/Turma no menu Perfil.\n2) Ativar Modo Livre do Professor caso queira pular circuitos.\n3) Configurar URL do Google Apps Script para placar ao vivo da turma.\n4) Projetar o Packet Tracer ou Simulador TCP x UDP nos primeiros 25 min antes da pratica.',
    '#ECFDF5',
    '#059669'
  );

  pdf.h2('Cronograma Geral dos 10 Blocos (20 Aulas Geminadas)');
  pdf.table(
    ['Bloco', 'Aulas', 'Unidade', 'Tema Central'],
    TEACHER_LESSON_PLANS.map((b) => [b.id, b.meetings, b.unit, b.title]),
    [0.1, 0.16, 0.26, 0.48]
  );

  pdf.doc.addPage();
  pdf.h1('2. Roteiro Detalhado Aula a Aula (Minuto a Minuto)');
  for (const plan of TEACHER_LESSON_PLANS) {
    pdf.h2(`${plan.id} - ${plan.meetings}: ${plan.title}`);
    pdf.p(`${plan.unit} | ${plan.durationMinutes} min | ${plan.pynetsecPath}`, { color: '#64748B' });
    pdf.h3('Objetivos de Aprendizagem');
    plan.objectives.forEach((o) => pdf.bullet(o));
    pdf.table(
      ['Etapa', 'Conducao Docente'],
      [
        ['Abertura', plan.timeline.opening],
        ['Exposicao + Demo', plan.timeline.demo],
        ['Pratica Guiada', plan.timeline.practice],
        ['Fechamento', plan.timeline.debrief],
      ],
      [0.24, 0.76]
    );
    pdf.h3('Perguntas Disparadoras');
    plan.triggerQuestions.forEach((q) => pdf.bullet(q));
    pdf.h3('Erros Comuns e Intervencao');
    plan.commonPitfalls.forEach((c) => pdf.bullet(c));
    pdf.p(plan.linkedActivities, { boldPrefix: 'Atividades vinculadas: ' });
  }

  pdf.doc.addPage();
  pdf.h1('3. Rubrica de Avaliacao Pratica e Formativa');
  pdf.table(
    ['Dimensao', 'Peso', 'Insuficiente', 'Em Desenv.', 'Proficiente', 'Avancado'],
    EVALUATION_RUBRIC.map((r) => [
      r.criterion,
      r.weight,
      r.insufficient,
      r.developing,
      r.proficient,
      r.advanced,
    ]),
    [0.18, 0.08, 0.18, 0.18, 0.19, 0.19]
  );

  pdf.h1('4. Gabarito dos Cenarios Packet Tracer');
  pdf.table(
    ['Cenario', 'Desafio Pedagogico', 'Comandos Esperados'],
    PACKET_TRACER_PRESETS.map((p) => [
      p.title,
      p.objective,
      p.suggestedCommands.map((c) => c.command).join(' | '),
    ]),
    [0.22, 0.43, 0.35]
  );

  pdf.doc.addPage();
  pdf.h1('5. Gabarito das Missoes Teoricas de Defesa (D01-D04)');
  for (const dm of DEFENSE_THEORY_MISSIONS) {
    pdf.h2(`${dm.id} - ${dm.title} (${dm.badgeCode})`);
    pdf.table(
      ['#', 'Questao', 'Correta', 'Explicacao'],
      dm.questions.map((q, i) => [`Q${i + 1}`, `${q.scenario} - ${q.question}`, q.options[q.correctIndex] ?? '', q.explanation]),
      [0.07, 0.31, 0.25, 0.37]
    );
  }

  pdf.doc.addPage();
  pdf.h1('6. Gabarito Completo das 50 Missoes CTF');
  pdf.table(
    ['ID', 'C', 'Titulo', 'XP', 'Flag Oficial', 'Pista de Mediacao'],
    MISSIONS.map((m) => [m.id, `C${m.circuit}`, m.title, String(m.points), m.flag, m.hints[1]]),
    [0.09, 0.06, 0.23, 0.07, 0.24, 0.31]
  );

  await pdf.finalize();
}

// ============================================================================
// 4. GENERATE POWERPOINT PRESENTATION (.PPTX — 22 SLIDES + SPEAKER NOTES)
// ============================================================================

async function generatePowerPoint() {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in
  pptx.author = 'PyNetSec Educação Técnica';
  pptx.company = 'PyNetSec';
  pptx.subject = 'Curso Integrado de Python, Redes, Packet Tracer, Linux e Segurança';
  pptx.title = 'PyNetSec — Apresentação de Aulas (Ensino Médio Técnico)';

  const BG = '090D16';
  const CARD = '111827';
  const CARD2 = '162033';
  const BORDER = '1E293B';
  const CYAN = '22D3EE';
  const EMERALD = '34D399';
  const AMBER = 'FBBF24';
  const ROSE = 'FB7185';
  const WHITE = 'F8FAFC';
  const MUTED = '94A3B8';

  let slideCount = 0;

  function newSlide(kicker: string, title: string, notes: string) {
    slideCount += 1;
    const s = pptx.addSlide();
    s.background = { color: BG };
    // Top subtle accent bar
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.08, fill: { color: CYAN } });
    // Kicker
    s.addText(kicker.toUpperCase(), {
      x: 0.65,
      y: 0.35,
      w: 10.5,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: CYAN,
      fontFace: 'Calibri',
    });
    // Slide title
    s.addText(title, {
      x: 0.65,
      y: 0.65,
      w: 12.0,
      h: 0.65,
      fontSize: 26,
      bold: true,
      color: WHITE,
      fontFace: 'Calibri',
    });
    // Footer
    s.addText(`PyNetSec · Ensino Médio Técnico   |   Slide ${slideCount}`, {
      x: 0.65,
      y: 7.05,
      w: 12.0,
      h: 0.3,
      fontSize: 9.5,
      color: MUTED,
      align: 'right',
      fontFace: 'Calibri',
    });
    s.addNotes(notes);
    return s;
  }

  function addBox(
    s: PptxGenJS.Slide,
    x: number,
    y: number,
    w: number,
    h: number,
    title: string,
    body: string,
    accent = CYAN
  ) {
    s.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h,
      rectRadius: 0.08,
      fill: { color: CARD },
      line: { color: BORDER, width: 1 },
    });
    s.addText(title, {
      x: x + 0.22,
      y: y + 0.16,
      w: w - 0.44,
      h: 0.35,
      fontSize: 14,
      bold: true,
      color: accent,
      fontFace: 'Calibri',
    });
    s.addText(body, {
      x: x + 0.22,
      y: y + 0.56,
      w: w - 0.44,
      h: h - 0.72,
      fontSize: 12,
      color: WHITE,
      fontFace: 'Calibri',
      valign: 'top',
      breakLine: true,
    });
  }

  // SLIDE 1 — CAPA
  {
    slideCount += 1;
    const s = pptx.addSlide();
    s.background = { color: BG };
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: CYAN } });
    s.addText('PYNETSEC · ENSINO MÉDIO TÉCNICO', {
      x: 0.9,
      y: 1.5,
      w: 11.5,
      h: 0.4,
      fontSize: 13,
      bold: true,
      color: CYAN,
      fontFace: 'Calibri',
    });
    s.addText('Python, Redes de Computadores,\nLinux e Segurança da Informação', {
      x: 0.9,
      y: 2.0,
      w: 11.5,
      h: 1.8,
      fontSize: 40,
      bold: true,
      color: WHITE,
      fontFace: 'Calibri',
    });
    s.addText('Trilha Prática com Simulador Packet Tracer, Terminal Linux e 50 Missões CTF', {
      x: 0.9,
      y: 3.95,
      w: 10.8,
      h: 0.6,
      fontSize: 18,
      color: MUTED,
      fontFace: 'Calibri',
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.9,
      y: 5.0,
      w: 11.4,
      h: 1.2,
      rectRadius: 0.08,
      fill: { color: CARD },
      line: { color: BORDER, width: 1 },
    });
    s.addText(
      '4 Pilares Integrados:   01. Python Prático   ·   02. Redes & Packet Tracer   ·   03. Segurança da Informação   ·   04. Linux Essencial',
      {
        x: 1.15,
        y: 5.38,
        w: 10.9,
        h: 0.5,
        fontSize: 13,
        bold: true,
        color: EMERALD,
        fontFace: 'Calibri',
      }
    );
    s.addNotes(
      'NOTAS DO PROFESSOR (Slide 1): Dê boas-vindas à turma. Explique que o PyNetSec funciona direto no navegador sem instalação e integra programação, redes, Linux e segurança em um fluxo contínuo.'
    );
  }

  // SLIDE 2 — COMO FUNCIONA O AMBIENTE
  {
    const s = newSlide(
      'Visão Geral da Metodologia',
      'Ciclo de Aprendizagem PyNetSec (3 Passos)',
      'Mostre aos alunos a barra superior do PyNetSec: Estudar -> Trilha CTF -> Laboratório. Explique a Regra dos 15 Minutos: cada missão tem micro-leitura, exemplo, dica 1 e dica 2.'
    );
    addBox(s, 0.65, 1.65, 3.75, 4.6, '01. Estudar (Teoria Visual)', '• 4 pilares estruturados\n• Treinos de repetição (3 passos)\n• Simulador TCP × UDP\n• Guia interativo de LAN Linux\n• Badges de Segurança (D01–D04)', CYAN);
    addBox(s, 4.78, 1.65, 3.75, 4.6, '02. Trilha CTF (50 Missões)', '• 5 Circuitos progressivos\n• Missões curtas (~15 min)\n• Validação automática em Python 3\n• Erros traduzidos para português\n• Ranking ao vivo + Cards de Flag', EMERALD);
    addBox(s, 8.91, 1.65, 3.75, 4.6, '03. Laboratório Prático', '• Simulador Packet Tracer\n• Montagem de LAN, Wi-Fi e Roteador\n• Sandbox Python & Redes (ping/nmap)\n• Terminal Ubuntu Linux (FHS/Bash)\n• Aprendizagem sem medo de errar', AMBER);
  }

  // SLIDE 3 — CRONOGRAMA DO CURSO (40h)
  {
    const s = newSlide(
      'Planejamento Semestral',
      'Jornada das 20 Aulas (40 Horas-Aula)',
      'Apresente o mapa do curso para os alunos saberem onde vão chegar até o Chefão Final M50.'
    );
    const rows = [
      [
        { text: 'Unidade', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
        { text: 'Aulas', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
        { text: 'Conteúdo Prático', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
        { text: 'Entregas no PyNetSec', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
      ],
      ['Unid. 1 · Python', '01 a 06', 'Variáveis, if/else, loops, dicts e ipaddress', 'Aulas L01–L05 + Missões M01–M15'],
      ['Unid. 2 · Redes & TCP/UDP', '07 a 10', 'PAN/LAN/WAN, Topologias, OSI, TCP vs. UDP', 'Simulador TCP×UDP + Missões M22–M35'],
      ['Unid. 3 · Packet Tracer', '11 a 14', 'Montagem LAN, DHCP, Roteamento e Falhas', '6 cenários Packet Tracer + Troubleshooting'],
      ['Unid. 4 · Linux & LAN', '15 a 16', 'FHS, permissões, ip/ifconfig/dhclient', 'Check-list L1→L7 + Missões M36–M45'],
      ['Unid. 5 · Segurança & CTF', '17 a 20', 'CID, Firewall, Cripto, IDS/IPS, Blue/Red', '4 Badges Defesa + M16–M20B + M46–M50'],
    ];
    s.addTable(rows as PptxGenJS.TableRow[], {
      x: 0.65,
      y: 1.6,
      w: 12.0,
      fontSize: 12,
      color: WHITE,
      fill: { color: CARD },
      border: { pt: 1, color: BORDER },
      colW: [2.4, 1.3, 4.4, 3.9],
      rowH: 0.72,
    });
  }

  // SLIDE 4 — PYTHON: VARIÁVEIS & STRINGS
  {
    const s = newSlide(
      'Unidade 1 · Aulas 01 e 02',
      'Python Prático: Variáveis, f-strings e Higienização de Logs',
      'Demonstre ao vivo na Aula 01 do Centro de Estudos. Reforce que .strip().lower().replace() não altera a string original se o resultado não for salvo em uma variável.'
    );
    addBox(
      s,
      0.65,
      1.6,
      5.8,
      4.9,
      'Conceitos-Chave',
      '• Variável guarda dados com um rótulo (ip, usuario, porta)\n• f-string injeta variáveis no texto: f"Host {ip}:{porta}"\n• .strip() remove espaços extras nas bordas\n• .lower() padroniza tudo em minúsculas\n• .replace(a, b) troca caracteres inválidos\n\nAplicação real: normalizar logins e logs antes de auditar.',
      CYAN
    );
    addBox(
      s,
      6.75,
      1.6,
      5.9,
      4.9,
      'Exemplo ao Vivo (Sandbox Python)',
      'login_bruto = "   Admin.Rede   "\nporta = 22\n\nusuario = login_bruto.strip().lower().replace(".", "_")\nprint(f"Acesso SSH -> {usuario} na porta {porta}")\n\n# Saída no console:\n# Acesso SSH -> admin_rede na porta 22',
      EMERALD
    );
  }

  // SLIDE 5 — PYTHON: IF/ELSE, LOOPS E DICIONÁRIOS
  {
    const s = newSlide(
      'Unidade 1 · Aulas 03 a 05',
      'Decisões (if/else), Loops for e Contagem com Dicionários',
      'Peça à turma para traduzir uma regra de firewall em português para Python. Destaque o uso de 4 espaços (tecla Tab) e o método .get(chave, 0) + 1 para detectar força bruta.'
    );
    addBox(
      s,
      0.65,
      1.6,
      5.8,
      4.9,
      'Decisão + Repetição',
      'portas = [22, 80, 443, 3389]\n\nfor porta in portas:\n    if porta in [22, 3389]:\n        print(f"ALERTA: porta remota {porta}")\n    else:\n        print(f"Web liberada: {porta}")',
      CYAN
    );
    addBox(
      s,
      6.75,
      1.6,
      5.9,
      4.9,
      'Detectar Força Bruta com dict',
      'tentativas = ["10.0.0.5", "10.0.0.5", "10.0.0.9", "10.0.0.5"]\ncontagem = {}\n\nfor ip in tentativas:\n    contagem[ip] = contagem.get(ip, 0) + 1\n\nprint(contagem)\n# {"10.0.0.5": 3, "10.0.0.9": 1}',
      AMBER
    );
  }

  // SLIDE 6 — PYTHON PARA REDES: IPADDRESS
  {
    const s = newSlide(
      'Unidade 1 · Aulas 05 e 06',
      'Automação de Redes com o Módulo ipaddress',
      'Conecte Python com Redes de Computadores. Explique por que uma rede /24 possui 256 endereços totais, mas apenas 254 hosts utilizáveis (rede .0 e broadcast .255).'
    );
    addBox(
      s,
      0.65,
      1.6,
      6.2,
      4.9,
      'Código Real no Circuito 02 (M11–M15)',
      'import ipaddress\n\nrede = ipaddress.ip_network("192.168.10.0/24")\nip = ipaddress.ip_address("192.168.10.25")\n\nprint("Rede:", rede.network_address)\nprint("Broadcast:", rede.broadcast_address)\nprint("Total de IPs:", rede.num_addresses)\nprint("Pertence à LAN?", ip in rede)\nprint("É IP privado?", ip.is_private)',
      CYAN
    );
    addBox(
      s,
      7.15,
      1.6,
      5.5,
      4.9,
      'Faixas Privadas (RFC 1918)',
      '• Classe A: 10.0.0.0/8\n  (Grandes redes corporativas)\n\n• Classe B: 172.16.0.0/12\n  (Campi e empresas médias)\n\n• Classe C: 192.168.0.0/16\n  (Escolas, laboratórios e residências)\n\nLoopback local: 127.0.0.1 (a própria máquina)',
      EMERALD
    );
  }

  // SLIDE 7 — TIPOS DE REDES
  {
    const s = newSlide(
      'Unidade 2 · Aulas 07 e 08',
      'Classificação das Redes por Abrangência',
      'Peça aos alunos para citarem um exemplo real da própria escola para cada sigla (Bluetooth do fone = PAN, laboratório = LAN, Wi-Fi = WLAN, provedor Internet = WAN).'
    );
    const rows = [
      [
        { text: 'Tipo', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
        { text: 'Significado', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
        { text: 'Alcance', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
        { text: 'Exemplo no Cotidiano', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
      ],
      ...NETWORK_TYPES.slice(0, 5).map((t) => [t.acronym, `${t.fullName} (${t.ptName})`, t.rangeLabel, t.examples]),
    ];
    s.addTable(rows as PptxGenJS.TableRow[], {
      x: 0.65,
      y: 1.6,
      w: 12.0,
      fontSize: 12,
      color: WHITE,
      fill: { color: CARD },
      border: { pt: 1, color: BORDER },
      colW: [1.3, 3.2, 2.3, 5.2],
      rowH: 0.8,
    });
  }

  // SLIDE 8 — TOPOLOGIAS DE REDE
  {
    const s = newSlide(
      'Unidade 2 · Aulas 07 e 08',
      'Topologias de Rede e Tolerância a Falhas',
      'Abra a aba Fundamentos & Topologias no PyNetSec e clique para simular o rompimento de cabos em cada topologia ao vivo.'
    );
    const cols = NETWORK_TOPOLOGIES.slice(0, 4);
    cols.forEach((t, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      addBox(
        s,
        0.65 + col * 6.15,
        1.55 + row * 2.65,
        5.85,
        2.4,
        t.name,
        `${t.subtitle}\n\nSe um cabo falhar: ${t.faultTip}`,
        idx === 0 ? CYAN : idx === 1 ? AMBER : idx === 2 ? EMERALD : ROSE
      );
    });
  }

  // SLIDE 9 — MODELO OSI E PILHA TCP/IP
  {
    const s = newSlide(
      'Unidade 2 · Aulas 07 e 08',
      'Modelo OSI (7 Camadas) na Prática do Técnico',
      'Faça o quiz relâmpago com a turma: "Em qual camada trabalha o Switch? (C2) E o Roteador? (C3) E o Cabo UTP? (C1) E o protocolo HTTP? (C7)".'
    );
    const rows = [
      [
        { text: 'Camada', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
        { text: 'PDU / Dado', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
        { text: 'Protocolos / Exemplos', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
        { text: 'Equipamento / Papel', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
      ],
      ['7. Aplicação', 'Dados', 'HTTP, HTTPS, DNS, DHCP, SSH', 'Navegador, Servidor Web'],
      ['6. Apresentação', 'Dados', 'TLS/SSL, UTF-8, JPEG', 'Criptografia e formatação'],
      ['5. Sessão', 'Dados', 'Sessões RPC / Sockets', 'Controle de diálogo'],
      ['4. Transporte', 'Segmento / Datagrama', 'TCP (confiável) e UDP (rápido)', 'Portas e controle de fluxo'],
      ['3. Rede', 'Pacote', 'IPv4, IPv6, ICMP, ARP', 'Roteador (endereçamento IP)'],
      ['2. Enlace', 'Quadro (Frame)', 'Ethernet, Wi-Fi 802.11, MAC', 'Switch L2 / Access Point'],
      ['1. Física', 'Bits (0 e 1)', 'UTP Cat6, Fibra Óptica, Rádio', 'Cabos, placas e conectores'],
    ];
    s.addTable(rows as PptxGenJS.TableRow[], {
      x: 0.65,
      y: 1.5,
      w: 12.0,
      fontSize: 11.5,
      color: WHITE,
      fill: { color: CARD },
      border: { pt: 1, color: BORDER },
      colW: [2.2, 2.2, 4.1, 3.5],
      rowH: 0.64,
    });
  }

  // SLIDE 10 — TCP VS UDP (DIAGRAMA HANDSHAKE)
  {
    const s = newSlide(
      'Unidade 2 · Aulas 09 e 10',
      'TCP (Three-Way Handshake) vs. UDP (Envio Direto)',
      'Abra o Simulador TCP × UDP lado a lado no PyNetSec para animar exatamente esse diagrama na frente da turma.'
    );
    addBox(
      s,
      0.65,
      1.55,
      5.85,
      5.1,
      'TCP — Orientado à Conexão (20+ bytes)',
      '1. Cliente  ── SYN (Seq=100) ──►  Servidor\n   "Posso abrir conexão?"\n\n2. Cliente  ◄── SYN-ACK ──  Servidor\n   "Sim! Confirmado, vamos sincronizar."\n\n3. Cliente  ── ACK ──►  Servidor\n   "Conexão ESTABLISHED! Enviando dados."\n\n✓ Garante ordem, confirmação (ACK) e retransmissão.\nUso: Web (HTTPS), E-mail, SSH, Bancos, Arquivos.',
      CYAN
    );
    addBox(
      s,
      6.8,
      1.55,
      5.85,
      5.1,
      'UDP — Sem Conexão / Direto (8 bytes)',
      '0 Handshake — Disparo imediato!\n\n1. Cliente  ── Datagrama #1 ──►  Servidor\n2. Cliente  ── Datagrama #2 ──►  Servidor\n3. Cliente  ── Datagrama #3 ──►  Servidor\n\n⚡ Menor latência e cabeçalho ultraleve (8 bytes).\nSe um pacote se perde, não trava o restante.\n\nUso: DNS (53), DHCP (67/68), VoIP, Streaming, Jogos.',
      AMBER
    );
  }

  // SLIDE 11 — PORTAS ESSENCIAIS TCP/UDP
  {
    const s = newSlide(
      'Unidade 2 · Aulas 09 e 10',
      'Portas Bem Conhecidas (Well-Known Ports 0–1023)',
      'Lembre os alunos que o IP identifica o computador (prédio) e a Porta identifica o serviço/aplicativo (apartamento).'
    );
    const rows = [
      [
        { text: 'Porta', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
        { text: 'Transporte', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
        { text: 'Serviço', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
        { text: 'Observação de Segurança / Redes', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
      ],
      ['22', 'TCP', 'SSH', 'Acesso remoto seguro ao terminal Linux (criptografado)'],
      ['53', 'UDP / TCP', 'DNS', 'Traduz nomes (portal.escola.local) para endereços IP'],
      ['67 / 68', 'UDP', 'DHCP', 'Entrega IP, máscara, gateway e DNS automaticamente'],
      ['80', 'TCP', 'HTTP', 'Web em texto puro (sem criptografia — prefira 443)'],
      ['443', 'TCP', 'HTTPS', 'Web protegida com TLS/SSL (cadeado no navegador)'],
      ['3389', 'TCP', 'RDP', 'Área de Trabalho Remota (nunca expor sem VPN/Firewall)'],
    ];
    s.addTable(rows as PptxGenJS.TableRow[], {
      x: 0.65,
      y: 1.55,
      w: 12.0,
      fontSize: 12,
      color: WHITE,
      fill: { color: CARD },
      border: { pt: 1, color: BORDER },
      colW: [1.3, 1.5, 1.8, 7.4],
      rowH: 0.72,
    });
  }

  // SLIDE 12 — PACKET TRACER PYNETSEC
  {
    const s = newSlide(
      'Unidade 3 · Aulas 11 e 12',
      'Simulador Packet Tracer Integrado no PyNetSec',
      'Abra Laboratório -> Packet Tracer. Mostre a barra de ferramentas: Mover, Cabos (Direto, Crossover, Fibra, Wi-Fi), Enviar Pacote (PDU) e Terminal CLI.'
    );
    addBox(
      s,
      0.65,
      1.6,
      5.85,
      4.95,
      '6 Ambientes Básicos Prontos',
      '1. LAN Estrela (Switch + 3 PCs + Servidor Web/DNS)\n2. Ponto-a-Ponto Crossover (Desafio de sub-rede!)\n3. Duas Sub-redes com Roteador L3 (LAN ↔ LAN)\n4. Rede Wi-Fi + Access Point + DHCP (Notebook sem IP)\n5. Anel de Switches (Teste de rompimento de fibra!)\n6. Bancada em Branco (Montar do zero)',
      CYAN
    );
    addBox(
      s,
      6.8,
      1.6,
      5.85,
      4.95,
      'O que os Alunos Enxergam ao Vivo',
      '• Quadros ARP, ICMP, DHCP, DNS, TCP, HTTP e DROP\n• Pontos verdes (UP) e vermelhos (DOWN) nos cabos\n• Sniffer PDU clicável salto a salto\n• Terminal real por equipamento:\n  ping · traceroute · ip addr · ip route\n  dhclient · nslookup · curl · arp -a · set ip',
      EMERALD
    );
  }

  // SLIDE 13 — CABOS E CONEXÕES
  {
    const s = newSlide(
      'Unidade 3 · Aulas 11 e 12',
      'Qual Cabo Usar em Cada Conexão?',
      'Explique a regra didática clássica: equipamentos diferentes usam Cabo Direto; equipamentos iguais sem Auto-MDIX usam Crossover; backbones usam Fibra.'
    );
    addBox(s, 0.65, 1.65, 2.8, 4.7, 'Cabo Direto (UTP)', '1 Gbps · Par Trançado\n\nLiga dispositivos diferentes:\n• PC ↔ Switch\n• Servidor ↔ Switch\n• Switch ↔ Roteador\n• AP ↔ Switch', CYAN);
    addBox(s, 3.7, 1.65, 2.8, 4.7, 'Cabo Crossover', '1 Gbps · Pinos invertidos\n\nLiga dispositivos iguais diretamente:\n• PC ↔ PC (P2P)\n• Switch ↔ Switch (legado)\n\n(No Packet Tracer: cenário Ponto-a-Ponto!)', AMBER);
    addBox(s, 6.75, 1.65, 2.8, 4.7, 'Fibra Óptica', '10 Gbps · Luz\n\nImune a interferência eletromagnética.\n\nUsada em:\n• Backbone entre Switches\n• Switch ↔ Roteador Core\n• Interligação de prédios', 'A78BFA');
    addBox(s, 9.8, 1.65, 2.85, 4.7, 'Link Wi-Fi (802.11)', '300+ Mbps · Rádio\n\nMobilidade sem cabos.\n\nUsado entre:\n• Notebook ↔ Access Point\n• Smartphones ↔ Roteador Wi-Fi', EMERALD);
  }

  // SLIDE 14 — DHCP FLUXO DORA
  {
    const s = newSlide(
      'Unidade 3 · Aulas 11 e 12',
      'Como o DHCP Entrega IP Automaticamente (Fluxo DORA)',
      'Use o cenário "Rede Sem Fio com DHCP" no Packet Tracer. Selecione o NB-02 (Sem IP) e clique em dhclient para a turma assistir aos 4 pacotes DORA.'
    );
    addBox(s, 0.65, 1.85, 2.8, 3.8, '1. DISCOVER', 'Cliente sem IP envia broadcast (255.255.255.255):\n\n"Existe algum servidor DHCP nesta rede?"\n\nUDP 68 -> 67', CYAN);
    addBox(s, 3.7, 1.85, 2.8, 3.8, '2. OFFER', 'Servidor DHCP responde oferecendo um IP livre do pool:\n\n"Tenho o 192.168.100.52 disponível!"\n\nUDP 67 -> 68', EMERALD);
    addBox(s, 6.75, 1.85, 2.8, 3.8, '3. REQUEST', 'Cliente aceita formalmente a oferta:\n\n"Quero usar o 192.168.100.52!"\n\nUDP 68 -> 67', AMBER);
    addBox(s, 9.8, 1.85, 2.85, 3.8, '4. ACK', 'Servidor confirma a concessão (lease) e entrega:\n\n• IPv4 + Máscara\n• Gateway Padrão\n• Servidor DNS', 'A78BFA');
  }

  // SLIDE 15 — ROTEAMENTO LAN <-> LAN
  {
    const s = newSlide(
      'Unidade 3 · Aulas 13 e 14',
      'Roteamento L3 e o Papel do Gateway Padrão',
      'No cenário "Duas Sub-redes com Roteador", mostre traceroute 10.0.20.50 e depois apague o gateway do PC-A1 para demonstrar o pacote sendo descartado.'
    );
    addBox(s, 0.65, 1.8, 3.6, 4.3, 'Sub-rede A (Alunos)', 'Rede: 192.168.10.0/24\n\nPC-A1: 192.168.10.10\nMáscara: 255.255.255.0\nGateway: 192.168.10.1\n\nQuando destino está fora de 192.168.10.x, envia para o Gateway!', CYAN);
    addBox(s, 4.85, 1.8, 3.6, 4.3, 'Roteador R1-CORE', 'Liga duas redes diferentes:\n\n• fa0/0: 192.168.10.1/24\n• fa0/1: 10.0.20.1/24\n\nConsulta tabela de rotas e encaminha o pacote decrementando o TTL em 1.', AMBER);
    addBox(s, 9.05, 1.8, 3.6, 4.3, 'Sub-rede B (Servidores)', 'Rede: 10.0.20.0/24\n\nSRV-APP: 10.0.20.50\nMáscara: 255.255.255.0\nGateway: 10.0.20.1\n\nAtenção: SRV-APP também precisa de Gateway para responder de volta!', EMERALD);
  }

  // SLIDE 16 — CONFIGURAÇÃO LAN NO LINUX
  {
    const s = newSlide(
      'Unidade 4 · Aulas 15 e 16',
      'Configurando uma LAN no Linux (ip, ifconfig e dhclient)',
      'Abra Estudar -> Redes -> Configuração LAN (Linux). Alterne entre DHCP e IP Estático e entre ip (moderno) e ifconfig (clássico).'
    );
    const rows = [
      [
        { text: 'Passo', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
        { text: 'Moderno (iproute2)', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
        { text: 'Clássico (net-tools)', options: { bold: true, color: WHITE, fill: { color: CARD2 } } },
      ],
      ['1. Ativar Interface', 'sudo ip link set eth0 up', 'sudo ifconfig eth0 up'],
      ['2. IP Automático', 'sudo dhclient -v eth0', 'sudo dhclient -v eth0'],
      ['3. IP Estático', 'sudo ip addr add 192.168.10.25/24 dev eth0', 'sudo ifconfig eth0 192.168.10.25 netmask 255.255.255.0'],
      ['4. Gateway Padrão', 'sudo ip route add default via 192.168.10.1', 'sudo route add default gw 192.168.10.1'],
      ['5. DNS & Validação', 'ip neigh  &&  ping 192.168.10.1  &&  ss -tulnp', 'arp -a  &&  ping 192.168.10.1  &&  netstat -tulnp'],
    ];
    s.addTable(rows as PptxGenJS.TableRow[], {
      x: 0.65,
      y: 1.55,
      w: 12.0,
      fontSize: 11.5,
      color: WHITE,
      fill: { color: CARD },
      border: { pt: 1, color: BORDER },
      colW: [2.4, 4.8, 4.8],
      rowH: 0.78,
    });
  }

  // SLIDE 17 — TROUBLESHOOTING DE REDES
  {
    const s = newSlide(
      'Unidade 4 · Aulas 15 e 16',
      'Método de Ouro do Troubleshooting (Camada 1 até 7)',
      'Reforce que técnicos experientes nunca chutam: testam de baixo para cima para isolar a causa raiz em menos de 2 minutos.'
    );
    const steps = [
      ['1. Cabo & Interface (L1/L2)', 'ip link show / LEDs verdes no Switch'],
      ['2. Endereçamento IP (L3)', 'ip addr / máscara e sub-rede corretas'],
      ['3. Pilha Local (Loopback)', 'ping 127.0.0.1 — testa o próprio SO'],
      ['4. Rede Local & ARP', 'ping <gateway> + ip neigh / arp -a'],
      ['5. Rota Externa (Saltos)', 'ping 8.8.8.8 + traceroute <destino>'],
      ['6. DNS & Serviços (L7)', 'nslookup <domínio> + ss -tulnp / curl'],
    ];
    steps.forEach(([t, d], idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      addBox(s, 0.65 + col * 6.15, 1.5 + row * 1.78, 5.85, 1.58, t, d, idx < 2 ? CYAN : idx < 4 ? AMBER : EMERALD);
    });
  }

  // SLIDE 18 — LINUX ESSENCIAL (FHS & COMANDOS)
  {
    const s = newSlide(
      'Unidade 4 · Aulas 15 e 16',
      'Linux Essencial: Diretórios FHS e Comandos do Dia a Dia',
      'Abra o Terminal Linux interativo no PyNetSec e peça que os alunos explorem /etc, /var/log e /home usando ls, cd, cat e grep.'
    );
    addBox(
      s,
      0.65,
      1.6,
      5.8,
      4.9,
      'Diretórios FHS Essenciais',
      '• /         Raiz de todo o sistema de arquivos\n• /etc      Arquivos de configuração (rede, DNS, usuários)\n• /var/log  Registros de eventos e auditoria (auth.log)\n• /home     Pastas pessoais dos usuários\n• /bin      Comandos essenciais do sistema\n• /tmp      Arquivos temporários',
      CYAN
    );
    addBox(
      s,
      6.75,
      1.6,
      5.9,
      4.9,
      'Comandos Indispensáveis',
      '• pwd / ls -la / cd        Navegação e permissões\n• cat / head / tail        Leitura de logs e configs\n• grep "Failed" auth.log   Filtrar ataques em logs\n• chmod 600 chave.pem      Proteger permissões\n• sudo apt update          Gerenciar pacotes\n• sudo ufw status          Firewall local Ubuntu',
      EMERALD
    );
  }

  // SLIDE 19 — SEGURANÇA DA INFORMAÇÃO: TRÍADE CID
  {
    const s = newSlide(
      'Unidade 5 · Aulas 17 e 18',
      'Segurança da Informação: A Tríade CID',
      'Conecte com exemplos próximos dos alunos: vazamento de notas (Confidencialidade), adulteração de boletim (Integridade) e site fora do ar por DDoS/Ransomware (Disponibilidade).'
    );
    addBox(s, 0.65, 1.75, 3.75, 4.6, 'Confidencialidade (C)', 'Garantir que a informação só seja acessada por pessoas autorizadas.\n\nControles: Criptografia, senhas fortes, MFA e controle de acesso.\n\nAmeaça: Vazamento, sniffing sem TLS, phishing.', CYAN);
    addBox(s, 4.78, 1.75, 3.75, 4.6, 'Integridade (I)', 'Garantir que os dados não sejam alterados sem autorização no trânsito ou armazenamento.\n\nControles: Hash SHA-256, assinatura digital, logs.\n\nAmeaça: Adulteração de arquivos ou Man-in-the-Middle.', EMERALD);
    addBox(s, 8.91, 1.75, 3.75, 4.6, 'Disponibilidade (D)', 'Garantir que sistemas e dados estejam acessíveis quando necessários.\n\nControles: Backups, redundância (Anel), nobreaks, anti-DDoS.\n\nAmeaça: Ransomware, queda de link, ataque DDoS.', AMBER);
  }

  // SLIDE 20 — CONCEITOS DE DEFESA: FIREWALL, CRIPTOGRAFIA E IDS/IPS
  {
    const s = newSlide(
      'Unidade 5 · Aulas 17 e 18',
      'Defesa em Profundidade: Firewall, Criptografia e IDS/IPS',
      'Oriente os alunos a abrirem Estudar -> 03. Segurança da Informação para concluir as 4 Missões Teóricas de Defesa (D01–D04) e conquistar as Badges.'
    );
    addBox(s, 0.65, 1.65, 3.75, 4.75, 'Firewall (Perímetro)', 'Filtra tráfego por IP, porta e protocolo.\n\nRegra de ouro: Negação padrão (Deny All) + liberar apenas o necessário (ex.: 443).\n\nNo Linux: ufw / iptables.', CYAN);
    addBox(s, 4.78, 1.65, 3.75, 4.75, 'Criptografia & Hash', '• Simétrica (AES): 1 chave rápida\n• Assimétrica (RSA): chave pública + privada\n• Hash (SHA-256): impressão digital irreversível\n\nAtenção: Base64 NÃO é criptografia!', EMERALD);
    addBox(s, 8.91, 1.65, 3.75, 4.75, 'IDS × IPS', '• IDS (Detecção): observa cópia do tráfego e gera alertas ao SOC (passivo).\n\n• IPS (Prevenção): fica em linha (inline) e bloqueia ataques automaticamente em tempo real.', ROSE);
  }

  // SLIDE 21 — BLUE TEAM, RED TEAM E PURPLE TEAM
  {
    const s = newSlide(
      'Unidade 5 · Aulas 19 e 20',
      'Cultura Ética: Blue Team, Red Team e Purple Team',
      'Antes de liberar as Missões M20A e M20B, faça a leitura coletiva do Termo de Ética no PyNetSec. Enfatize a reflexão Purple Team (propor 2 correções reais).'
    );
    addBox(s, 0.65, 1.75, 3.75, 4.5, 'Blue Team (Defesa)', 'Monitora logs, fecha portas, configura firewall, aplica patches e investiga incidentes.\n\nNo PyNetSec: Missão 20A (Forense) + Badges D01–D04.', CYAN);
    addBox(s, 4.78, 1.75, 3.75, 4.5, 'Red Team Ético (Auditoria)', 'Testa falhas apenas com autorização em laboratório controlado para descobrir riscos antes de atacantes reais.\n\nNo PyNetSec: Missão 20B (alvo 100% local simulado).', ROSE);
    addBox(s, 8.91, 1.75, 3.75, 4.5, 'Purple Team (Integração)', 'Une ataque ético + defesa: cada vulnerabilidade encontrada gera uma correção concreta.\n\nEx.: Remover /backup exposto + Rate Limit contra força bruta.', 'A78BFA');
  }

  // SLIDE 22 — AVALIAÇÃO E PRÓXIMOS PASSOS
  {
    const s = newSlide(
      'Encerramento & Avaliação',
      'Critérios de Avaliação e Desafios Finais',
      'Apresente os pesos da rubrica para a turma e abra o Placar (Ranking) e o Mural de Badges para celebrar as conquistas.'
    );
    addBox(
      s,
      0.65,
      1.65,
      6.0,
      4.8,
      'Rubrica de Avaliação Formativa (100%)',
      '• 25% — Lógica & Scripts Python (Circuitos 01 e 02)\n• 25% — Redes & Packet Tracer (Montagem, DHCP e Roteamento)\n• 25% — Linux & Troubleshooting (Circuito 05 + Check-list LAN)\n• 25% — Segurança, Badges de Defesa (D01–D04) e Ética Purple Team',
      CYAN
    );
    addBox(
      s,
      6.95,
      1.65,
      5.7,
      4.8,
      'Checklist Final do Estudante',
      '✓ Nome e Turma cadastrados no Perfil\n✓ 4 Badges de Defesa conquistadas\n✓ Cenários do Packet Tracer validados\n✓ Reflexão Purple Team registrada na M20B\n✓ Missões da Trilha enviadas ao Ranking da Turma',
      EMERALD
    );
  }

  await pptx.writeFile({ fileName: path.join(OUT_DIR, 'PyNetSec_Apresentacao_Aulas.pptx') });
}

async function main() {
  ensureDir(OUT_DIR);
  console.log('Generating PyNetSec educational materials in', OUT_DIR);
  await generateStudentDocx();
  console.log('✓ PyNetSec_Ebook_Aluno.docx');
  await generateTeacherDocx();
  console.log('✓ PyNetSec_Guia_Professor.docx');
  await generateStudentPdf();
  console.log('✓ PyNetSec_Ebook_Aluno.pdf');
  await generateTeacherPdf();
  console.log('✓ PyNetSec_Guia_Professor.pdf');
  await generatePowerPoint();
  console.log('✓ PyNetSec_Apresentacao_Aulas.pptx');
  console.log('All 5 files generated successfully!');
}

main().catch((err) => {
  console.error('Failed to generate materials:', err);
  process.exit(1);
});
