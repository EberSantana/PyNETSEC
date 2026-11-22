import { CircuitInfo, CodePreset, Mission } from '../types/ctf';

export const CIRCUITS: CircuitInfo[] = [
  {
    id: 1,
    code: 'Circuito 01',
    title: 'Academia Python',
    subtitle: 'Base e Repetição · Missões 01 a 10',
    description:
      'Construa reflexo rápido em variáveis, strings, condicionais if/else, listas, loops for e dicionários aplicando exemplos de logs e portas.',
    missionCount: 10,
    accentLabel: 'Fundamentos',
  },
  {
    id: 2,
    code: 'Circuito 02',
    title: 'Redes de Computadores',
    subtitle: 'IPs, Sub-redes e DNS · Missões 11 a 15',
    description:
      'Use o módulo real ipaddress do Python e análise de logs simulados de roteador/DNS para validar endereços, calcular máscaras e inspecionar tráfego.',
    missionCount: 5,
    accentLabel: 'Redes',
  },
  {
    id: 3,
    code: 'Circuito 03',
    title: 'Arena CTF · Segurança da Informação',
    subtitle: 'Criptografia, Hashes e Fase Final Dupla · Missões 16 a 20B',
    description:
      'Decodifique Base64, quebre Cifra de César, faça auditoria SHA-256 e enfrente o Chefão Duplo: 20A (Blue Team Forense) e 20B (Red Team Ético).',
    missionCount: 6,
    accentLabel: 'Blue & Red Team',
  },
];

export const CODE_PRESETS: CodePreset[] = [
  {
    id: 'for-loop',
    label: 'Loop for',
    description: 'Percorrer cada item de uma lista',
    snippet: `for item in lista:\n    print(item)\n`,
  },
  {
    id: 'if-else',
    label: 'if / else',
    description: 'Tomar decisão com condição',
    snippet: `if condicao:\n    print("SIM")\nelse:\n    print("NAO")\n`,
  },
  {
    id: 'dict-counter',
    label: 'Contador dict',
    description: 'Contar ocorrências com dicionário',
    snippet: `contagem = {}\nfor chave in itens:\n    contagem[chave] = contagem.get(chave, 0) + 1\n`,
  },
  {
    id: 'ipaddress',
    label: 'ipaddress',
    description: 'Validar IP ou sub-rede com ipaddress',
    snippet: `import ipaddress\nrede = ipaddress.ip_network("192.168.10.0/24")\nprint(rede.network_address)\n`,
  },
  {
    id: 'base64',
    label: 'base64',
    description: 'Decodificar texto em Base64',
    snippet: `import base64\ntexto = base64.b64decode(dado).decode("utf-8")\nprint(texto)\n`,
  },
  {
    id: 'hashlib',
    label: 'SHA-256',
    description: 'Gerar hash SHA-256 com hashlib',
    snippet: `import hashlib\nresumo = hashlib.sha256(texto.encode()).hexdigest()\nprint(resumo)\n`,
  },
];

export const SHEET_HEADERS = ['Timestamp', 'Aluno', 'Turma', 'Modulo', 'Missao_ID', 'Flag', 'Pontos'];

export const APPS_SCRIPT_CODE_GS = `const ABA_PROGRESSO = "Progresso";

// 1. RECEBE E SALVA O PROGRESSO DO ALUNO (POST)
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000); // Aguarda até 10s se outra requisição estiver gravando

  try {
    const dados = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_PROGRESSO);
    const registros = sheet.getDataRange().getValues();

    const aluno = String(dados.aluno || "").trim();
    const turma = String(dados.turma || "Geral").trim();
    const modulo = String(dados.modulo || "").trim();
    const missaoId = String(dados.missaoId || "").trim();
    const flag = String(dados.flag || "").trim();
    const pontos = Number(dados.pontos || 0);

    // Verifica se o aluno já concluiu esta exata missão neste módulo
    for (let i = 1; i < registros.length; i++) {
      if (
        registros[i][1] === aluno &&
        registros[i][3] === modulo &&
        registros[i][4] === missaoId
      ) {
        return responderJSON({
          status: "duplicado",
          mensagem: "Missão já registrada anteriormente."
        });
      }
    }

    // Grava a nova linha
    sheet.appendRow([new Date(), aluno, turma, modulo, missaoId, flag, pontos]);

    return responderJSON({
      status: "sucesso",
      mensagem: "Progresso salvo!"
    });
  } catch (erro) {
    return responderJSON({ status: "erro", mensagem: erro.toString() });
  } finally {
    lock.releaseLock();
  }
}

// 2. RETORNA O RANKING POR MÓDULO OU GERAL (GET)
// ?modulo=PySec -> Ranking apenas do módulo PySec
// ?modulo=geral -> Ranking somando todos os módulos
function doGet(e) {
  const moduloFiltro = (e.parameter.modulo || "geral").trim();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_PROGRESSO);
  const registros = sheet.getDataRange().getValues();

  const placar = {};

  for (let i = 1; i < registros.length; i++) {
    const aluno = registros[i][1];
    const turma = registros[i][2];
    const modulo = registros[i][3];
    const pontos = Number(registros[i][6]) || 0;

    if (moduloFiltro !== "geral" && modulo !== moduloFiltro) {
      continue;
    }

    const chave = \`\${aluno}|\${turma}\`;
    if (!placar[chave]) {
      placar[chave] = { aluno, turma, pontos: 0, missoes: 0 };
    }

    placar[chave].pontos += pontos;
    placar[chave].missoes += 1;
  }

  const ranking = Object.values(placar).sort((a, b) => b.pontos - a.pontos);

  return responderJSON({
    modulo: moduloFiltro,
    ranking: ranking
  });
}

function responderJSON(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}`;

