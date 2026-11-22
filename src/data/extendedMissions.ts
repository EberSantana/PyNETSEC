import { Mission } from '../types/ctf';

const MISSION_50_SETUP = `auth_log = [
    "03:10:01 sshd Failed password for root from 203.0.113.77 port 51200",
    "03:10:04 sshd Accepted password for aluno from 192.168.1.20 port 51211",
    "03:10:09 sshd Failed password for root from 203.0.113.77 port 51245",
    "03:10:14 sshd Failed password for admin from 198.51.100.8 port 51260",
    "03:10:19 sshd Failed password for root from 203.0.113.77 port 51299",
    "03:10:25 sshd Failed password for root from 203.0.113.77 port 51310",
]

arquivos_perm = {
    "/etc/ssh/sshd_config": "600",
    "/etc/app.conf": "777",
    "/var/log/syslog": "640",
}

token_b64 = "TUlTU0FPXzUwX0NPTkNMVUlEQQ=="
`;

export const EXTENDED_MISSIONS: Mission[] = [
  // =========================================================================
  // CIRCUITO 4: ARQUITETURA DE REDES & PROTOCOLOS — MISSÕES 22 A 35 (14 MISSÕES)
  // =========================================================================
  {
    id: 'M22',
    order: 22,
    circuit: 4,
    title: 'Modelo OSI: As 7 Camadas',
    topic: 'Modelo OSI',
    teamRole: 'network',
    durationMinutes: 3,
    points: 100,
    microLesson: [
      'O Modelo OSI divide a comunicação de rede em 7 camadas, de baixo para cima: 1 Física, 2 Enlace, 3 Rede, 4 Transporte, 5 Sessão, 6 Apresentação e 7 Aplicação.',
      'A camada 3 (Rede) cuida do endereçamento lógico IP e roteamento; já a camada 7 (Aplicação) entrega serviços como HTTP, HTTPS e DNS ao usuário.',
      'Usando dicionários em Python, podemos mapear rapidamente cada número de camada ao seu nome oficial.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `osi = {1: "Fisica", 4: "Transporte"}
print(f"Camada 4: {osi[4]}")`,
    objective:
      'Complete os acessos ao dicionário camadas_osi para imprimir: Camada 3: Rede e Camada 7: Aplicacao.',
    starterCode: `camadas_osi = {
    1: "Fisica",
    2: "Enlace de Dados",
    3: "Rede",
    4: "Transporte",
    5: "Sessao",
    6: "Apresentacao",
    7: "Aplicacao",
}

# COMPLETE AQUI usando as chaves 3 e 7 do dicionário camadas_osi
print(f"Camada 3: {camadas_osi[]}")
print(f"Camada 7: {camadas_osi[]}")`,
    hints: [
      'Em um dicionário cujas chaves são números inteiros, acesse com camadas_osi[3] e camadas_osi[7].',
      'As linhas completas ficam: print(f"Camada 3: {camadas_osi[3]}") e print(f"Camada 7: {camadas_osi[7]}")',
    ],
    flag: 'FLAG{osi_7_camadas_22}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (text.includes('Camada 3: Rede') && text.includes('Camada 7: Aplicacao')) {
        return { passed: true, feedback: 'Camadas 3 (Rede) e 7 (Aplicação) identificadas corretamente!' };
      }
      return {
        passed: false,
        feedback: 'Imprima exatamente "Camada 3: Rede" e "Camada 7: Aplicacao".',
      };
    },
  },
  {
    id: 'M23',
    order: 23,
    circuit: 4,
    title: 'Encapsulamento OSI: Segmento ao Bit',
    topic: 'Modelo OSI',
    teamRole: 'network',
    durationMinutes: 3,
    points: 100,
    microLesson: [
      'Quando os dados descem da camada 4 até a camada 1 (encapsulamento), ganham nomes específicos: Segmentos (4), Pacotes (3), Quadros/Frames (2) e Bits (1).',
      'A função range(4, 0, -1) gera a contagem regressiva 4, 3, 2, 1 automaticamente.',
      'Conhecer cada unidade de dado (PDU) ajuda a diagnosticar se o problema está no cabo (bits), no switch (quadros) ou no roteador (pacotes).',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `for n in range(3, 0, -1):
    print(n)  # 3, 2, 1`,
    objective:
      'Complete o range regressivo de 4 até 1 para exibir a descida do encapsulamento de Segmentos até Bits.',
    starterCode: `pdus = {
    4: "Segmentos",
    3: "Pacotes",
    2: "Quadros",
    1: "Bits",
}

# COMPLETE AQUI usando range(4, 0, -1)
for camada in range():
    print(f"Camada {camada} -> {pdus[camada]}")`,
    hints: [
      'Para contar de 4 até 1 de trás para frente, use range(4, 0, -1) — o segundo valor (0) não é incluído.',
      'A linha fica: for camada in range(4, 0, -1):',
    ],
    flag: 'FLAG{encapsulamento_osi_23}',
    validate: (stdout) => {
      const lines = stdout.trim().split('\n').map((l) => l.trim());
      const expected = [
        'Camada 4 -> Segmentos',
        'Camada 3 -> Pacotes',
        'Camada 2 -> Quadros',
        'Camada 1 -> Bits',
      ];
      if (expected.every((line, idx) => lines[idx] === line)) {
        return { passed: true, feedback: 'Fluxo de encapsulamento da Camada 4 até a Camada 1 dominado!' };
      }
      return {
        passed: false,
        feedback: 'Imprima em ordem decrescente: Camada 4 -> Segmentos até Camada 1 -> Bits.',
      };
    },
  },
  {
    id: 'M24',
    order: 24,
    circuit: 4,
    title: 'Tipos de Rede: Escala PAN até WAN',
    topic: 'Tipos de Rede',
    teamRole: 'network',
    durationMinutes: 3,
    points: 110,
    microLesson: [
      'Redes são classificadas pelo alcance geográfico: PAN (até 10 m), LAN (residência/escola), CAN (campus), MAN (cidade) e WAN (países/continentes).',
      'Usando if / elif / else, classificamos automaticamente qualquer distância em metros na categoria correta.',
      'Lembre-se de testar do menor alcance para o maior para evitar que a primeira condição capture tudo.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if d <= 10:
    tipo = "PAN"
elif d <= 500:
    tipo = "LAN"`,
    objective:
      'Complete as faixas do classificador para rotular corretamente 5 m (PAN), 80 m (LAN), 1200 m (CAN), 25000 m (MAN) e 5000000 m (WAN).',
    starterCode: `distancias = [5, 80, 1200, 25000, 5000000]

for d in distancias:
    if d <= 10:
        tipo = "PAN"
    elif d <= 500:
        tipo = "LAN"
    elif d <= 5000:
        # COMPLETE AQUI com "CAN"
        tipo = ""
    elif d <= 50000:
        tipo = "MAN"
    else:
        # COMPLETE AQUI com "WAN"
        tipo = ""
    print(f"{d}m -> {tipo}")`,
    hints: [
      'Entre 500 m e 5 km (campus universitário) usamos CAN; acima de 50 km (longa distância/internet) usamos WAN.',
      'Preencha tipo = "CAN" no terceiro bloco e tipo = "WAN" no bloco else.',
    ],
    flag: 'FLAG{escala_pan_wan_24}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (
        text.includes('5m -> PAN') &&
        text.includes('80m -> LAN') &&
        text.includes('1200m -> CAN') &&
        text.includes('25000m -> MAN') &&
        text.includes('5000000m -> WAN')
      ) {
        return { passed: true, feedback: 'Todas as escalas geográficas de rede classificadas!' };
      }
      return {
        passed: false,
        feedback: 'Verifique se 1200m retornou CAN e 5000000m retornou WAN.',
      };
    },
  },
  {
    id: 'M25',
    order: 25,
    circuit: 4,
    title: 'Redes Especiais: WLAN, SAN e VPN',
    topic: 'Tipos de Rede',
    teamRole: 'network',
    durationMinutes: 3,
    points: 110,
    microLesson: [
      'Além do alcance físico, redes têm funções especializadas: WLAN (LAN sem fio/Wi-Fi), SAN (rede dedicada de alta velocidade para armazenamento em data centers) e VPN (túnel criptografado sobre internet pública).',
      'Um dicionário associando cada necessidade corporativa à sigla correta automatiza a recomendação de arquitetura.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `solucoes = {"wifi": "WLAN"}
print(solucoes["wifi"])`,
    objective:
      'Complete o dicionário solucoes mapeando "acesso_remoto_seguro" para "VPN" e "armazenamento_datacenter" para "SAN".',
    starterCode: `solucoes = {
    "wifi_escola": "WLAN",
    # COMPLETE AQUI os valores de VPN e SAN
    "acesso_remoto_seguro": "",
    "armazenamento_datacenter": "",
}

for caso, sigla in solucoes.items():
    print(f"{caso} -> {sigla}")`,
    hints: [
      'VPN cria um túnel criptografado para acesso remoto; SAN conecta servidores a grandes volumes de armazenamento.',
      'Preencha "acesso_remoto_seguro": "VPN" e "armazenamento_datacenter": "SAN".',
    ],
    flag: 'FLAG{wlan_san_vpn_25}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (
        text.includes('wifi_escola -> WLAN') &&
        text.includes('acesso_remoto_seguro -> VPN') &&
        text.includes('armazenamento_datacenter -> SAN')
      ) {
        return { passed: true, feedback: 'Arquiteturas WLAN, VPN e SAN mapeadas com precisão!' };
      }
      return {
        passed: false,
        feedback: 'Associe acesso_remoto_seguro -> VPN e armazenamento_datacenter -> SAN.',
      };
    },
  },
  {
    id: 'M26',
    order: 26,
    circuit: 4,
    title: 'Topologias de Rede e Redundância',
    topic: 'Topologias de Rede',
    teamRole: 'network',
    durationMinutes: 3,
    points: 110,
    microLesson: [
      'Topologias definem como os nós são interligados: Estrela, Anel, Barramento, Árvore, Malha (Mesh) e Híbrida.',
      'Enquanto Barramento e Anel simples param toda a rede se houver rompimento, Malha (Mesh) possui múltiplos caminhos redundantes com alta tolerância a falhas.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `for nome, dados in topologias.items():
    if dados["tolerancia"] == "alta":
        print(nome)`,
    objective:
      'Filtre o dicionário topologias e imprima apenas as topologias cuja chave "tolerancia" seja igual a "alta".',
    starterCode: `topologias = {
    "Estrela": {"tolerancia": "media", "central": True},
    "Anel": {"tolerancia": "baixa", "central": False},
    "Barramento": {"tolerancia": "baixa", "central": False},
    "Mesh": {"tolerancia": "alta", "central": False},
    "Hibrida": {"tolerancia": "alta", "central": True},
}

for nome, info in topologias.items():
    # COMPLETE AQUI verificando se info["tolerancia"] == "alta"
    if :
        print(f"Alta resiliencia: {nome}")`,
    hints: [
      'Compare o campo info["tolerancia"] com a string "alta" usando ==.',
      'A linha fica: if info["tolerancia"] == "alta":',
    ],
    flag: 'FLAG{topologias_resilientes_26}',
    validate: (stdout) => {
      const lines = stdout.trim().split('\n').map((l) => l.trim());
      if (
        lines.length === 2 &&
        lines.includes('Alta resiliencia: Mesh') &&
        lines.includes('Alta resiliencia: Hibrida')
      ) {
        return { passed: true, feedback: 'Topologias Mesh e Híbrida selecionadas pela alta resiliência!' };
      }
      return {
        passed: false,
        feedback: 'Imprima apenas Mesh e Hibrida como "Alta resiliencia: <nome>".',
      };
    },
  },
  {
    id: 'M27',
    order: 27,
    circuit: 4,
    title: 'Ponto Único de Falha (SPOF)',
    topic: 'Topologias de Rede',
    teamRole: 'network',
    durationMinutes: 3,
    points: 120,
    microLesson: [
      'Na topologia em Estrela, se um PC cai, os outros continuam funcionando — porém se o Switch central cair, toda a rede para (Ponto Único de Falha).',
      'Já na topologia Mesh, mesmo com a queda de um nó ou enlace, o tráfego é roteado por caminhos alternativos.',
      'Combine and e not em Python para detectar cenários críticos sem redundância.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if falha and not redundancia:
    print("PARADA TOTAL")`,
    objective:
      'Complete a condição if para marcar "OFFLINE" quando central_caiu for True e redundancia for False.',
    starterCode: `simulacao = [
    ("Estrela (Switch caiu)", True, False),
    ("Mesh (No N1 caiu)", True, True),
    ("Barramento (Cabo cortado)", True, False),
]

for cenario, central_caiu, redundancia in simulacao:
    # COMPLETE AQUI usando: central_caiu and not redundancia
    if :
        print(f"{cenario}: OFFLINE")
    else:
        print(f"{cenario}: ONLINE (rota alternativa)")`,
    hints: [
      'Use os operadores lógicos and e not para testar se houve falha sem redundância.',
      'A linha fica: if central_caiu and not redundancia:',
    ],
    flag: 'FLAG{spof_detectado_27}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (
        text.includes('Estrela (Switch caiu): OFFLINE') &&
        text.includes('Mesh (No N1 caiu): ONLINE (rota alternativa)') &&
        text.includes('Barramento (Cabo cortado): OFFLINE')
      ) {
        return { passed: true, feedback: 'Simulação de Ponto Único de Falha validada!' };
      }
      return {
        passed: false,
        feedback: 'Estrela e Barramento devem ficar OFFLINE e Mesh deve permanecer ONLINE.',
      };
    },
  },
  {
    id: 'M28',
    order: 28,
    circuit: 4,
    title: 'Meios Guiados: Cabos e Fibra Óptica',
    topic: 'Meios de Transmissão',
    teamRole: 'network',
    durationMinutes: 3,
    points: 110,
    microLesson: [
      'Meios guiados conduzem o sinal fisicamente: Par Trançado (UTP/RJ-45), Cabo Coaxial e Fibra Óptica.',
      'A Fibra Óptica transmite pulsos de luz, alcança quilômetros com baixa atenuação e é 100% imune a interferência eletromagnética (EMI).',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if cabo["sinal"] == "luz" and cabo["imune_emi"]:
    print(cabo["nome"])`,
    objective:
      'Percorra a lista cabos e imprima o nome do meio guiado que usa sinal de "luz" e possui imunidade a EMI.',
    starterCode: `cabos = [
    {"nome": "Par Trancado UTP", "sinal": "eletrico", "imune_emi": False},
    {"nome": "Cabo Coaxial", "sinal": "eletrico", "imune_emi": False},
    {"nome": "Fibra Optica", "sinal": "luz", "imune_emi": True},
]

for cabo in cabos:
    # COMPLETE AQUI checando se cabo["sinal"] == "luz" e cabo["imune_emi"]
    if :
        print(f"Escolhido: {cabo['nome']}")`,
    hints: [
      'Verifique cabo["sinal"] == "luz" and cabo["imune_emi"] na condição if.',
      'A linha completa fica: if cabo["sinal"] == "luz" and cabo["imune_emi"]:',
    ],
    flag: 'FLAG{fibra_imune_emi_28}',
    validate: (stdout) => {
      if (stdout.trim() === 'Escolhido: Fibra Optica') {
        return { passed: true, feedback: 'Fibra Óptica selecionada corretamente pela imunidade a EMI!' };
      }
      return {
        passed: false,
        feedback: 'A saída esperada é exatamente "Escolhido: Fibra Optica".',
      };
    },
  },
  {
    id: 'M29',
    order: 29,
    circuit: 4,
    title: 'Meios Não Guiados e Barreiras Físicas',
    topic: 'Meios de Transmissão',
    teamRole: 'network',
    durationMinutes: 3,
    points: 110,
    microLesson: [
      'Meios não guiados propagam ondas pelo ar: Ondas de Rádio / Wi-Fi, Micro-ondas e Infravermelho.',
      'O Infravermelho (ex.: controle remoto) exige linha de visada direta e não atravessa paredes, ao contrário de ondas de rádio e Wi-Fi.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `validos = [m["nome"] for m in lista if m["atravessa_parede"]]`,
    objective:
      'Conte e imprima quantos meios sem fio da lista atravessam paredes (esperado: 2 — Wi-Fi e Ondas de Radio).',
    starterCode: `sem_fio = [
    {"nome": "Wi-Fi (2.4/5 GHz)", "atravessa_parede": True},
    {"nome": "Ondas de Radio", "atravessa_parede": True},
    {"nome": "Micro-ondas (visada)", "atravessa_parede": False},
    {"nome": "Infravermelho", "atravessa_parede": False},
]

aprovados = []
for meio in sem_fio:
    # COMPLETE AQUI adicionando meio["nome"] quando atravessa_parede for True
    if meio["atravessa_parede"]:
        aprovados.append()

print(f"Atravessam paredes ({len(aprovados)}): {', '.join(aprovados)}")`,
    hints: [
      'Passe meio["nome"] dentro de aprovados.append(...).',
      'A linha fica: aprovados.append(meio["nome"])',
    ],
    flag: 'FLAG{meios_sem_fio_29}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (text.includes('Atravessam paredes (2):') && text.includes('Wi-Fi') && text.includes('Ondas de Radio')) {
        return { passed: true, feedback: 'Comportamento de propagação sem fio validado!' };
      }
      return {
        passed: false,
        feedback: 'Adicione meio["nome"] para listar os 2 meios que atravessam paredes.',
      };
    },
  },
  {
    id: 'M30',
    order: 30,
    circuit: 4,
    title: 'Simplex, Half-Duplex e Full-Duplex',
    topic: 'Modos de Transmissão',
    teamRole: 'network',
    durationMinutes: 3,
    points: 110,
    microLesson: [
      'Simplex transmite em sentido único (TV, rádio FM). Half-Duplex vai nos dois sentidos, mas um de cada vez (walkie-talkie).',
      'Full-Duplex envia e recebe simultaneamente (telefone, Ethernet moderna com switch), dobrando a fluidez da comunicação.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `for nome, modo in lista:
    if modo == "Full-Duplex":
        total += 1`,
    objective:
      'Percorra a lista dispositivos, conte quantos operam em "Full-Duplex" e imprima: Full-Duplex: 2',
    starterCode: `dispositivos = [
    ("Radio FM", "Simplex"),
    ("Walkie-Talkie", "Half-Duplex"),
    ("Telefone Celular", "Full-Duplex"),
    ("Switch Ethernet Gigabit", "Full-Duplex"),
    ("Teclado USB", "Simplex"),
]

simultaneos = 0
for nome, modo in dispositivos:
    # COMPLETE AQUI contando os dispositivos "Full-Duplex"
    if modo == "":
        simultaneos += 1

print(f"Full-Duplex: {simultaneos}")`,
    hints: [
      'Compare a variável modo com a string exata "Full-Duplex".',
      'A linha fica: if modo == "Full-Duplex":',
    ],
    flag: 'FLAG{modos_duplex_30}',
    validate: (stdout) => {
      if (stdout.trim() === 'Full-Duplex: 2') {
        return { passed: true, feedback: 'Modos Simplex, Half-Duplex e Full-Duplex diferenciados!' };
      }
      return {
        passed: false,
        feedback: 'A saída esperada é "Full-Duplex: 2".',
      };
    },
  },
  {
    id: 'M31',
    order: 31,
    circuit: 4,
    title: 'Protocolos Cotidianos: HTTPS e Erro de DNS',
    topic: 'Protocolos no Dia a Dia',
    teamRole: 'network',
    durationMinutes: 3,
    points: 120,
    microLesson: [
      'No navegador, "https://" indica tráfego criptografado (cadeado), enquanto "http://" trafega em texto claro.',
      'O erro clássico "DNS_PROBE_FINISHED_NXDOMAIN" significa que o DNS não conseguiu traduzir o nome do domínio em um endereço IP.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if url.startswith("https://"):
    print("Criptografado")`,
    objective:
      'Conte quantos links usam "https://" (esperado: 2) e verifique se a mensagem de erro contém "DNS" para exibir o diagnóstico.',
    starterCode: `urls = [
    "https://portal.if.edu.br",
    "http://intranet-antiga.local",
    "https://github.com",
]
erro_navegador = "DNS_PROBE_FINISHED_NXDOMAIN"

seguros = 0
for u in urls:
    # COMPLETE AQUI verificando se u começa com "https://"
    if u.startswith(""):
        seguros += 1

# COMPLETE AQUI verificando se "DNS" está em erro_navegador
diagnostico = "FALHA_DNS" if "" in erro_navegador else "OUTRO"
print(f"HTTPS: {seguros} | Erro: {diagnostico}")`,
    hints: [
      'Use u.startswith("https://") no loop e "DNS" in erro_navegador na expressão condicional.',
      'Linhas completas: if u.startswith("https://"): e diagnostico = "FALHA_DNS" if "DNS" in erro_navegador else "OUTRO"',
    ],
    flag: 'FLAG{https_dns_cotidiano_31}',
    validate: (stdout) => {
      if (stdout.trim() === 'HTTPS: 2 | Erro: FALHA_DNS') {
        return { passed: true, feedback: 'Inspeção de HTTPS e erro NXDOMAIN de DNS concluída!' };
      }
      return {
        passed: false,
        feedback: 'A saída esperada é "HTTPS: 2 | Erro: FALHA_DNS".',
      };
    },
  },
  {
    id: 'M32',
    order: 32,
    circuit: 4,
    title: 'Portas IANA TCP/UDP: E-mail, Arquivos e Faixas',
    topic: 'Portas TCP/UDP (IANA)',
    teamRole: 'network',
    durationMinutes: 4,
    points: 120,
    microLesson: [
      'A IANA divide as portas TCP/UDP em 3 faixas: 0–1023 (Bem Conhecidas: SSH 22, DNS 53, HTTP 80, HTTPS 443, SMB 445, SMTP 587), 1024–49151 (Registradas: MySQL 3306, RDP 3389, PostgreSQL 5432) e 49152–65535 (Dinâmicas/Efêmeras).',
      'Para arquivos e e-mails: SFTP usa porta 22 (segura), SMTP usa 587 (submissão oficial) e FTP usa 20/21 sem criptografia.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if porta <= 1023:
    faixa = "BEM_CONHECIDA"
elif porta <= 49151:
    faixa = "REGISTRADA"`,
    objective:
      'Filtre os protocolos seguros de "arquivo" (SFTP:22) e "envio_email" (SMTP:587) e classifique a porta 5432 (PostgreSQL) na faixa IANA correta ("REGISTRADA").',
    starterCode: `protocolos = [
    {"nome": "FTP", "porta": 21, "funcao": "arquivo", "seguro": False},
    {"nome": "SFTP", "porta": 22, "funcao": "arquivo", "seguro": True},
    {"nome": "SMB", "porta": 445, "funcao": "compartilhamento_lan", "seguro": True},
    {"nome": "SMTP", "porta": 587, "funcao": "envio_email", "seguro": True},
    {"nome": "IMAP", "porta": 993, "funcao": "leitura_email", "seguro": True},
]

for p in protocolos:
    # COMPLETE AQUI: imprima se for (funcao == "arquivo" e seguro) OU funcao == "envio_email"
    if (p["funcao"] == "arquivo" and p["seguro"]) or p["funcao"] == "":
        print(f"{p['nome']}:{p['porta']}")

porta_pg = 5432
if porta_pg <= 1023:
    faixa = "BEM_CONHECIDA"
elif porta_pg <= 49151:
    # COMPLETE AQUI com "REGISTRADA"
    faixa = ""
else:
    faixa = "DINAMICA"
print(f"Porta {porta_pg}: {faixa}")`,
    hints: [
      'Compare p["funcao"] == "envio_email" no primeiro bloco e preencha faixa = "REGISTRADA" (faixa 1024 a 49151 da IANA).',
      'Linhas: or p["funcao"] == "envio_email":  e  faixa = "REGISTRADA"',
    ],
    flag: 'FLAG{portas_iana_32}',
    validate: (stdout) => {
      const lines = stdout.trim().split('\n').map((l) => l.trim());
      if (
        lines.includes('SFTP:22') &&
        lines.includes('SMTP:587') &&
        lines.includes('Porta 5432: REGISTRADA')
      ) {
        return { passed: true, feedback: 'Portas SFTP (22), SMTP (587) e faixa Registrada IANA (5432) validadas!' };
      }
      return {
        passed: false,
        feedback: 'Imprima SFTP:22, SMTP:587 e "Porta 5432: REGISTRADA".',
      };
    },
  },
  {
    id: 'M33',
    order: 33,
    circuit: 4,
    title: 'TCP: Three-Way Handshake e Retransmissão',
    topic: 'Protocolos TCP e UDP',
    teamRole: 'network',
    durationMinutes: 4,
    points: 130,
    microLesson: [
      'O TCP garante entrega confiável abrindo a conexão em 3 etapas: SYN → SYN-ACK → ACK (Three-Way Handshake).',
      'Se um segmento se perde no trajeto, o remetente detecta a falta do ACK e faz a retransmissão automática para entregar tudo em ordem.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if fluxo[:3] == ["SYN", "SYN-ACK", "ACK"]:
    print("Handshake OK")`,
    objective:
      'Valide se os 3 primeiros eventos completam o handshake TCP e conte quantos pacotes tiveram "REENVIO" na sessão.',
    starterCode: `eventos_tcp = ["SYN", "SYN-ACK", "ACK", "DATA#1", "DROP#2", "REENVIO#2", "ACK#2", "DATA#3", "FIN"]

# COMPLETE AQUI verificando se eventos_tcp[:3] == ["SYN", "SYN-ACK", "ACK"]
handshake_ok = eventos_tcp[:3] == 

reenvios = 0
for ev in eventos_tcp:
    if ev.startswith("REENVIO"):
        reenvios += 1

status = "OK" if handshake_ok else "ERRO"
print(f"Handshake: {status} | Retransmissoes: {reenvios}")`,
    hints: [
      'Compare a fatia eventos_tcp[:3] com a lista ["SYN", "SYN-ACK", "ACK"].',
      'A linha fica: handshake_ok = eventos_tcp[:3] == ["SYN", "SYN-ACK", "ACK"]',
    ],
    flag: 'FLAG{tcp_handshake_33}',
    validate: (stdout) => {
      if (stdout.trim() === 'Handshake: OK | Retransmissoes: 1') {
        return { passed: true, feedback: 'Three-Way Handshake e retransmissão TCP validados!' };
      }
      return {
        passed: false,
        feedback: 'A saída esperada é "Handshake: OK | Retransmissoes: 1".',
      };
    },
  },
  {
    id: 'M34',
    order: 34,
    circuit: 4,
    title: 'UDP vs. TCP: Cabeçalho e Tempo Real',
    topic: 'Protocolos TCP e UDP',
    teamRole: 'network',
    durationMinutes: 4,
    points: 130,
    microLesson: [
      'O cabeçalho mínimo do TCP tem 20 bytes (controle completo), enquanto o do UDP tem apenas 8 bytes fixos (velocidade máxima).',
      'Por isso, jogos online, VoIP, lives e consultas DNS usam UDP; já downloads, SSH e HTTPS tradicional usam TCP.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `proto = "UDP" if tempo_real else "TCP"
overhead = pacotes * 8`,
    objective:
      'Escolha "UDP" para aplicações de tempo real e "TCP" para as demais, e calcule o total de bytes de cabeçalho para 100 pacotes UDP (800 B) e 100 TCP (2000 B).',
    starterCode: `apps = [
    ("Videochamada Meet", True),
    ("Jogo FPS Online", True),
    ("Download ISO Linux", False),
    ("Site Bancario HTTPS", False),
]

for nome, tempo_real in apps:
    # COMPLETE AQUI escolhendo "UDP" se tempo_real for True, senão "TCP"
    proto = "" if tempo_real else ""
    print(f"{nome} -> {proto}")

# COMPLETE AQUI: 100 pacotes * 8 bytes (UDP) e 100 * 20 bytes (TCP)
bytes_udp = 100 * 
bytes_tcp = 100 * 
print(f"Overhead 100 pacotes -> UDP: {bytes_udp}B | TCP: {bytes_tcp}B")`,
    hints: [
      'Use "UDP" quando tempo_real for True e "TCP" no else. Multiplique 100 por 8 (UDP) e por 20 (TCP).',
      'Linhas: proto = "UDP" if tempo_real else "TCP", bytes_udp = 100 * 8, bytes_tcp = 100 * 20',
    ],
    flag: 'FLAG{udp_vs_tcp_34}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (
        text.includes('Videochamada Meet -> UDP') &&
        text.includes('Download ISO Linux -> TCP') &&
        text.includes('Overhead 100 pacotes -> UDP: 800B | TCP: 2000B')
      ) {
        return { passed: true, feedback: 'Escolha entre TCP e UDP e cálculo de cabeçalho perfeitos!' };
      }
      return {
        passed: false,
        feedback: 'Verifique se atribuiu UDP para tempo real, TCP para integridade e 800B / 2000B no overhead.',
      };
    },
  },
  {
    id: 'M35',
    order: 35,
    circuit: 4,
    title: 'Configuração de Rede e Troubleshooting 4 Etapas',
    topic: 'Configuração & Soluções',
    teamRole: 'network',
    durationMinutes: 4,
    points: 140,
    microLesson: [
      'O diagnóstico em 4 etapas testa em sequência: 1) ping 127.0.0.1 (placa local), 2) ping gateway (roteador), 3) ping 8.8.8.8 (internet por IP) e 4) nslookup (DNS).',
      'Se o ping para 8.8.8.8 responde, mas o nslookup falha, a internet está ativa e o problema é exclusivamente o servidor DNS!',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if not testes["gateway"]:
    causa = "ROTEADOR_OU_CABO"
elif not testes["dns"]:
    causa = "DNS"`,
    objective:
      'Complete a árvore de decisão de troubleshooting para diagnosticar o cenário fornecido (resultado esperado: Causa raiz: DNS).',
    starterCode: `testes = {
    "loopback_127": True,
    "ping_gateway": True,
    "ping_8_8_8_8": True,
    "nslookup_dominio": False,
}

if not testes["loopback_127"]:
    causa = "PLACA_DE_REDE"
elif not testes["ping_gateway"]:
    causa = "CABO_OU_WIFI"
elif not testes["ping_8_8_8_8"]:
    causa = "LINK_OPERADORA"
# COMPLETE AQUI verificando se testes["nslookup_dominio"] é False
elif not :
    causa = "DNS"
else:
    causa = "REDE_OK"

print(f"Causa raiz: {causa}")`,
    hints: [
      'No último elif, teste se testes["nslookup_dominio"] é falso usando not.',
      'A linha fica: elif not testes["nslookup_dominio"]:',
    ],
    flag: 'FLAG{troubleshooting_4_etapas_35}',
    validate: (stdout) => {
      if (stdout.trim() === 'Causa raiz: DNS') {
        return {
          passed: true,
          feedback: 'Circuito 4 concluído! Diagnóstico de falha de DNS isolado com precisão.',
        };
      }
      return {
        passed: false,
        feedback: 'A saída esperada para este cenário é "Causa raiz: DNS".',
      };
    },
  },

  // =========================================================================
  // CIRCUITO 5: TERMINAL LINUX & DIAGNÓSTICO DE REDE — MISSÕES 36 A 50 (15 MISSÕES)
  // =========================================================================
  {
    id: 'M36',
    order: 36,
    circuit: 5,
    title: 'Árvore de Diretórios Linux (FHS)',
    topic: 'Linux: Diretórios FHS',
    teamRole: 'linux',
    durationMinutes: 3,
    points: 120,
    microLesson: [
      'No Linux, tudo começa na raiz "/". Pastas essenciais têm funções fixas: /etc (configurações), /var (logs e variáveis), /home (usuários), /tmp (temporários), /bin (binários) e /dev (dispositivos).',
      'Saber onde cada arquivo mora economiza minutos valiosos em incidentes de rede e provas técnicas.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `fhs = {"/etc": "configuracao", "/var": "logs"}
print(fhs["/etc"])`,
    objective:
      'Complete o mapeamento FHS associando configuracoes -> "/etc", logs -> "/var" e temporarios -> "/tmp".',
    starterCode: `mapa_linux = {
    "raiz": "/",
    "usuarios": "/home",
    # COMPLETE AQUI os caminhos padrão do FHS Linux
    "configuracoes": "",
    "logs": "",
    "temporarios": "",
}

print(f"Config: {mapa_linux['configuracoes']} | Logs: {mapa_linux['logs']} | Temp: {mapa_linux['temporarios']}")`,
    hints: [
      'No padrão FHS: configurações ficam em "/etc", logs em "/var" e arquivos temporários em "/tmp".',
      'Preencha "/etc", "/var" e "/tmp" nos três campos vazios.',
    ],
    flag: 'FLAG{linux_fhs_36}',
    validate: (stdout) => {
      if (stdout.trim() === 'Config: /etc | Logs: /var | Temp: /tmp') {
        return { passed: true, feedback: 'Estrutura FHS do Linux dominada!' };
      }
      return {
        passed: false,
        feedback: 'Esperado: "Config: /etc | Logs: /var | Temp: /tmp".',
      };
    },
  },
  {
    id: 'M37',
    order: 37,
    circuit: 5,
    title: 'Arquivos Ocultos e Flags do Comando ls',
    topic: 'Linux: Navegação e ls',
    teamRole: 'linux',
    durationMinutes: 3,
    points: 120,
    microLesson: [
      'No Linux, arquivos cujo nome começa com ponto "." (como .bashrc e .env) são ocultos e só aparecem com "ls -a".',
      'Outras flags úteis: ls -l (detalhes), ls -lh (tamanhos legíveis), ls -ltr (data) e ls -lS (ordenado por tamanho).',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if nome.startswith("."):
    print("Arquivo oculto:", nome)`,
    objective:
      'Simule o filtro de arquivos ocultos do comando "ls -a" contando quantos arquivos começam com "." (esperado: 2).',
    starterCode: `arquivos_home = [".bashrc", "notas.txt", ".env", "script.py", "rede.log"]

ocultos = []
for arq in arquivos_home:
    # COMPLETE AQUI verificando se arq começa com "."
    if arq.startswith(""):
        ocultos.append(arq)

print(f"Ocultos ({len(ocultos)}): {', '.join(ocultos)}")`,
    hints: [
      'Arquivos ocultos no Linux começam com o caractere "." — passe "." dentro de startswith().',
      'A linha fica: if arq.startswith("."):',
    ],
    flag: 'FLAG{linux_ls_ocultos_37}',
    validate: (stdout) => {
      if (stdout.trim() === 'Ocultos (2): .bashrc, .env') {
        return { passed: true, feedback: 'Arquivos ocultos (.bashrc e .env) revelados como no ls -a!' };
      }
      return {
        passed: false,
        feedback: 'A saída esperada é "Ocultos (2): .bashrc, .env".',
      };
    },
  },
  {
    id: 'M38',
    order: 38,
    circuit: 5,
    title: 'Concatenação e Redirecionamento (cat > e >>)',
    topic: 'Linux: Manipulação de Arquivos',
    teamRole: 'linux',
    durationMinutes: 3,
    points: 120,
    microLesson: [
      'No terminal Linux, "cat a.txt b.txt > c.txt" sobrescreve c.txt com o conteúdo unido de a.txt e b.txt.',
      'Já o operador ">>" (duplo maior) acrescenta novas linhas ao FINAL do arquivo sem apagar o que já existia.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `relatorio = arq1 + arq2   # equivalente a >
relatorio.extend(arq3)     # equivalente a >>`,
    objective:
      'Una parte1 e parte2 em relatorio (simulando ">") e depois acrescente parte3 ao final (simulando ">>") para totalizar 4 linhas.',
    starterCode: `parte1 = ["[INICIO] Auditoria Linux"]
parte2 = ["Host: lab-if-01", "Status: OK"]
parte3 = ["[FIM] Backup salvo"]

# Simulando: cat parte1 parte2 > relatorio
relatorio = parte1 + parte2

# COMPLETE AQUI simulando: cat parte3 >> relatorio (usando relatorio.extend(parte3))


print(f"Total de linhas: {len(relatorio)}")
print(relatorio[-1])`,
    hints: [
      'Use relatorio.extend(parte3) ou relatorio = relatorio + parte3 para acrescentar sem sobrescrever.',
      'Escreva na linha vazia: relatorio.extend(parte3)',
    ],
    flag: 'FLAG{linux_cat_redirect_38}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (text.includes('Total de linhas: 4') && text.includes('[FIM] Backup salvo')) {
        return { passed: true, feedback: 'Diferença entre > (sobrescrever) e >> (anexar) aplicada!' };
      }
      return {
        passed: false,
        feedback: 'O relatório final deve ter 4 linhas e terminar com "[FIM] Backup salvo".',
      };
    },
  },
  {
    id: 'M39',
    order: 39,
    circuit: 5,
    title: 'Fluxo Seguro de Pacotes APT',
    topic: 'Linux: Pacotes APT',
    teamRole: 'linux',
    durationMinutes: 3,
    points: 130,
    microLesson: [
      'Em sistemas Debian/Ubuntu, antes de instalar ou atualizar programas executamos "sudo apt-get update" para renovar o índice dos repositórios.',
      'Para remover um pacote junto com seus arquivos de configuração usamos "sudo apt-get purge", seguido de "sudo apt-get autoremove" para limpar dependências órfãs.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `comandos = ["sudo apt-get update", "sudo apt-get install nmap"]`,
    objective:
      'Complete os 2 comandos faltantes no roteiro de manutenção APT: atualizar lista ("update") e remover completamente ("purge").',
    starterCode: `roteiro_apt = [
    # COMPLETE AQUI com "update"
    "sudo apt-get ",
    "sudo apt-get install htop",
    # COMPLETE AQUI com "purge" para remover o pacote telnet com suas configs
    "sudo apt-get  telnet",
    "sudo apt-get autoremove",
]

for idx, cmd in enumerate(roteiro_apt, start=1):
    print(f"{idx}. {cmd.strip()}")`,
    hints: [
      'O primeiro passo deve ser "sudo apt-get update" e o terceiro "sudo apt-get purge telnet".',
      'Troque as strings para "sudo apt-get update" e "sudo apt-get purge telnet".',
    ],
    flag: 'FLAG{linux_apt_master_39}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (
        text.includes('1. sudo apt-get update') &&
        text.includes('3. sudo apt-get purge telnet')
      ) {
        return { passed: true, feedback: 'Rotina de gerenciamento APT configurada corretamente!' };
      }
      return {
        passed: false,
        feedback: 'Verifique se o passo 1 é "sudo apt-get update" e o passo 3 é "sudo apt-get purge telnet".',
      };
    },
  },
  {
    id: 'M40',
    order: 40,
    circuit: 5,
    title: 'Buscas em Logs: grep -ic e tail -n',
    topic: 'Linux: Buscas e Filtros',
    teamRole: 'linux',
    durationMinutes: 4,
    points: 130,
    microLesson: [
      'No Linux, "grep -i" busca ignorando maiúsculas/minúsculas e "-c" retorna a contagem de linhas encontradas.',
      'Já "tail -n 2" exibe as últimas 2 linhas de um log — essencial para ver os eventos mais recentes.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if "failed" in linha.lower():
    total += 1`,
    objective:
      'Conte quantas linhas de auth_log contêm "failed" ignorando maiúsculas (esperado: 4) e imprima a última linha usando linhas[-1].',
    starterCode: `auth_log = """08:01 sshd Failed password for root
08:02 sshd Accepted publickey for aluno
08:03 sshd FAILED password for admin
08:04 sshd Failed password for guest
08:05 sshd Accepted password for prof
08:06 sshd failed password for root"""

linhas = auth_log.splitlines()
falhas = 0
for linha in linhas:
    # COMPLETE AQUI (simulando grep -i "failed") usando linha.lower()
    if "failed" in :
        falhas += 1

print(f"Falhas (grep -ic): {falhas}")
print(f"Ultima linha: {linhas[-1]}")`,
    hints: [
      'Converta cada linha para minúsculas com linha.lower() antes de testar "failed" in ...',
      'A linha fica: if "failed" in linha.lower():',
    ],
    flag: 'FLAG{linux_grep_tail_40}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (
        text.includes('Falhas (grep -ic): 4') &&
        text.includes('Ultima linha: 08:06 sshd failed password for root')
      ) {
        return { passed: true, feedback: 'Busca case-insensitive (grep -ic) e inspeção final (tail) concluídas!' };
      }
      return {
        passed: false,
        feedback: 'Garanta que falhas seja 4 usando linha.lower().',
      };
    },
  },
  {
    id: 'M41',
    order: 41,
    circuit: 5,
    title: 'Sobrevivendo aos Editores nano e vim',
    topic: 'Linux: Editores nano e vim',
    teamRole: 'linux',
    durationMinutes: 3,
    points: 120,
    microLesson: [
      'No nano: Ctrl+O salva (gravar), Ctrl+X sai e Ctrl+W pesquisa texto.',
      'No vim: pressione Esc para voltar ao Modo Normal; ":w" salva, ":x" salva e sai, ":q!" sai sem salvar e "dd" apaga a linha atual.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `atalhos = {"salvar_vim": ":w", "apagar_linha_vim": "dd"}`,
    objective:
      'Complete os comandos exatos para salvar no nano ("Ctrl+O"), salvar e sair no vim (":x") e sair sem salvar no vim (":q!").',
    starterCode: `editores = {
    "salvar_nano": "",
    "salvar_e_sair_vim": "",
    "sair_sem_salvar_vim": "",
    "apagar_linha_vim": "dd",
}

print(f"nano={editores['salvar_nano']} | vim_save_exit={editores['salvar_e_sair_vim']} | vim_force_quit={editores['sair_sem_salvar_vim']}")`,
    hints: [
      'No nano salvamos com "Ctrl+O"; no vim salvamos e saímos com ":x" (ou ":wq") e saímos sem salvar com ":q!".',
      'Preencha "Ctrl+O", ":x" e ":q!" nos três campos vazios.',
    ],
    flag: 'FLAG{linux_nano_vim_41}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (
        text.includes('nano=Ctrl+O') &&
        (text.includes('vim_save_exit=:x') || text.includes('vim_save_exit=:wq')) &&
        text.includes('vim_force_quit=:q!')
      ) {
        return { passed: true, feedback: 'Atalhos essenciais do nano e do vim memorizados!' };
      }
      return {
        passed: false,
        feedback: 'Use Ctrl+O para nano, :x (ou :wq) para salvar e sair no vim e :q! para sair sem salvar.',
      };
    },
  },
  {
    id: 'M42',
    order: 42,
    circuit: 5,
    title: 'Auditoria de Usuários e Grupos (sudo)',
    topic: 'Linux: Usuários e Grupos',
    teamRole: 'linux',
    durationMinutes: 3,
    points: 130,
    microLesson: [
      'Comandos como "sudo adduser", "sudo usermod -a -G sudo usuario" e "getent group" controlam quem tem privilégios administrativos no Linux.',
      'A saída do comando "getent group" separa colunas por dois-pontos ":", com a lista de membros na última coluna (índice 3).',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `linha = "sudo:x:27:aluno,admin"
membros = linha.split(":")[3].split(",")`,
    objective:
      'Extraia os membros do grupo "sudo" na saída simulada de getent group e imprima a lista e a quantidade (2).',
    starterCode: `saida_getent = """adm:x:4:syslog,aluno
sudo:x:27:aluno,prof_redes
www-data:x:33:nginx"""

membros_sudo = []
for linha in saida_getent.splitlines():
    if linha.startswith("sudo:"):
        # COMPLETE AQUI separando por ":" e pegando o índice 3, depois separando por ","
        membros_sudo = linha.split(":")[].split(",")

print(f"Grupo sudo ({len(membros_sudo)}): {', '.join(membros_sudo)}")`,
    hints: [
      'Em "sudo:x:27:aluno,prof_redes", os índices após split(":") são 0=sudo, 1=x, 2=27, 3=aluno,prof_redes.',
      'A linha completa fica: membros_sudo = linha.split(":")[3].split(",")',
    ],
    flag: 'FLAG{linux_usuarios_grupos_42}',
    validate: (stdout) => {
      if (stdout.trim() === 'Grupo sudo (2): aluno, prof_redes') {
        return { passed: true, feedback: 'Auditoria do grupo privilegiado sudo concluída!' };
      }
      return {
        passed: false,
        feedback: 'A saída esperada é "Grupo sudo (2): aluno, prof_redes".',
      };
    },
  },
  {
    id: 'M43',
    order: 43,
    circuit: 5,
    title: 'Calculadora Octal de Permissões (chmod)',
    topic: 'Linux: Permissões chmod',
    teamRole: 'linux',
    durationMinutes: 4,
    points: 140,
    microLesson: [
      'No chmod octal, cada letra vale um peso fixo: r (leitura) = 4, w (escrita) = 2, x (execução) = 1 e "-" = 0.',
      'Cada trio (dono, grupo, outros) vira um dígito: "rwx" = 4+2+1 = 7, "r-x" = 4+0+1 = 5 e "---" = 0. Assim "rwxr-xr-x" = 755.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `pesos = {"r": 4, "w": 2, "x": 1, "-": 0}
valor = sum(pesos[c] for c in "r-x")  # 5`,
    objective:
      'Complete o dicionário pesos para converter "rwxr-xr-x" (755) e "rw-------" (600) para notação octal.',
    starterCode: `pesos = {
    "r": 4,
    # COMPLETE AQUI os valores de "w" (2) e "x" (1)
    "w": 0,
    "x": 0,
    "-": 0,
}

def para_octal(perm):
    resultado = ""
    for i in range(0, 9, 3):
        trio = perm[i:i+3]
        resultado += str(sum(pesos[c] for c in trio))
    return resultado

print(f"script.sh -> {para_octal('rwxr-xr-x')}")
print(f"chave_ssh -> {para_octal('rw-------')}")`,
    hints: [
      'Na tabela octal do chmod: r=4, w=2 e x=1.',
      'Altere "w": 2 e "x": 1 no dicionário pesos.',
    ],
    flag: 'FLAG{linux_chmod_octal_43}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (text.includes('script.sh -> 755') && text.includes('chave_ssh -> 600')) {
        return { passed: true, feedback: 'Permissões octais 755 e 600 calculadas corretamente!' };
      }
      return {
        passed: false,
        feedback: 'O resultado esperado é "script.sh -> 755" e "chave_ssh -> 600".',
      };
    },
  },
  {
    id: 'M44',
    order: 44,
    circuit: 5,
    title: 'Extraindo IP e MAC do ifconfig Linux',
    topic: 'Linux: Rede com ifconfig',
    teamRole: 'linux',
    durationMinutes: 3,
    points: 130,
    microLesson: [
      'No Linux, "ifconfig" (e "hostname -I") revela o endereço IPv4 (inet), a máscara (netmask) e o endereço físico MAC (ether) da interface de rede.',
      'Extrair esses campos automaticamente com Python é muito útil em scripts de inventário de laboratório.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if "inet " in linha:
    ip = linha.split()[1]`,
    objective:
      'Percorra a saída simulada de ifconfig para capturar o IPv4 (após "inet ") e o MAC (após "ether ").',
    starterCode: `saida_ifconfig = """eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.50.10  netmask 255.255.255.0  broadcast 192.168.50.255
        ether 02:42:ac:11:00:0a  txqueuelen 1000  (Ethernet)"""

ipv4 = ""
mac = ""
for linha in saida_ifconfig.splitlines():
    limpa = linha.strip()
    if limpa.startswith("inet "):
        # COMPLETE AQUI pegando o elemento de índice 1 de limpa.split()
        ipv4 = limpa.split()[]
    elif limpa.startswith("ether "):
        mac = limpa.split()[1]

print(f"IPv4: {ipv4} | MAC: {mac}")`,
    hints: [
      'Na linha "inet 192.168.50.10 netmask ...", índice 0 é "inet" e índice 1 é o endereço IP.',
      'A linha fica: ipv4 = limpa.split()[1]',
    ],
    flag: 'FLAG{linux_ifconfig_44}',
    validate: (stdout) => {
      if (stdout.trim() === 'IPv4: 192.168.50.10 | MAC: 02:42:ac:11:00:0a') {
        return { passed: true, feedback: 'IPv4 e endereço MAC extraídos da interface eth0!' };
      }
      return {
        passed: false,
        feedback: 'Esperado: "IPv4: 192.168.50.10 | MAC: 02:42:ac:11:00:0a".',
      };
    },
  },
  {
    id: 'M45',
    order: 45,
    circuit: 5,
    title: 'Auditoria de Sockets (netstat) e Firewall (ufw)',
    topic: 'Linux: netstat e ufw',
    teamRole: 'linux',
    durationMinutes: 4,
    points: 140,
    microLesson: [
      'No Linux, "netstat -at" lista conexões TCP e "netstat -au" lista portas UDP; já "sudo ufw app list" exibe os perfis de firewall disponíveis.',
      'Auditar quantas portas TCP e UDP estão escutando ajuda a manter aberta apenas a superfície estritamente necessária.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if linha.startswith("tcp"):
    tcp += 1`,
    objective:
      'Conte quantos serviços estão em "tcp" (3) e em "udp" (2) na saída de netstat e verifique se "OpenSSH" consta na lista UFW.',
    starterCode: `netstat_out = """tcp 0 0 0.0.0.0:22 LISTEN
tcp 0 0 0.0.0.0:80 LISTEN
tcp 0 0 0.0.0.0:443 LISTEN
udp 0 0 0.0.0.0:53 0.0.0.0:*
udp 0 0 0.0.0.0:68 0.0.0.0:*"""
ufw_apps = ["Nginx Full", "OpenSSH", "Samba"]

tcp_total = 0
udp_total = 0
for linha in netstat_out.splitlines():
    if linha.startswith("tcp"):
        tcp_total += 1
    # COMPLETE AQUI contando as linhas que começam com "udp"
    elif linha.startswith(""):
        udp_total += 1

ssh_no_ufw = "OpenSSH" in ufw_apps
print(f"TCP: {tcp_total} | UDP: {udp_total} | UFW OpenSSH: {ssh_no_ufw}")`,
    hints: [
      'Use linha.startswith("udp") no bloco elif para contabilizar os sockets UDP.',
      'A linha completa fica: elif linha.startswith("udp"):',
    ],
    flag: 'FLAG{linux_netstat_ufw_45}',
    validate: (stdout) => {
      if (stdout.trim() === 'TCP: 3 | UDP: 2 | UFW OpenSSH: True') {
        return { passed: true, feedback: 'Sockets TCP/UDP e perfil UFW auditados com sucesso!' };
      }
      return {
        passed: false,
        feedback: 'A saída esperada é "TCP: 3 | UDP: 2 | UFW OpenSSH: True".',
      };
    },
  },
  {
    id: 'M46',
    order: 46,
    circuit: 5,
    title: 'Compactação e Backup com tar e zip',
    topic: 'Linux: tar e zip',
    teamRole: 'linux',
    durationMinutes: 3,
    points: 130,
    microLesson: [
      'No tar: "-c" cria arquivo compactado (tar -czvf), "-x" extrai (tar -xzvf) e "-t" lista o conteúdo sem extrair (tar -tvf).',
      'No zip: "zip -r" compacta diretórios recursivamente e "unzip -d pasta" extrai dentro do diretório escolhido.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if "-czvf" in cmd:
    acao = "compactar"`,
    objective:
      'Complete a classificação dos 3 comandos tar/zip identificando qual extrai ("-xzvf") e qual apenas lista ("-tvf").',
    starterCode: `comandos = [
    "tar -czvf backup.tar.gz /etc",
    "tar -xzvf backup.tar.gz -C /tmp",
    "tar -tvf backup.tar.gz",
]

for cmd in comandos:
    if "-czvf" in cmd:
        acao = "COMPACTAR"
    # COMPLETE AQUI detectando "-xzvf" (EXTRAIR) e "-tvf" (LISTAR)
    elif "" in cmd:
        acao = "EXTRAIR"
    elif "" in cmd:
        acao = "LISTAR"
    else:
        acao = "OUTRO"
    print(f"{acao} -> {cmd}")`,
    hints: [
      'A flag -x (extract) está em "-xzvf" e a flag -t (list) está em "-tvf".',
      'Use elif "-xzvf" in cmd: e elif "-tvf" in cmd:',
    ],
    flag: 'FLAG{linux_tar_zip_46}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (
        text.includes('COMPACTAR -> tar -czvf') &&
        text.includes('EXTRAIR -> tar -xzvf') &&
        text.includes('LISTAR -> tar -tvf')
      ) {
        return { passed: true, feedback: 'Flags -c, -x e -t do comando tar diferenciadas perfeitamente!' };
      }
      return {
        passed: false,
        feedback: 'Classifique -czvf como COMPACTAR, -xzvf como EXTRAIR e -tvf como LISTAR.',
      };
    },
  },
  {
    id: 'M47',
    order: 47,
    circuit: 5,
    title: 'Sandbox: Latência ICMP (ping) e Registro whois',
    topic: 'Ferramentas de Rede',
    teamRole: 'network',
    durationMinutes: 4,
    points: 150,
    microLesson: [
      'O comando ping envia pacotes ICMP Echo Request e mede o tempo de ida e volta (RTT em milissegundos).',
      'Já o whois consulta os dados públicos de registro de um domínio ou bloco IP, revelando a organização responsável (OrgName).',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `media = sum(tempos) / len(tempos)
print(f"{media:.1f} ms")`,
    objective:
      'Calcule a média de latência dos 4 pings (13.0 ms) e extraia o nome da organização na linha "OrgName:" do registro WHOIS.',
    starterCode: `tempos_ms = [12.4, 14.1, 11.8, 13.7]
whois_texto = """Domain: campus.if.edu.br
OrgName: IF-Campus-Net
Country: BR"""

# COMPLETE AQUI calculando a média com sum(tempos_ms) / len(tempos_ms)
media_ms = 

org = ""
for linha in whois_texto.splitlines():
    if linha.startswith("OrgName:"):
        org = linha.split(":", 1)[1].strip()

print(f"RTT medio: {media_ms:.1f} ms | Org: {org}")`,
    hints: [
      'Em Python, a média de uma lista numérica é sum(tempos_ms) / len(tempos_ms).',
      'A linha fica: media_ms = sum(tempos_ms) / len(tempos_ms)',
    ],
    flag: 'FLAG{ping_whois_47}',
    validate: (stdout) => {
      if (stdout.trim() === 'RTT medio: 13.0 ms | Org: IF-Campus-Net') {
        return { passed: true, feedback: 'Média de latência ICMP e dados WHOIS analisados!' };
      }
      return {
        passed: false,
        feedback: 'A saída esperada é "RTT medio: 13.0 ms | Org: IF-Campus-Net".',
      };
    },
  },
  {
    id: 'M48',
    order: 48,
    circuit: 5,
    title: 'Sandbox: Auditoria Defensiva de Portas (nmap)',
    topic: 'Ferramentas de Rede',
    teamRole: 'blue',
    durationMinutes: 4,
    points: 150,
    microLesson: [
      'Em auditorias defensivas de rede, verificar portas abertas ajuda o administrador a fechar serviços antigos sem criptografia (como Telnet na porta 23 ou FTP na porta 21).',
      'Portas marcadas como "filtered" estão protegidas por firewall; portas "open" com protocolo sem criptografia exigem endurecimento imediato.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if estado == "open" and not criptografado:
    print(f"Fechar porta {porta}")`,
    objective:
      'Percorra o inventário de portas do servidor e liste quais portas estão "open" e sem criptografia (esperado: 23/telnet e 80/http).',
    starterCode: `inventario_nmap = [
    {"porta": 22, "estado": "open", "servico": "ssh", "cripto": True},
    {"porta": 23, "estado": "open", "servico": "telnet", "cripto": False},
    {"porta": 80, "estado": "open", "servico": "http", "cripto": False},
    {"porta": 443, "estado": "open", "servico": "https", "cripto": True},
    {"porta": 3306, "estado": "filtered", "servico": "mysql", "cripto": True},
]

expostas = []
for item in inventario_nmap:
    # COMPLETE AQUI filtrando estado == "open" e not item["cripto"]
    if :
        expostas.append(f"{item['porta']}/{item['servico']}")

print(f"Endurecer servicos: {', '.join(expostas)}")`,
    hints: [
      'Verifique duas condições com and: item["estado"] == "open" e not item["cripto"].',
      'A linha fica: if item["estado"] == "open" and not item["cripto"]:',
    ],
    flag: 'FLAG{auditoria_nmap_defensiva_48}',
    validate: (stdout) => {
      if (stdout.trim() === 'Endurecer servicos: 23/telnet, 80/http') {
        return { passed: true, feedback: 'Serviços sem criptografia (Telnet e HTTP) marcados para endurecimento!' };
      }
      return {
        passed: false,
        feedback: 'A saída esperada é "Endurecer servicos: 23/telnet, 80/http".',
      };
    },
  },
  {
    id: 'M49',
    order: 49,
    circuit: 5,
    title: 'Sandbox: Inspeção de Pacotes (sniff) e F12 Network',
    topic: 'Ferramentas de Rede',
    teamRole: 'blue',
    durationMinutes: 4,
    points: 160,
    microLesson: [
      'Tanto no Wireshark/sniff quanto na aba Network (F12) do navegador, inspecionamos protocolos (HTTP, HTTPS, DNS) e códigos de status (200 OK, 404 Not Found).',
      'Tráfego HTTP sem TLS expõe dados em texto claro na rede local — sinal claro para migrar imediatamente para HTTPS.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if p["proto"] == "HTTP" and not p["tls"]:
    alertas += 1`,
    objective:
      'Analise a captura de pacotes contando quantos trafegam em HTTP sem TLS (2) e quantos retornaram status 404 (1).',
    starterCode: `captura = [
    {"proto": "HTTPS", "tls": True, "status": 200},
    {"proto": "HTTP", "tls": False, "status": 200},
    {"proto": "HTTP", "tls": False, "status": 404},
    {"proto": "HTTPS", "tls": True, "status": 200},
    {"proto": "DNS", "tls": False, "status": 200},
]

texto_claro = 0
erros_404 = 0

for pkt in captura:
    # COMPLETE AQUI: conte HTTP sem TLS e conte status == 404
    if pkt["proto"] == "HTTP" and not pkt["tls"]:
        texto_claro += 1
    if pkt["status"] == :
        erros_404 += 1

print(f"Alertas texto claro: {texto_claro} | Erros 404: {erros_404}")`,
    hints: [
      'Compare pkt["status"] com o código numérico 404.',
      'A linha fica: if pkt["status"] == 404:',
    ],
    flag: 'FLAG{sniff_devtools_49}',
    validate: (stdout) => {
      if (stdout.trim() === 'Alertas texto claro: 2 | Erros 404: 1') {
        return {
          passed: true,
          feedback: 'Captura inspecionada! Você chegou ao Chefão Final 50.',
        };
      }
      return {
        passed: false,
        feedback: 'A saída esperada é "Alertas texto claro: 2 | Erros 404: 1".',
      };
    },
  },
  {
    id: 'M50',
    order: 50,
    circuit: 5,
    title: 'Chefão Final 50 · Operação Defesa Completa',
    topic: 'Capstone: Python + Redes + Linux + Segurança',
    teamRole: 'blue',
    durationMinutes: 6,
    points: 350,
    microLesson: [
      'Desafio final das 50 missões! Um servidor Linux da escola apresentou alertas simultâneos em /var/log/auth.log, permissões chmod e um token Base64 de validação.',
      'As variáveis auth_log, arquivos_perm e token_b64 já estão carregadas automaticamente no ambiente.',
      'Complete os 3 blocos finais para isolar o IP com 4 ou mais falhas SSH, encontrar o arquivo com permissão insegura "777" e decodificar o token Base64.',
    ],
    exampleTitle: 'Resumo das 3 frentes',
    exampleCode: `falhas[ip] = falhas.get(ip, 0) + 1
if perm == "777": ...
base64.b64decode(token_b64).decode("utf-8")`,
    objective:
      'Complete a auditoria integrada para exibir o IP bloqueado (203.0.113.77), o arquivo com chmod 777 (/etc/app.conf) e o token decodificado (MISSAO_50_CONCLUIDA).',
    setupPython: MISSION_50_SETUP,
    starterCode: `import base64

# auth_log, arquivos_perm e token_b64 já estão carregados no ambiente!
falhas_ip = {}
for linha in auth_log:
    if "Failed password" in linha:
        ip = linha.split("from ")[1].split()[0]
        # 1. COMPLETE AQUI contando falhas por IP
        falhas_ip[ip] = 

atacante = [ip for ip, qtd in falhas_ip.items() if qtd >= 4][0]

# 2. COMPLETE AQUI encontrando o arquivo com permissão "777"
arq_inseguro = ""
for caminho, perm in arquivos_perm.items():
    if perm == "":
        arq_inseguro = caminho

# 3. COMPLETE AQUI decodificando token_b64
codigo = base64.b64decode().decode("utf-8")

print(f"IP: {atacante} | Inseguro: {arq_inseguro} | Token: {codigo}")`,
    hints: [
      'Use falhas_ip.get(ip, 0) + 1 para contar, compare perm == "777" e passe token_b64 em base64.b64decode(token_b64).',
      'Linhas: falhas_ip[ip] = falhas_ip.get(ip, 0) + 1 | if perm == "777": | codigo = base64.b64decode(token_b64).decode("utf-8")',
    ],
    flag: 'FLAG{mestre_ctf_50_missoes}',
    hasPurpleBonus: true,
    validate: (stdout) => {
      if (
        stdout.includes('203.0.113.77') &&
        stdout.includes('/etc/app.conf') &&
        stdout.includes('MISSAO_50_CONCLUIDA')
      ) {
        return {
          passed: true,
          feedback:
            'PARABÉNS! Todas as 50 missões do CTF concluídas com domínio de Python, Redes, Linux e Segurança!',
        };
      }
      return {
        passed: false,
        feedback:
          'O relatório final precisa mostrar o IP 203.0.113.77, o arquivo /etc/app.conf e o token MISSAO_50_CONCLUIDA.',
      };
    },
  },
];