// 50-line simulated server access log for Mission 20A (Blue Team Boss)
// IP 185.220.101.47 accumulates 9 "401 Unauthorized" failures (> 5).
const MISSION_20A_SETUP = `logs = [
    "02:01:12 192.168.1.14 POST /login 200 OK",
    "02:01:19 10.0.0.22 GET /dashboard 200 OK",
    "02:02:04 185.220.101.47 POST /login 401 Unauthorized",
    "02:02:09 192.168.1.30 GET /notas 200 OK",
    "02:02:15 185.220.101.47 POST /login 401 Unauthorized",
    "02:02:21 172.16.0.8 POST /login 401 Unauthorized",
    "02:02:29 192.168.1.14 GET /perfil 200 OK",
    "02:02:34 185.220.101.47 POST /login 401 Unauthorized",
    "02:02:41 10.0.0.51 GET /horario 200 OK",
    "02:02:55 203.0.113.9 POST /login 401 Unauthorized",
    "02:03:02 192.168.1.18 GET /biblioteca 200 OK",
    "02:03:11 185.220.101.47 POST /login 401 Unauthorized",
    "02:03:18 192.168.1.25 POST /login 200 OK",
    "02:03:27 172.16.0.8 POST /login 401 Unauthorized",
    "02:03:33 10.0.0.12 GET /aviso 200 OK",
    "02:03:40 185.220.101.47 POST /login 401 Unauthorized",
    "02:03:48 192.168.1.44 GET /arquivos 200 OK",
    "02:03:54 203.0.113.9 POST /login 401 Unauthorized",
    "02:04:01 192.168.1.14 GET /boletim 200 OK",
    "02:04:09 185.220.101.47 POST /login 401 Unauthorized",
    "02:04:16 10.0.0.33 POST /login 200 OK",
    "02:04:22 192.168.1.77 GET /calendario 200 OK",
    "02:04:31 198.51.100.14 POST /login 401 Unauthorized",
    "02:04:38 185.220.101.47 POST /login 401 Unauthorized",
    "02:04:45 192.168.1.19 GET /turmas 200 OK",
    "02:04:51 172.16.0.8 POST /login 401 Unauthorized",
    "02:05:00 10.0.0.22 GET /salas 200 OK",
    "02:05:08 185.220.101.47 POST /login 401 Unauthorized",
    "02:05:14 192.168.1.11 GET /home 200 OK",
    "02:05:21 203.0.113.9 POST /login 401 Unauthorized",
    "02:05:30 10.0.0.40 GET /mensagens 200 OK",
    "02:05:39 185.220.101.47 POST /login 401 Unauthorized",
    "02:05:44 192.168.1.62 POST /login 200 OK",
    "02:05:52 198.51.100.14 POST /login 401 Unauthorized",
    "02:06:01 10.0.0.19 GET /portal 200 OK",
    "02:06:10 192.168.1.30 GET /notas 200 OK",
    "02:06:17 172.16.0.8 POST /login 200 OK",
    "02:06:24 10.0.0.28 GET /mural 200 OK",
    "02:06:33 192.168.1.50 GET /disciplinas 200 OK",
    "02:06:41 203.0.113.9 POST /login 401 Unauthorized",
    "02:06:49 192.168.1.14 GET /sair 200 OK",
    "02:06:58 10.0.0.65 GET /cursos 200 OK",
    "02:07:05 192.168.1.80 GET /faq 200 OK",
    "02:07:12 198.51.100.14 POST /login 401 Unauthorized",
    "02:07:20 192.168.1.25 GET /perfil 200 OK",
    "02:07:28 10.0.0.71 GET /manual 200 OK",
    "02:07:35 192.168.1.33 GET /eventos 200 OK",
    "02:07:43 10.0.0.12 GET /home 200 OK",
    "02:07:51 192.168.1.44 GET /sair 200 OK",
    "02:07:59 10.0.0.22 GET /sair 200 OK",
]`;

// In-memory simulated "alvo" module for Mission 20B (Red Team Boss)
const MISSION_20B_SETUP = `import sys, types

class _AlvoSimulado:
    def acessar(self, rota):
        rota_limpa = str(rota).strip()
        if rota_limpa == "/backup":
            return "200 OK | Arquivo exposto: usuario=admin_sys | Dica: PIN numerico de 4 digitos"
        if rota_limpa in ["/login", "/imagens", "/admin", "/config"]:
            return "403 Forbidden" if rota_limpa == "/admin" else "404 Not Found"
        return "404 Not Found"

    def autenticar(self, usuario, pin):
        if str(usuario).strip() == "admin_sys" and str(pin).strip() == "4827":
            return "FLAG{red_team_pin_quebrado}"
        return "401 Acesso Negado"

alvo = _AlvoSimulado()
_mod = types.ModuleType("alvo")
_mod.acessar = alvo.acessar
_mod.autenticar = alvo.autenticar
sys.modules["alvo"] = _mod
`;

export const MISSIONS: Mission[] = [
  // =========================================================================
  // CIRCUITO 1: ACADEMIA PYTHON (BASE E REPETIÇÃO) — MISSÕES 01 A 10
  // =========================================================================
  {
    id: 'M01',
    order: 1,
    circuit: 1,
    title: 'Primeiro Alerta de Rede',
    topic: 'Variáveis e Strings',
    teamRole: 'core',
    durationMinutes: 2,
    points: 50,
    microLesson: [
      'Em Python, variáveis guardam dados como textos (strings) entre aspas e números.',
      'Com f-strings (colocando a letra f antes das aspas), você mistura texto fixo com variáveis usando chaves {}.',
      'Sistemas de segurança usam esse formato o tempo todo para gerar alertas legíveis no terminal.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `porta = 22
print(f"Monitorando porta {porta}")`,
    objective:
      'Complete a linha do print para exibir exatamente: ALERTA: Acesso negado em 10.0.0.45',
    starterCode: `ip_alerta = "10.0.0.45"
evento = "Acesso negado"

# COMPLETE AQUI usando f-string com {evento} e {ip_alerta}
print(f"ALERTA: {evento} em ")`,
    hints: [
      'Coloque a variável ip_alerta dentro de chaves {} no final da f-string.',
      'A linha completa fica: print(f"ALERTA: {evento} em {ip_alerta}")',
    ],
    flag: 'FLAG{alerta_configurado_01}',
    validate: (stdout) => {
      const clean = stdout.trim();
      if (clean.includes('ALERTA: Acesso negado em 10.0.0.45')) {
        return { passed: true, feedback: 'Alerta formatado corretamente no console.' };
      }
      return {
        passed: false,
        feedback: 'A saída ainda não contém exatamente "ALERTA: Acesso negado em 10.0.0.45".',
      };
    },
  },
  {
    id: 'M02',
    order: 2,
    circuit: 1,
    title: 'Limpando Logins Sujos',
    topic: 'Variáveis e Strings',
    teamRole: 'core',
    durationMinutes: 2,
    points: 50,
    microLesson: [
      'Usuários frequentemente digitam espaços extras sem querer ao fazer login.',
      'O método .strip() remove espaços em branco do começo e do fim de uma string.',
      'Limpar entradas antes de validar evita falsos alertas em logs do servidor.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `bruto = "   servidor_01   "
limpo = bruto.strip()
print(limpo)  # servidor_01`,
    objective:
      'Use .strip() na variável usuario_sujo para remover os espaços extras e imprimir apenas: admin_if',
    starterCode: `usuario_sujo = "   admin_if   "

# COMPLETE AQUI removendo os espaços extras
usuario_limpo = usuario_sujo

print(f"[{usuario_limpo}]")`,
    hints: [
      'Chame o método .strip() diretamente na variável usuario_sujo.',
      'A linha fica: usuario_limpo = usuario_sujo.strip()',
    ],
    flag: 'FLAG{string_limpa_02}',
    validate: (stdout) => {
      if (stdout.trim() === '[admin_if]') {
        return { passed: true, feedback: 'Espaços extras removidos com precisão.' };
      }
      return {
        passed: false,
        feedback: 'O console deve exibir "[admin_if]" sem espaços dentro dos colchetes.',
      };
    },
  },
  {
    id: 'M03',
    order: 3,
    circuit: 1,
    title: 'Padronizando Identidades',
    topic: 'Variáveis e Strings',
    teamRole: 'core',
    durationMinutes: 3,
    points: 60,
    microLesson: [
      'Você pode encadear métodos de string em sequência: .strip().lower().replace(".", "_").',
      '.lower() converte todas as letras para minúsculas, enquanto .replace(antigo, novo) substitui caracteres.',
      'Padronizar nomes de usuário facilita cruzar registros de login com planilhas da turma.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `nome = "  Ana.Costa  "
padrao = nome.strip().lower().replace(".", "_")
print(padrao)  # ana_costa`,
    objective:
      'Limpe os espaços, deixe tudo em minúsculas e troque o ponto "." por "_" para imprimir: maria_silva',
    starterCode: `entrada = "  Maria.Silva  "

# COMPLETE AQUI encadeando .lower() e .replace(".", "_")
usuario_final = entrada.strip()

print(usuario_final)`,
    hints: [
      'Depois de .strip(), adicione .lower() e depois .replace(".", "_").',
      'A linha completa fica: usuario_final = entrada.strip().lower().replace(".", "_")',
    ],
    flag: 'FLAG{identidade_padronizada_03}',
    validate: (stdout) => {
      if (stdout.trim() === 'maria_silva') {
        return { passed: true, feedback: 'Nome de usuário padronizado perfeitamente.' };
      }
      return {
        passed: false,
        feedback: 'A saída esperada é exatamente "maria_silva" em minúsculas e com underscore.',
      };
    },
  },
  {
    id: 'M04',
    order: 4,
    circuit: 1,
    title: 'Verificador de Porta Aberta',
    topic: 'Condicionais if/else',
    teamRole: 'core',
    durationMinutes: 3,
    points: 70,
    microLesson: [
      'Estruturas if/else permitem que o script tome decisões diferentes dependendo dos dados.',
      'O operador in verifica rapidamente se um valor existe dentro de uma lista.',
      'Lembre-se de colocar dois-pontos (:) no final do if e do else, e 4 espaços dentro de cada bloco.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if 80 in [22, 80, 443]:
    print("Permitida")
else:
    print("Bloqueada")`,
    objective:
      'Complete a condição if para verificar se porta está em portas_abertas e imprimir: ABERTA',
    starterCode: `porta = 443
portas_abertas = [22, 80, 443]

# COMPLETE AQUI a condição com "in"
if :
    print("ABERTA")
else:
    print("FECHADA")`,
    hints: [
      'Verifique se a variável porta pertence à lista portas_abertas usando o operador in.',
      'Escreva: if porta in portas_abertas:',
    ],
    flag: 'FLAG{porta_verificada_04}',
    validate: (stdout, code) => {
      if (!code.includes('if') || !code.includes('in')) {
        return { passed: false, feedback: 'Use a estrutura "if porta in portas_abertas:".' };
      }
      if (stdout.trim() === 'ABERTA') {
        return { passed: true, feedback: 'Verificação condicional de porta concluída!' };
      }
      return { passed: false, feedback: 'Para a porta 443, a saída deve ser "ABERTA".' };
    },
  },
  {
    id: 'M05',
    order: 5,
    circuit: 1,
    title: 'Validador de Tamanho de Senha',
    topic: 'Condicionais if/else',
    teamRole: 'core',
    durationMinutes: 3,
    points: 70,
    microLesson: [
      'A função len(texto) retorna quantos caracteres existem dentro de uma string.',
      'Políticas básicas de segurança exigem pelo menos 8 caracteres para evitar descoberta rápida.',
      'Combine len(senha) com o operador >= (maior ou igual) dentro de um if.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `codigo = "abc12345"
if len(codigo) >= 8:
    print("Tamanho OK")`,
    objective:
      'Complete o if usando len(senha) >= 8. Como "if2026" tem 6 caracteres, o script deve imprimir: SENHA FRACA',
    starterCode: `senha = "if2026"

# COMPLETE AQUI testando se len(senha) é maior ou igual a 8
if len(senha) :
    print("SENHA FORTE")
else:
    print("SENHA FRACA")`,
    hints: [
      'Compare o resultado de len(senha) com 8 usando >=.',
      'A linha fica: if len(senha) >= 8:',
    ],
    flag: 'FLAG{politica_senha_05}',
    validate: (stdout, code) => {
      if (!code.includes('len(') || !code.includes('8')) {
        return { passed: false, feedback: 'Use len(senha) >= 8 na condição.' };
      }
      if (stdout.trim() === 'SENHA FRACA') {
        return { passed: true, feedback: 'Validador de tamanho mínimo aprovado!' };
      }
      return { passed: false, feedback: 'Para "if2026" (6 chars), a saída esperada é "SENHA FRACA".' };
    },
  },
  {
    id: 'M06',
    order: 6,
    circuit: 1,
    title: 'Classificador de Serviço de Rede',
    topic: 'Condicionais if/elif/else',
    teamRole: 'core',
    durationMinutes: 3,
    points: 80,
    microLesson: [
      'Quando existem 3 ou mais cenários possíveis, usamos elif (abreviação de "else if").',
      'Em redes TCP/IP, a porta 22 normalmente indica SSH, enquanto 80 e 443 indicam tráfego WEB.',
      'Use == para comparar igualdade (um único = serve apenas para guardar valores).',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `if porta == 53:
    print("DNS")
elif porta == 21:
    print("FTP")
else:
    print("Outro")`,
    objective:
      'Complete o if e o elif para classificar a porta 22 e imprimir exatamente: SSH - Acesso Remoto',
    starterCode: `porta = 22

# COMPLETE AQUI as comparações de porta
if porta == :
    print("SSH - Acesso Remoto")
elif porta in [80, 443]:
    print("WEB - HTTP/HTTPS")
else:
    print("Outra porta")`,
    hints: [
      'O serviço SSH utiliza a porta padrão 22.',
      'A primeira linha condicional fica: if porta == 22:',
    ],
    flag: 'FLAG{servicos_classificados_06}',
    validate: (stdout, code) => {
      if (!code.includes('22')) {
        return { passed: false, feedback: 'Compare a porta com o número 22.' };
      }
      if (stdout.trim() === 'SSH - Acesso Remoto') {
        return { passed: true, feedback: 'Serviço SSH identificado corretamente!' };
      }
      return { passed: false, feedback: 'A saída esperada é "SSH - Acesso Remoto".' };
    },
  },
  {
    id: 'M07',
    order: 7,
    circuit: 1,
    title: 'Contando IPs da Rede Local',
    topic: 'Listas e Loops for',
    teamRole: 'core',
    durationMinutes: 3,
    points: 80,
    microLesson: [
      'Um loop for percorre automaticamente cada elemento de uma lista, um por vez.',
      'O método .startswith("192.168.") testa se uma string começa com o prefixo de rede local.',
      'Com um contador começando em 0, somamos +1 toda vez que a condição for verdadeira.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `total = 0
for item in ["ok", "erro", "ok"]:
    if item == "ok":
        total += 1
print(total)  # 2`,
    objective:
      'Percorra a lista ips, conte quantos começam com "192.168." e imprima o resultado: Rede local: 3',
    starterCode: `ips = ["192.168.1.10", "8.8.8.8", "192.168.1.25", "1.1.1.1", "192.168.0.5"]
contador = 0

for ip in ips:
    # COMPLETE AQUI verificando se ip começa com "192.168."
    if ip.startswith(""):
        contador += 1

print(f"Rede local: {contador}")`,
    hints: [
      'Passe o prefixo "192.168." dentro dos parênteses de ip.startswith(...).',
      'A linha completa fica: if ip.startswith("192.168."):',
    ],
    flag: 'FLAG{loop_ips_locais_07}',
    validate: (stdout) => {
      if (stdout.trim() === 'Rede local: 3') {
        return { passed: true, feedback: 'Os 3 endereços da rede local foram contabilizados!' };
      }
      return { passed: false, feedback: 'A saída esperada é "Rede local: 3".' };
    },
  },
  {
    id: 'M08',
    order: 8,
    circuit: 1,
    title: 'Filtrando Falhas de Login (401)',
    topic: 'Listas e Loops for',
    teamRole: 'core',
    durationMinutes: 3,
    points: 90,
    microLesson: [
      'Em logs de servidor web, o código 401 indica tentativa de acesso sem autorização.',
      'Você pode usar "401" in linha dentro de um loop for para filtrar apenas eventos de falha.',
      'Essa mesma técnica será a base da nossa investigação forense na Missão 20A.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `for linha in eventos:
    if "ERRO" in linha:
        print(linha)`,
    objective:
      'Conte quantas linhas da lista acessos possuem "401" e imprima: Falhas 401: 3',
    starterCode: `acessos = [
    "10.0.0.5 POST /login 200 OK",
    "10.0.0.9 POST /login 401 Unauthorized",
    "10.0.0.5 GET /painel 200 OK",
    "10.0.0.9 POST /login 401 Unauthorized",
    "10.0.0.2 GET /home 200 OK",
    "10.0.0.9 POST /login 401 Unauthorized",
]

falhas = 0
for linha in acessos:
    # COMPLETE AQUI: se "401" estiver na linha, some 1 em falhas
    if "" in linha:
        falhas += 1

print(f"Falhas 401: {falhas}")`,
    hints: [
      'Verifique se o texto "401" aparece dentro de cada linha do log.',
      'A condição fica: if "401" in linha:',
    ],
    flag: 'FLAG{filtro_401_08}',
    validate: (stdout) => {
      if (stdout.trim() === 'Falhas 401: 3') {
        return { passed: true, feedback: 'Filtro de falhas 401 funcionando perfeitamente!' };
      }
      return { passed: false, feedback: 'A saída esperada é "Falhas 401: 3".' };
    },
  },
  {
    id: 'M09',
    order: 9,
    circuit: 1,
    title: 'Auditoria de Portas Críticas',
    topic: 'Listas e Loops for',
    teamRole: 'core',
    durationMinutes: 3,
    points: 90,
    microLesson: [
      'Podemos cruzar duas listas usando um loop for combinado com if elemento in outra_lista.',
      'Portas como 21 (FTP), 22 (SSH) e 3306 (MySQL) merecem atenção redobrada se estiverem expostas.',
      'Imprimir apenas os itens críticos reduz o ruído visual de um relatório de segurança.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `for p in portas_ativas:
    if p in portas_sensiveis:
        print(f"Revisar porta {p}")`,
    objective:
      'Percorra portas_servidor e imprima apenas as portas que estão em risco_alto (21, 22 e 3306).',
    starterCode: `portas_servidor = [21, 22, 53, 80, 3306, 443]
risco_alto = [21, 22, 3306]

for porta in portas_servidor:
    # COMPLETE AQUI: verifique se porta está em risco_alto
    if :
        print(f"Risco alto: {porta}")`,
    hints: [
      'Use o operador in para checar se a variável porta aparece na lista risco_alto.',
      'Escreva: if porta in risco_alto:',
    ],
    flag: 'FLAG{auditoria_portas_09}',
    validate: (stdout) => {
      const lines = stdout
        .trim()
        .split('\n')
        .map((l) => l.trim());
      const hasAll =
        lines.includes('Risco alto: 21') &&
        lines.includes('Risco alto: 22') &&
        lines.includes('Risco alto: 3306') &&
        lines.length === 3;
      if (hasAll) {
        return { passed: true, feedback: 'Todas as 3 portas críticas foram sinalizadas!' };
      }
      return {
        passed: false,
        feedback: 'Imprima exatamente as 3 portas de risco alto: 21, 22 e 3306.',
      };
    },
  },
  {
    id: 'M10',
    order: 10,
    circuit: 1,
    title: 'Ranking de Tentativas com Dicionário',
    topic: 'Dicionários e Loops',
    teamRole: 'core',
    durationMinutes: 4,
    points: 100,
    microLesson: [
      'Dicionários guardam pares chave: valor — perfeitos para contar quantas vezes cada usuário apareceu.',
      'O truque contagem[chave] = contagem.get(chave, 0) + 1 evita erro na primeira vez que a chave aparece.',
      'Dominar essa linha única prepara você para caçar atacantes reais no Circuito 3.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `placar = {}
for nome in ["a", "b", "a"]:
    placar[nome] = placar.get(nome, 0) + 1
print(placar["a"])  # 2`,
    objective:
      'Complete a linha de contagem no dicionário para descobrir quantas tentativas o usuário "root" fez (3).',
    starterCode: `tentativas = ["ana", "carlos", "ana", "root", "root", "root"]
contagem = {}

for usuario in tentativas:
    # COMPLETE AQUI somando 1 usando contagem.get(usuario, 0)
    contagem[usuario] = 

print(f"root: {contagem.get('root', 0)}")`,
    hints: [
      'Use contagem.get(usuario, 0) + 1 para incrementar o valor da chave usuario.',
      'A linha fica: contagem[usuario] = contagem.get(usuario, 0) + 1',
    ],
    flag: 'FLAG{loop_dominado_10}',
    validate: (stdout) => {
      if (stdout.trim() === 'root: 3') {
        return {
          passed: true,
          feedback: 'Circuito 1 dominado! Você concluiu toda a Academia Python.',
        };
      }
      return { passed: false, feedback: 'A saída esperada é "root: 3".' };
    },
  },

  // =========================================================================
  // CIRCUITO 2: REDES DE COMPUTADORES COM PYTHON — MISSÕES 11 A 15
  // =========================================================================
  {
    id: 'M11',
    order: 11,
    circuit: 2,
    title: 'Validador de Endereços IP',
    topic: 'Endereçamento com ipaddress',
    teamRole: 'network',
    durationMinutes: 3,
    points: 110,
    microLesson: [
      'O módulo nativo ipaddress do Python valida endereços IPv4 e IPv6 reais sem precisar instalar nada.',
      'Quando passamos um IP impossível (como 999.10.0.1) para ipaddress.ip_address(), o Python levanta um ValueError.',
      'Usando try / except ValueError, capturamos IPs inválidos sem travar o programa.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `import ipaddress
try:
    ipaddress.ip_address("10.0.0.1")
    print("VALIDO")
except ValueError:
    print("INVALIDO")`,
    objective:
      'Complete o bloco try chamando ipaddress.ip_address(ip) para validar os 3 IPs da lista.',
    starterCode: `import ipaddress

ips_teste = ["192.168.1.10", "999.10.0.1", "10.0.5.25"]

for ip in ips_teste:
    try:
        # COMPLETE AQUI validando o endereço com ipaddress.ip_address(ip)
        pass
        print(f"{ip} -> VALIDO")
    except ValueError:
        print(f"{ip} -> INVALIDO")`,
    hints: [
      'Substitua "pass" pela chamada ipaddress.ip_address(ip).',
      'Dentro do try escreva: ipaddress.ip_address(ip)',
    ],
    flag: 'FLAG{ip_validado_11}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (
        text.includes('192.168.1.10 -> VALIDO') &&
        text.includes('999.10.0.1 -> INVALIDO') &&
        text.includes('10.0.5.25 -> VALIDO')
      ) {
        return { passed: true, feedback: 'Validador IPv4 com tratamento de erros aprovado!' };
      }
      return {
        passed: false,
        feedback: 'O IP 999.10.0.1 deve aparecer como INVALIDO e os outros dois como VALIDO.',
      };
    },
  },
  {
    id: 'M12',
    order: 12,
    circuit: 2,
    title: 'Calculadora de Sub-rede CIDR',
    topic: 'Endereçamento com ipaddress',
    teamRole: 'network',
    durationMinutes: 3,
    points: 120,
    microLesson: [
      'ipaddress.ip_network("192.168.10.0/24") calcula automaticamente todos os dados de uma sub-rede.',
      'Os atributos .network_address, .broadcast_address e .netmask revelam rede, broadcast e máscara.',
      'A quantidade de hosts utilizáveis em uma rede /24 é rede.num_addresses - 2 (descontando rede e broadcast).',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `import ipaddress
r = ipaddress.ip_network("10.0.0.0/24")
print(r.netmask)            # 255.255.255.0
print(r.broadcast_address)  # 10.0.0.255`,
    objective:
      'Complete o script para imprimir o endereço de broadcast (192.168.10.255) e o total de hosts válidos (254).',
    starterCode: `import ipaddress

rede = ipaddress.ip_network("192.168.10.0/24")

print(f"Rede: {rede.network_address}")
# COMPLETE AQUI usando rede.broadcast_address e rede.num_addresses - 2
print(f"Broadcast: {}")
print(f"Hosts validos: {}")`,
    hints: [
      'Use {rede.broadcast_address} na primeira linha e {rede.num_addresses - 2} na segunda.',
      'As duas linhas ficam: print(f"Broadcast: {rede.broadcast_address}") e print(f"Hosts validos: {rede.num_addresses - 2}")',
    ],
    flag: 'FLAG{subrede_calculada_12}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (
        text.includes('Rede: 192.168.10.0') &&
        text.includes('Broadcast: 192.168.10.255') &&
        text.includes('Hosts validos: 254')
      ) {
        return { passed: true, feedback: 'Cálculo de sub-rede /24 exato!' };
      }
      return {
        passed: false,
        feedback: 'Verifique se imprimiu Broadcast: 192.168.10.255 e Hosts validos: 254.',
      };
    },
  },
  {
    id: 'M13',
    order: 13,
    circuit: 2,
    title: 'Mesma Rede ou Roteamento Externo?',
    topic: 'Endereçamento com ipaddress',
    teamRole: 'network',
    durationMinutes: 3,
    points: 120,
    microLesson: [
      'Um roteador decide se entrega um pacote localmente testando se o IP de destino pertence à sub-rede.',
      'Com ipaddress, basta perguntar em Python: if pc in subrede:',
      'Essa checagem natural substitui longas contas binárias manuais.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `sub = ipaddress.ip_network("192.168.5.0/24")
host = ipaddress.ip_address("192.168.5.42")
print(host in sub)  # True`,
    objective:
      'Complete a condição para checar se pc1 e pc2 pertencem a subrede (10.20.30.0/24).',
    starterCode: `import ipaddress

subrede = ipaddress.ip_network("10.20.30.0/24")
pc1 = ipaddress.ip_address("10.20.30.15")
pc2 = ipaddress.ip_address("10.20.31.15")

# COMPLETE AQUI verificando se cada computador está dentro de subrede
for nome, ip in [("PC1", pc1), ("PC2", pc2)]:
    if :
        print(f"{nome}: MESMA REDE")
    else:
        print(f"{nome}: OUTRA REDE")`,
    hints: [
      'Use o operador in entre as variáveis ip e subrede.',
      'A linha fica: if ip in subrede:',
    ],
    flag: 'FLAG{roteamento_local_13}',
    validate: (stdout) => {
      const text = stdout.trim();
      if (text.includes('PC1: MESMA REDE') && text.includes('PC2: OUTRA REDE')) {
        return { passed: true, feedback: 'Verificação de pertencimento à sub-rede concluída!' };
      }
      return {
        passed: false,
        feedback: 'A saída deve mostrar "PC1: MESMA REDE" e "PC2: OUTRA REDE".',
      };
    },
  },
  {
    id: 'M14',
    order: 14,
    circuit: 2,
    title: 'Inspeção de Log DNS do Roteador',
    topic: 'Análise de Tráfego Simulado',
    teamRole: 'network',
    durationMinutes: 3,
    points: 130,
    microLesson: [
      'Logs de roteador costumam chegar como um bloco de texto com várias linhas separadas por quebra de linha.',
      'O método .splitlines() divide o texto em uma lista de linhas prontas para percorrer com for.',
      'Já .split() separa cada linha em colunas por espaço — assim pegamos facilmente o domínio consultado.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `linha = "14:00 10.0.0.2 DNS portal.if.edu.br"
partes = linha.split()
dominio = partes[3]  # portal.if.edu.br`,
    objective:
      'Percorra log_dns, extraia o domínio de cada linha (partes[3]) e conte quantas vezes "github.com" foi acessado (3).',
    starterCode: `log_dns = """14:01 192.168.1.10 DNS github.com
14:02 192.168.1.11 DNS portal.if.edu.br
14:03 192.168.1.12 DNS github.com
14:04 192.168.1.15 DNS docs.python.org
14:05 192.168.1.10 DNS github.com"""

acessos_github = 0
for linha in log_dns.splitlines():
    partes = linha.split()
    # COMPLETE AQUI: pegue o domínio na posição 3 e compare com "github.com"
    dominio = partes[]
    if dominio == "github.com":
        acessos_github += 1

print(f"github.com: {acessos_github}")`,
    hints: [
      'Em "14:01 192.168.1.10 DNS github.com", os índices são 0, 1, 2 e 3.',
      'A linha fica: dominio = partes[3]',
    ],
    flag: 'FLAG{dns_inspecionado_14}',
    validate: (stdout) => {
      if (stdout.trim() === 'github.com: 3') {
        return { passed: true, feedback: 'Consultas DNS analisadas com sucesso!' };
      }
      return { passed: false, feedback: 'A saída esperada é "github.com: 3".' };
    },
  },
  {
    id: 'M15',
    order: 15,
    circuit: 2,
    title: 'Domínio Mais Acessado na Rede',
    topic: 'Análise de Tráfego Simulado',
    teamRole: 'network',
    durationMinutes: 4,
    points: 140,
    microLesson: [
      'Juntando splitlines() + dicionário contador, conseguimos resumir o tráfego de toda uma sala de aula.',
      'A função max(dicionario, key=dicionario.get) devolve direto a chave que teve o maior valor numérico.',
      'Analistas de rede usam esse padrão para descobrir picos de consumo ou domínios suspeitos.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `visitas = {"siteA": 2, "siteB": 5}
campeao = max(visitas, key=visitas.get)
print(campeao)  # siteB`,
    objective:
      'Complete a contagem e use max(contagem, key=contagem.get) para imprimir o domínio mais acessado.',
    starterCode: `log_trafego = """10.0.0.1 cdn.escola.edu.br
10.0.0.2 github.com
10.0.0.3 cdn.escola.edu.br
10.0.0.4 docs.python.org
10.0.0.5 cdn.escola.edu.br
10.0.0.6 github.com
10.0.0.7 cdn.escola.edu.br
10.0.0.8 cdn.escola.edu.br"""

contagem = {}
for linha in log_trafego.splitlines():
    dominio = linha.split()[1]
    contagem[dominio] = contagem.get(dominio, 0) + 1

# COMPLETE AQUI descobrindo o domínio com mais acessos
mais_acessado = max(contagem, key=)

print(f"Top dominio: {mais_acessado} ({contagem[mais_acessado]} acessos)")`,
    hints: [
      'Passe contagem.get (sem parênteses!) no parâmetro key= da função max().',
      'A linha completa fica: mais_acessado = max(contagem, key=contagem.get)',
    ],
    flag: 'FLAG{trafego_mapeado_15}',
    validate: (stdout) => {
      if (stdout.trim() === 'Top dominio: cdn.escola.edu.br (5 acessos)') {
        return {
          passed: true,
          feedback: 'Circuito 2 concluído! Você está pronto para a Arena CTF.',
        };
      }
      return {
        passed: false,
        feedback: 'Esperado: "Top dominio: cdn.escola.edu.br (5 acessos)".',
      };
    },
  },

  // =========================================================================
  // CIRCUITO 3: ARENA CTF — SEGURANÇA DA INFORMAÇÃO (16 A 19, 20A, 20B)
  // =========================================================================
  {
    id: 'M16',
    order: 16,
    circuit: 3,
    title: 'Mensagem Oculta em Base64',
    topic: 'Codificação com base64',
    teamRole: 'blue',
    durationMinutes: 3,
    points: 150,
    microLesson: [
      'Base64 não é criptografia forte — é uma codificação muito usada em tokens, cabeçalhos HTTP e desafios CTF.',
      'O módulo base64 traz a função base64.b64decode(texto), que devolve bytes.',
      'Acrescente .decode("utf-8") ao final para transformar os bytes em uma string legível.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `import base64
segredo = base64.b64decode("T0xB").decode("utf-8")
print(segredo)  # OLA`,
    objective:
      'Decodifique a variável segredo_b64 e imprima a mensagem escondida no console.',
    starterCode: `import base64

segredo_b64 = "QUNFU1NPX0xJQkVSQURPXzIwMjY="

# COMPLETE AQUI usando base64.b64decode(...).decode("utf-8")
mensagem = 

print(mensagem)`,
    hints: [
      'Passe segredo_b64 dentro de base64.b64decode(...) e converta para texto com .decode("utf-8").',
      'A linha fica: mensagem = base64.b64decode(segredo_b64).decode("utf-8")',
    ],
    flag: 'FLAG{base64_decodificado_16}',
    validate: (stdout) => {
      if (stdout.trim() === 'ACESSO_LIBERADO_2026') {
        return { passed: true, feedback: 'Payload Base64 decodificado com sucesso!' };
      }
      return {
        passed: false,
        feedback: 'Decodifique segredo_b64 para revelar a mensagem secreta.',
      };
    },
  },
  {
    id: 'M17',
    order: 17,
    circuit: 3,
    title: 'Quebrando a Cifra de César',
    topic: 'Criptografia Clássica',
    teamRole: 'blue',
    durationMinutes: 4,
    points: 160,
    microLesson: [
      'Na Cifra de César, cada letra é deslocada no alfabeto por um número fixo de posições (aqui, deslocamento +3).',
      'ord(letra) converte uma letra no seu código numérico ASCII, e chr(numero) faz o caminho inverso.',
      'Para decifrar um texto deslocado +3, basta subtrair 3 de ord(letra) dentro de um loop for.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `letra = "D"
original = chr(ord(letra) - 3)
print(original)  # A`,
    objective:
      'Complete a linha dentro do loop for subtraindo 3 do código de cada letra de "FRGLJR" para revelar a palavra.',
    starterCode: `cifrada = "FRGLJR"
decifrada = ""

for letra in cifrada:
    # COMPLETE AQUI voltando 3 posições com chr(ord(letra) - 3)
    decifrada += 

print(decifrada)`,
    hints: [
      'Use chr(ord(letra) - 3) para converter cada caractere deslocado de volta.',
      'A linha fica: decifrada += chr(ord(letra) - 3)',
    ],
    flag: 'FLAG{cesar_quebrada_17}',
    validate: (stdout) => {
      if (stdout.trim() === 'CODIGO') {
        return { passed: true, feedback: 'Cifra de César quebrada! Mensagem original: CODIGO.' };
      }
      return {
        passed: false,
        feedback: 'A saída esperada após voltar 3 posições em "FRGLJR" é "CODIGO".',
      };
    },
  },
  {
    id: 'M18',
    order: 18,
    circuit: 3,
    title: 'Integridade com Hash SHA-256',
    topic: 'Integridade com hashlib',
    teamRole: 'blue',
    durationMinutes: 3,
    points: 160,
    microLesson: [
      'Um hash SHA-256 funciona como a "impressão digital" matemática de um arquivo ou senha.',
      'Qualquer alteração de 1 único caractere muda completamente o hash de 64 dígitos hexadecimais.',
      'Em Python, usamos hashlib.sha256(texto.encode()).hexdigest().',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `import hashlib
h = hashlib.sha256("teste".encode()).hexdigest()
print(h)`,
    objective:
      'Gere e imprima o hash SHA-256 exato da string documento ("contrato_if_2026").',
    starterCode: `import hashlib

documento = "contrato_if_2026"

# COMPLETE AQUI gerando o hash SHA-256 em formato hexadecimal
hash_doc = hashlib.sha256().hexdigest()

print(hash_doc)`,
    hints: [
      'Passe documento.encode() dentro de hashlib.sha256(...).',
      'A linha completa fica: hash_doc = hashlib.sha256(documento.encode()).hexdigest()',
    ],
    flag: 'FLAG{sha256_verificado_18}',
    validate: (stdout) => {
      const expected = 'ee4e1d134c1125547c48cca2386106c25c5df86ee2bb820b7c93b56325e6c0a1';
      if (stdout.trim().toLowerCase().includes(expected)) {
        return { passed: true, feedback: 'Impressão digital SHA-256 gerada com perfeição!' };
      }
      return {
        passed: false,
        feedback: 'Gere o hash SHA-256 de documento.encode() e imprima com .hexdigest().',
      };
    },
  },
  {
    id: 'M19',
    order: 19,
    circuit: 3,
    title: 'Auditoria de Hash com Wordlist',
    topic: 'Integridade com hashlib',
    teamRole: 'red',
    durationMinutes: 4,
    points: 180,
    microLesson: [
      'Hashes não podem ser "descriptografados" diretamente — mas senhas fracas podem ser testadas via dicionário (wordlist).',
      'O script calcula o SHA-256 de cada palavra da lista e compara com o hash vazado.',
      'É por isso que senhas previsíveis caem em milissegundos e sistemas reais usam salting + hashing lento.',
    ],
    exampleTitle: 'Exemplo rápido',
    exampleCode: `for palavra in lista:
    if hashlib.sha256(palavra.encode()).hexdigest() == alvo_hash:
        print(f"Encontrada: {palavra}")
        break`,
    objective:
      'Complete o loop sobre wordlist para descobrir qual das 10 senhas corresponde a hash_vazado e imprima a senha encontrada.',
    setupPython: `import hashlib
wordlist = [
    "123456", "admin123", "escola2026", "python", "if_campus",
    "rede_segura", "qwerty", "senha123", "lab_redes", "cyber2026"
]
hash_vazado = hashlib.sha256("rede_segura".encode()).hexdigest()
`,
    starterCode: `import hashlib

# As variáveis wordlist (10 senhas) e hash_vazado já estão carregadas no ambiente!
for senha in wordlist:
    # COMPLETE AQUI gerando o SHA-256 de senha
    tentativa = hashlib.sha256().hexdigest()
    if tentativa == hash_vazado:
        print(f"Senha encontrada: {senha}")
        break`,
    hints: [
      'Dentro de hashlib.sha256(...), passe senha.encode().',
      'A linha fica: tentativa = hashlib.sha256(senha.encode()).hexdigest()',
    ],
    flag: 'FLAG{wordlist_quebrada_19}',
    validate: (stdout) => {
      if (stdout.includes('rede_segura')) {
        return {
          passed: true,
          feedback: 'Senha fraca localizada via wordlist! Hora da Fase Final Dupla (20A e 20B).',
        };
      }
      return {
        passed: false,
        feedback: 'O console deve exibir a senha correspondente ao hash_vazado.',
      };
    },
  },
  {
    id: 'M20A',
    order: 20,
    circuit: 3,
    title: 'Chefão 20A · Blue Team (Defesa e Forense)',
    topic: 'Forense de Logs · 50 linhas',
    teamRole: 'blue',
    durationMinutes: 5,
    points: 250,
    microLesson: [
      'Cenário: o servidor da escola sofreu dezenas de tentativas de invasão durante a madrugada.',
      'A variável logs (50 linhas reais simuladas) já foi injetada no ambiente. Cada linha segue o padrão: "HORA IP METODO ROTA STATUS".',
      'Escreva um loop for com dicionário para contar qual IP acumulou mais de 5 falhas "401 Unauthorized" e isole o atacante.',
    ],
    exampleTitle: 'Estrutura forense',
    exampleCode: `for linha in logs:
    if "401 Unauthorized" in linha:
        ip = linha.split()[1]
        falhas[ip] = falhas.get(ip, 0) + 1`,
    objective:
      'Conte as falhas "401 Unauthorized" por IP na variável logs e imprima o endereço IP que passou de 5 falhas.',
    setupPython: MISSION_20A_SETUP,
    starterCode: `# A variável "logs" com 50 linhas de acesso já está carregada automaticamente!
falhas = {}

for linha in logs:
    if "401 Unauthorized" in linha:
        ip = linha.split()[1]
        # COMPLETE AQUI somando 1 no dicionário falhas para esse IP
        falhas[ip] = 

# COMPLETE AQUI imprimindo o IP que teve mais de 5 falhas
for ip, total in falhas.items():
    if total > :
        print(f"IP atacante bloqueado: {ip} ({total} falhas)")`,
    hints: [
      'Na primeira lacuna use falhas.get(ip, 0) + 1. Na segunda lacuna compare total > 5.',
      'Linhas completas: falhas[ip] = falhas.get(ip, 0) + 1  e  if total > 5:',
    ],
    flag: 'FLAG{blue_team_ameaca_bloqueada}',
    validate: (stdout) => {
      if (stdout.includes('185.220.101.47')) {
        return {
          passed: true,
          feedback:
            'Ameaça neutralizada! IP atacante 185.220.101.47 identificado com 9 falhas 401.',
        };
      }
      return {
        passed: false,
        feedback:
          'Isole e imprima o endereço IP que acumulou mais de 5 falhas "401 Unauthorized".',
      };
    },
  },
  {
    id: 'M20B',
    order: 21,
    circuit: 3,
    title: 'Chefão 20B · Red Team (Ataque Ético e Automação)',
    topic: 'Fuzzing + Força Bruta Controlada',
    teamRole: 'red',
    durationMinutes: 5,
    points: 300,
    microLesson: [
      'Cenário: o módulo simulado alvo já está carregado em memória — 100% seguro na aba do navegador.',
      'Etapa 1 (Reconhecimento): percorra rotas comuns em alvo.acessar(rota) até encontrar a que responde "200 OK" e vaza o usuário admin_sys.',
      'Etapa 2 (Exploração): use range(1000, 10000) em alvo.autenticar("admin_sys", str(pin)) até capturar a FLAG secreta e pare com break.',
    ],
    exampleTitle: 'Funções do cofre virtual',
    exampleCode: `alvo.acessar("/backup")            # testa rota
alvo.autenticar("admin_sys", "1234")  # testa PIN`,
    objective:
      'Complete as duas etapas (reconhecimento de rota exposta + automação de PIN 4 dígitos) para capturar a FLAG do cofre virtual.',
    setupPython: MISSION_20B_SETUP,
    starterCode: `# O módulo simulado "alvo" já está pronto em memória (zero tráfego de rede)!

# Etapa 1: Descobrir rota exposta (Fuzzing de Diretórios)
rotas = ["/login", "/imagens", "/backup", "/admin", "/config"]
for rota in rotas:
    resposta = alvo.acessar(rota)
    if "200 OK" in resposta:
        print(f"Rota encontrada: {rota} -> {resposta}")

# Etapa 2: Quebrar o PIN fraco de 4 dígitos (1000 a 9999)
for pin in range(1000, 10000):
    # COMPLETE AQUI chamando alvo.autenticar("admin_sys", str(pin))
    resultado = 
    if "FLAG" in resultado:
        print(f"Acesso obtido com PIN {pin}: {resultado}")
        break`,
    hints: [
      'Chame alvo.autenticar("admin_sys", str(pin)) dentro do segundo loop for.',
      'A linha completa fica: resultado = alvo.autenticar("admin_sys", str(pin))',
    ],
    flag: 'FLAG{red_team_pin_quebrado}',
    hasPurpleBonus: true,
    validate: (stdout) => {
      if (stdout.includes('FLAG{red_team_pin_quebrado}')) {
        return {
          passed: true,
          feedback:
            'Cofre auditado com sucesso! Rota /backup exposta e PIN 4827 quebrado em milissegundos.',
        };
      }
      return {
        passed: false,
        feedback:
          'O script precisa encontrar o PIN correto via alvo.autenticar("admin_sys", str(pin)) e imprimir a FLAG.',
      };
    },
  },
];

export function getMissionById(id: string): Mission {
  return MISSIONS.find((m) => m.id === id) ?? MISSIONS[0];
}

export function getStudentRankTitle(completedCount: number): string {
  if (completedCount >= 21) return 'Especialista Purple Team';
  if (completedCount >= 16) return 'Analista CTF';
  if (completedCount >= 11) return 'Engenheiro de Redes';
  if (completedCount >= 5) return 'Operador Python';
  return 'Recruta PySec';
}
