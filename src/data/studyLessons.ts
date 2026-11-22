import { StudyLesson } from '../types/ctf';
import { PROTOCOLOS_STUDY_LESSON } from './lessons/protocolos';

export const STUDY_LESSONS: StudyLesson[] = [
  // =========================================================================
  // CIRCUITO 1 — BASE PYTHON
  // =========================================================================
  {
    id: 'L01',
    order: 1,
    circuit: 1,
    title: 'Variáveis, Strings e print()',
    subtitle: 'Prepara para Missões M01 a M03',
    readTimeMinutes: 3,
    relatedMissionIds: ['M01', 'M02', 'M03'],
    intro: [
      'Uma variável funciona como uma caixa com etiqueta onde o Python guarda um texto (string) ou número para usar depois.',
      'Para mostrar resultados na tela usamos print(). Quando colocamos a letra f antes das aspas — f"..." — podemos inserir variáveis dentro de chaves {}.',
      'Strings também têm comandos prontos (métodos): .strip() tira espaços sobrando nas pontas, .lower() deixa tudo minúsculo e .replace(a, b) troca caracteres.',
    ],
    commandTable: [
      {
        command: 'nome = "Ana"',
        meaning: 'Guarda um texto dentro de uma variável',
        example: 'ip = "10.0.0.1"',
      },
      {
        command: 'print(f"IP: {ip}")',
        meaning: 'Exibe texto misturado com variável',
        example: 'IP: 10.0.0.1',
      },
      {
        command: 'texto.strip()',
        meaning: 'Remove espaços extras no início e fim',
        example: '"  oi  ".strip() -> "oi"',
      },
      {
        command: 'texto.lower()',
        meaning: 'Converte todas as letras para minúsculas',
        example: '"ADMIN".lower() -> "admin"',
      },
      {
        command: 'texto.replace(".", "_")',
        meaning: 'Substitui um trecho do texto por outro',
        example: '"a.b".replace(".", "_") -> "a_b"',
      },
    ],
    sandboxExamples: [
      {
        label: 'Montar alerta',
        code: `servidor = "lab-01"
porta = 22
print(f"Servidor {servidor} ativo na porta {porta}")`,
      },
      {
        label: 'Limpar texto',
        code: `login_bruto = "   Carlos.Silva   "
limpo = login_bruto.strip().lower().replace(".", "_")
print(f"Original: [{login_bruto}]")
print(f"Padrao:   [{limpo}]")`,
      },
    ],
    drills: [
      {
        id: 'L01-D1',
        step: 1,
        title: 'Repetição 1 · Alterar valor',
        prompt: 'Mude o valor da variável status para "ONLINE" e clique em Testar.',
        starterCode: `servidor = "proxy_if"
status = "OFFLINE"
print(f"{servidor}: {status}")`,
        hint: 'Troque "OFFLINE" por "ONLINE" na linha 2.',
        validate: (stdout) =>
          stdout.trim() === 'proxy_if: ONLINE'
            ? { passed: true, feedback: 'Perfeito! Você atualizou a variável e viu o print mudar.' }
            : { passed: false, feedback: 'A saída esperada é "proxy_if: ONLINE".' },
      },
      {
        id: 'L01-D2',
        step: 2,
        title: 'Repetição 2 · Limpar espaços',
        prompt: 'Use .strip() na variável entrada para imprimir "root" sem espaços.',
        starterCode: `entrada = "   root   "
limpo = entrada
print(f"[{limpo}]")`,
        hint: 'Escreva: limpo = entrada.strip()',
        validate: (stdout) =>
          stdout.trim() === '[root]'
            ? { passed: true, feedback: 'Ótimo! O .strip() limpou as bordas do texto.' }
            : { passed: false, feedback: 'O console deve mostrar exatamente "[root]".' },
      },
      {
        id: 'L01-D3',
        step: 3,
        title: 'Repetição 3 · Encadear métodos',
        prompt: 'Deixe "  Joao.Pedro  " em minúsculas e sem espaços com "_" no lugar do ponto.',
        starterCode: `nome = "  Joao.Pedro  "
# Use .strip().lower().replace(".", "_")
resultado = nome.strip()
print(resultado)`,
        hint: 'resultado = nome.strip().lower().replace(".", "_")',
        validate: (stdout) =>
          stdout.trim() === 'joao_pedro'
            ? { passed: true, feedback: 'Dominado! Você já está pronto para as Missões M01 a M03.' }
            : { passed: false, feedback: 'A saída esperada é "joao_pedro".' },
      },
    ],
  },

  {
    id: 'L02',
    order: 2,
    circuit: 1,
    title: 'Condicionais if, elif e else',
    subtitle: 'Prepara para Missões M04 a M06',
    readTimeMinutes: 3,
    relatedMissionIds: ['M04', 'M05', 'M06'],
    intro: [
      'Com if e else, seu script consegue tomar decisões automáticas — por exemplo, aprovar ou rejeitar uma senha ou porta de rede.',
      'A regra de ouro em Python: toda linha de if, elif ou else termina com dois-pontos (:) e o código que pertence a ela fica recuado 4 espaços à direita.',
      'Usamos == para testar igualdade, >= para maior ou igual, len(texto) para contar caracteres e o operador in para checar se algo está em uma lista.',
    ],
    commandTable: [
      {
        command: 'if porta == 22:',
        meaning: 'Executa o bloco se a comparação for verdadeira',
        example: 'print("SSH")',
      },
      {
        command: 'elif porta == 80:',
        meaning: 'Testa uma segunda opção se a anterior falhou',
        example: 'print("HTTP")',
      },
      {
        command: 'else:',
        meaning: 'Executa quando nenhuma condição acima bateu',
        example: 'print("Outra")',
      },
      {
        command: 'x in lista',
        meaning: 'Retorna True se x existir dentro da lista',
        example: '80 in [22, 80, 443]',
      },
      {
        command: 'len(senha)',
        meaning: 'Conta quantos caracteres a string possui',
        example: 'len("abc123") -> 6',
      },
    ],
    sandboxExamples: [
      {
        label: 'Checar porta',
        code: `porta = 80
abertas = [22, 80, 443]
if porta in abertas:
    print(f"Porta {porta} esta ABERTA")
else:
    print(f"Porta {porta} esta FECHADA")`,
      },
      {
        label: 'Tamanho de senha',
        code: `senha = "seguranca2026"
print(f"Tamanho: {len(senha)} caracteres")
if len(senha) >= 8:
    print("OK - Tamanho seguro")
else:
    print("CURTA - Use pelo menos 8 caracteres")`,
      },
    ],
    drills: [
      {
        id: 'L02-D1',
        step: 1,
        title: 'Repetição 1 · Operador in',
        prompt: 'Complete o if para testar se porta está dentro de permitidas.',
        starterCode: `porta = 80
permitidas = [80, 443]
if :
    print("LIBERADA")
else:
    print("BLOQUEADA")`,
        hint: 'Escreva: if porta in permitidas:',
        validate: (stdout) =>
          stdout.trim() === 'LIBERADA'
            ? { passed: true, feedback: 'Excelente! O operador in encontrou a porta 80.' }
            : { passed: false, feedback: 'A saída esperada é "LIBERADA".' },
      },
      {
        id: 'L02-D2',
        step: 2,
        title: 'Repetição 2 · Checar len()',
        prompt: 'Teste se len(codigo) >= 6 para imprimir "VALIDO".',
        starterCode: `codigo = "abc1234"
if len(codigo) :
    print("VALIDO")
else:
    print("CURTO")`,
        hint: 'Escreva: if len(codigo) >= 6:',
        validate: (stdout) =>
          stdout.trim() === 'VALIDO'
            ? { passed: true, feedback: 'Correto! "abc1234" tem 7 caracteres (>= 6).' }
            : { passed: false, feedback: 'Complete com >= 6 para imprimir "VALIDO".' },
      },
      {
        id: 'L02-D3',
        step: 3,
        title: 'Repetição 3 · Usando elif',
        prompt: 'Complete o elif para reconhecer a porta 443 como "HTTPS".',
        starterCode: `porta = 443
if porta == 22:
    print("SSH")
elif porta == :
    print("HTTPS")
else:
    print("OUTRA")`,
        hint: 'Coloque 443 após == na linha do elif.',
        validate: (stdout) =>
          stdout.trim() === 'HTTPS'
            ? { passed: true, feedback: 'Show! Você já domina if/elif/else para as Missões M04 a M06.' }
            : { passed: false, feedback: 'A saída esperada para porta 443 é "HTTPS".' },
      },
    ],
  },

  {
    id: 'L03',
    order: 3,
    circuit: 1,
    title: 'Listas e Loops for',
    subtitle: 'Prepara para Missões M07 a M09',
    readTimeMinutes: 3,
    relatedMissionIds: ['M07', 'M08', 'M09'],
    intro: [
      'Uma lista guarda vários valores em sequência dentro de colchetes: [22, 80, 443].',
      'O loop for percorre cada item da lista automaticamente, evitando que você tenha que escrever o mesmo código dezenas de vezes.',
      'Combinando for + if + um contador (total += 1), conseguimos filtrar IPs da rede local ou contar tentativas de login com erro em segundos.',
    ],
    commandTable: [
      {
        command: 'for x in lista:',
        meaning: 'Repete o bloco para cada elemento da lista',
        example: 'for ip in ips:',
      },
      {
        command: 'total += 1',
        meaning: 'Soma 1 ao valor atual do contador',
        example: 'total = total + 1',
      },
      {
        command: 's.startswith("10.")',
        meaning: 'Verifica se o texto começa com um prefixo',
        example: '"10.0.0.1".startswith("10.") -> True',
      },
      {
        command: '"401" in linha',
        meaning: 'Verifica se um trecho existe dentro da string',
        example: '"401" in "POST 401" -> True',
      },
    ],
    sandboxExamples: [
      {
        label: 'Percorrer IPs',
        code: `ips = ["192.168.0.10", "8.8.8.8", "192.168.0.22"]
for ip in ips:
    if ip.startswith("192.168."):
        print(f"Local: {ip}")`,
      },
      {
        label: 'Contar erros',
        code: `eventos = ["200 OK", "401 Erro", "401 Erro", "200 OK"]
erros = 0
for e in eventos:
    if "401" in e:
        erros += 1
print(f"Total de erros: {erros}")`,
      },
    ],
    drills: [
      {
        id: 'L03-D1',
        step: 1,
        title: 'Repetição 1 · Contar itens',
        prompt: 'Some 1 em total para cada porta na lista e imprima Total: 4.',
        starterCode: `portas = [21, 22, 80, 443]
total = 0
for p in portas:
    total += 0
print(f"Total: {total}")`,
        hint: 'Troque total += 0 por total += 1.',
        validate: (stdout) =>
          stdout.trim() === 'Total: 4'
            ? { passed: true, feedback: 'Contador funcionando direitinho!' }
            : { passed: false, feedback: 'A saída esperada é "Total: 4".' },
      },
      {
        id: 'L03-D2',
        step: 2,
        title: 'Repetição 2 · Filtrar prefixo',
        prompt: 'Conte quantos IPs começam com "10." usando .startswith("10.").',
        starterCode: `ips = ["10.0.0.1", "8.8.8.8", "10.0.0.5"]
internos = 0
for ip in ips:
    if ip.startswith(""):
        internos += 1
print(internos)`,
        hint: 'Escreva: if ip.startswith("10."):',
        validate: (stdout) =>
          stdout.trim() === '2'
            ? { passed: true, feedback: 'Perfeito! Os 2 IPs da rede 10.x foram filtrados.' }
            : { passed: false, feedback: 'O console deve exibir "2".' },
      },
      {
        id: 'L03-D3',
        step: 3,
        title: 'Repetição 3 · Buscar texto no log',
        prompt: 'Conte quantas linhas contêm "ERRO" e imprima o número (2).',
        starterCode: `linhas = ["OK login", "ERRO senha", "OK home", "ERRO token"]
qtd = 0
for linha in linhas:
    if "" in linha:
        qtd += 1
print(qtd)`,
        hint: 'Escreva: if "ERRO" in linha:',
        validate: (stdout) =>
          stdout.trim() === '2'
            ? { passed: true, feedback: 'Ótimo! Você está pronto para as Missões M07 a M09.' }
            : { passed: false, feedback: 'O console deve exibir "2".' },
      },
    ],
  },

  {
    id: 'L04',
    order: 4,
    circuit: 1,
    title: 'Dicionários como Contadores',
    subtitle: 'Prepara para Missão M10 e Chefão 20A',
    readTimeMinutes: 3,
    relatedMissionIds: ['M10', 'M20A'],
    intro: [
      'Um dicionário {} relaciona cada chave (ex.: um usuário ou IP) a um valor (ex.: quantas vezes ele falhou o login).',
      'O padrão contagem[chave] = contagem.get(chave, 0) + 1 é um dos truques mais úteis do Python: se a chave não existir ainda, começa em 0 e soma 1.',
      'Depois de preencher o dicionário, podemos percorrê-lo com for chave, valor in contagem.items(): ou achar o campeão com max(contagem, key=contagem.get).',
    ],
    commandTable: [
      {
        command: 'd = {}',
        meaning: 'Cria um dicionário vazio',
        example: 'falhas = {}',
      },
      {
        command: 'd.get(chave, 0)',
        meaning: 'Lê o valor da chave ou devolve 0 se não existir',
        example: 'falhas.get("root", 0)',
      },
      {
        command: 'd[k] = d.get(k, 0) + 1',
        meaning: 'Incrementa o contador da chave k sem dar KeyError',
        example: 'falhas[ip] = falhas.get(ip, 0) + 1',
      },
      {
        command: 'for k, v in d.items():',
        meaning: 'Percorre cada par chave e valor do dicionário',
        example: 'if v > 5: print(k)',
      },
    ],
    sandboxExamples: [
      {
        label: 'Contar acessos',
        code: `usuarios = ["ana", "root", "ana", "root", "root"]
contagem = {}
for u in usuarios:
    contagem[u] = contagem.get(u, 0) + 1

for nome, qtd in contagem.items():
    print(f"{nome} -> {qtd}x")`,
      },
    ],
    drills: [
      {
        id: 'L04-D1',
        step: 1,
        title: 'Repetição 1 · Somar no dicionário',
        prompt: 'Complete a contagem para imprimir "admin: 2".',
        starterCode: `lista = ["admin", "user", "admin"]
c = {}
for item in lista:
    c[item] = 
print(f"admin: {c.get('admin', 0)}")`,
        hint: 'Escreva: c[item] = c.get(item, 0) + 1',
        validate: (stdout) =>
          stdout.trim() === 'admin: 2'
            ? { passed: true, feedback: 'Acertou! Esse padrão resolve tanto a M10 quanto a 20A.' }
            : { passed: false, feedback: 'A saída esperada é "admin: 2".' },
      },
      {
        id: 'L04-D2',
        step: 2,
        title: 'Repetição 2 · Filtrar por limite',
        prompt: 'Imprima apenas o IP que teve mais de 3 falhas (10.0.0.9).',
        starterCode: `falhas = {"10.0.0.2": 1, "10.0.0.9": 6}
for ip, total in falhas.items():
    if total > :
        print(ip)`,
        hint: 'Escreva: if total > 3:',
        validate: (stdout) =>
          stdout.trim() === '10.0.0.9'
            ? { passed: true, feedback: 'Perfeito! Apenas o IP acima do limite foi exibido.' }
            : { passed: false, feedback: 'A saída esperada é "10.0.0.9".' },
      },
      {
        id: 'L04-D3',
        step: 3,
        title: 'Repetição 3 · Achar o maior valor',
        prompt: 'Use max(cliques, key=cliques.get) para imprimir o item mais frequente.',
        starterCode: `cliques = {"home": 2, "login": 9, "sobre": 1}
top = max(cliques, key=)
print(top)`,
        hint: 'Escreva: top = max(cliques, key=cliques.get)',
        validate: (stdout) =>
          stdout.trim() === 'login'
            ? { passed: true, feedback: 'Dominado! Pronto para M10, M15 e o Chefão 20A.' }
            : { passed: false, feedback: 'A saída esperada é "login".' },
      },
    ],
  },

  // =========================================================================
  // CIRCUITO 2 — REDES DE COMPUTADORES
  // =========================================================================
  {
    id: 'L05',
    order: 5,
    circuit: 2,
    title: 'Endereçamento IP e Sub-redes (ipaddress)',
    subtitle: 'Prepara para Missões M11 a M13',
    readTimeMinutes: 3,
    relatedMissionIds: ['M11', 'M12', 'M13'],
    intro: [
      'A biblioteca padrão ipaddress já vem embutida no Python e entende endereços IPv4/IPv6 e notação CIDR (como 192.168.10.0/24).',
      'ipaddress.ip_address("10.0.0.1") valida um IP único; se o endereço for inválido (ex.: 999.1.1.1), dispara um ValueError que capturamos com try / except.',
      'ipaddress.ip_network("192.168.10.0/24") entrega na hora .network_address, .broadcast_address, .netmask e .num_addresses — além de permitir testar se um host está na rede com host in rede.',
    ],
    commandTable: [
      {
        command: 'ipaddress.ip_address(s)',
        meaning: 'Cria e valida um endereço IP',
        example: 'ipaddress.ip_address("10.0.0.5")',
      },
      {
        command: 'ipaddress.ip_network(cidr)',
        meaning: 'Cria uma sub-rede CIDR completa',
        example: 'ipaddress.ip_network("10.0.0.0/24")',
      },
      {
        command: 'rede.broadcast_address',
        meaning: 'Retorna o IP de broadcast da sub-rede',
        example: '10.0.0.255',
      },
      {
        command: 'rede.num_addresses - 2',
        meaning: 'Calcula quantos hosts válidos cabem na rede',
        example: '254 em uma rede /24',
      },
      {
        command: 'ip in rede',
        meaning: 'Verifica se o IP pertence àquela sub-rede',
        example: 'True ou False',
      },
    ],
    sandboxExamples: [
      {
        label: 'Inspecionar /24',
        code: `import ipaddress
rede = ipaddress.ip_network("192.168.10.0/24")
print("Rede:", rede.network_address)
print("Mascara:", rede.netmask)
print("Broadcast:", rede.broadcast_address)
print("Hosts validos:", rede.num_addresses - 2)`,
      },
      {
        label: 'Validar com try/except',
        code: `import ipaddress
for texto in ["192.168.0.1", "300.0.0.1"]:
    try:
        ipaddress.ip_address(texto)
        print(texto, "-> VALIDO")
    except ValueError:
        print(texto, "-> INVALIDO")`,
      },
    ],
    drills: [
      {
        id: 'L05-D1',
        step: 1,
        title: 'Repetição 1 · Pegar a máscara',
        prompt: 'Imprima a máscara (.netmask) da rede 10.0.0.0/24 (255.255.255.0).',
        starterCode: `import ipaddress
rede = ipaddress.ip_network("10.0.0.0/24")
print(rede.)`,
        hint: 'Escreva: print(rede.netmask)',
        validate: (stdout) =>
          stdout.trim() === '255.255.255.0'
            ? { passed: true, feedback: 'Exato! Máscara /24 = 255.255.255.0.' }
            : { passed: false, feedback: 'A saída esperada é "255.255.255.0".' },
      },
      {
        id: 'L05-D2',
        step: 2,
        title: 'Repetição 2 · Hosts em /24',
        prompt: 'Imprima quantos hosts válidos existem em 192.168.1.0/24 usando num_addresses - 2.',
        starterCode: `import ipaddress
rede = ipaddress.ip_network("192.168.1.0/24")
print(rede.num_addresses - )`,
        hint: 'Subtraia 2 (endereço de rede e broadcast): print(rede.num_addresses - 2)',
        validate: (stdout) =>
          stdout.trim() === '254'
            ? { passed: true, feedback: 'Correto! 256 endereços menos 2 = 254 hosts válidos.' }
            : { passed: false, feedback: 'A saída esperada é "254".' },
      },
      {
        id: 'L05-D3',
        step: 3,
        title: 'Repetição 3 · Testar pertencimento',
        prompt: 'Complete o if com ip in rede para imprimir "DENTRO".',
        starterCode: `import ipaddress
rede = ipaddress.ip_network("172.16.0.0/24")
ip = ipaddress.ip_address("172.16.0.50")
if :
    print("DENTRO")`,
        hint: 'Escreva: if ip in rede:',
        validate: (stdout) =>
          stdout.trim() === 'DENTRO'
            ? { passed: true, feedback: 'Ótimo! Pronto para as Missões M11 a M13.' }
            : { passed: false, feedback: 'A saída esperada é "DENTRO".' },
      },
    ],
  },

  {
    id: 'L06',
    order: 6,
    circuit: 2,
    title: 'Análise de Logs com split() e splitlines()',
    subtitle: 'Prepara para Missões M14, M15 e 20A',
    readTimeMinutes: 3,
    relatedMissionIds: ['M14', 'M15', 'M20A'],
    intro: [
      'Logs de roteadores, servidores web e DNS são textos com várias linhas divididas em colunas separadas por espaço.',
      'Primeiro usamos texto.splitlines() para transformar o bloco inteiro em uma lista de linhas.',
      'Dentro do loop for, usamos linha.split() para separar a linha em colunas: posição [0] é a primeira coluna, [1] é a segunda, [2] é a terceira e assim por diante.',
    ],
    commandTable: [
      {
        command: 'bloco.splitlines()',
        meaning: 'Divide um texto de várias linhas em uma lista',
        example: 'for linha in log.splitlines():',
      },
      {
        command: 'linha.split()',
        meaning: 'Divide a linha nos espaços em uma lista de palavras',
        example: '"14:00 10.0.0.1 OK".split()',
      },
      {
        command: 'partes[1]',
        meaning: 'Pega a 2ª coluna da linha (índices começam em 0)',
        example: 'ip = linha.split()[1]',
      },
    ],
    sandboxExamples: [
      {
        label: 'Fatiar linha de log',
        code: `linha = "14:05 192.168.1.10 DNS github.com"
partes = linha.split()
print("Indice 0 (hora):", partes[0])
print("Indice 1 (IP):", partes[1])
print("Indice 2 (tipo):", partes[2])
print("Indice 3 (dominio):", partes[3])`,
      },
    ],
    drills: [
      {
        id: 'L06-D1',
        step: 1,
        title: 'Repetição 1 · Extrair IP da linha',
        prompt: 'Extraia o IP usando partes[1] para imprimir "10.0.0.8".',
        starterCode: `linha = "09:10 10.0.0.8 GET /home"
partes = linha.split()
print(partes[])`,
        hint: 'Coloque o índice 1 dentro dos colchetes: partes[1]',
        validate: (stdout) =>
          stdout.trim() === '10.0.0.8'
            ? { passed: true, feedback: 'Isso! Em Python a contagem começa do 0.' }
            : { passed: false, feedback: 'A saída esperada é "10.0.0.8".' },
      },
      {
        id: 'L06-D2',
        step: 2,
        title: 'Repetição 2 · Percorrer múltiplas linhas',
        prompt: 'Use log.splitlines() no loop for para imprimir os 2 domínios.',
        starterCode: `log = """10.0.0.1 if.edu.br
10.0.0.2 python.org"""
for linha in log.:
    print(linha.split()[1])`,
        hint: 'Escreva: for linha in log.splitlines():',
        validate: (stdout) =>
          stdout.trim().includes('if.edu.br') && stdout.trim().includes('python.org')
            ? { passed: true, feedback: 'Perfeito! Cada linha virou um item do loop.' }
            : { passed: false, feedback: 'Imprima os dois domínios usando log.splitlines().' },
      },
      {
        id: 'L06-D3',
        step: 3,
        title: 'Repetição 3 · Contar domínio específico',
        prompt: 'Conte quantas linhas acessam "if.edu.br" (2).',
        starterCode: `log = """10.0.0.1 if.edu.br
10.0.0.2 github.com
10.0.0.3 if.edu.br"""
total = 0
for linha in log.splitlines():
    if linha.split()[1] == "":
        total += 1
print(total)`,
        hint: 'Compare com "if.edu.br".',
        validate: (stdout) =>
          stdout.trim() === '2'
            ? { passed: true, feedback: 'Pronto para as Missões M14 e M15!' }
            : { passed: false, feedback: 'A saída esperada é "2".' },
      },
    ],
  },
  PROTOCOLOS_STUDY_LESSON,

  // =========================================================================
  // CIRCUITO 3 — SEGURANÇA DA INFORMAÇÃO (CTF)
  // =========================================================================
  {
    id: 'L07',
    order: 7,
    circuit: 3,
    title: 'Base64 e Cifra de César',
    subtitle: 'Prepara para Missões M16 e M17',
    readTimeMinutes: 3,
    relatedMissionIds: ['M16', 'M17'],
    intro: [
      'Em desafios CTF, é comum encontrar mensagens codificadas em Base64 (facilmente reconhecíveis por terminarem com "=" ou "==").',
      'O módulo base64 decodifica esses dados em 1 linha: base64.b64decode(texto).decode("utf-8").',
      'Já na Cifra de César, cada letra foi avançada N posições no alfabeto. Usamos ord(letra) para pegar o número ASCII e chr(numero - N) para voltar à letra original.',
    ],
    commandTable: [
      {
        command: 'base64.b64decode(s)',
        meaning: 'Decodifica uma string Base64 para bytes',
        example: 'b"OLA"',
      },
      {
        command: '.decode("utf-8")',
        meaning: 'Transforma bytes em string legível',
        example: 'b"OLA".decode("utf-8") -> "OLA"',
      },
      {
        command: 'ord("D")',
        meaning: 'Mostra o código numérico ASCII da letra',
        example: 'ord("D") -> 68',
      },
      {
        command: 'chr(68 - 3)',
        meaning: 'Converte o código numérico de volta em letra',
        example: 'chr(65) -> "A"',
      },
    ],
    sandboxExamples: [
      {
        label: 'Decodificar Base64',
        code: `import base64
codificado = "UFlTRUNfMjAyNg=="
texto = base64.b64decode(codificado).decode("utf-8")
print("Decodificado:", texto)`,
      },
      {
        label: 'Voltar Cifra de César (-3)',
        code: `cifrada = "UHG"
limpa = ""
for letra in cifrada:
    limpa += chr(ord(letra) - 3)
print("Original:", limpa)`,
      },
    ],
    drills: [
      {
        id: 'L07-D1',
        step: 1,
        title: 'Repetição 1 · Decodificar Base64',
        prompt: 'Decodifique "T0xB" para imprimir "OLA".',
        starterCode: `import base64
dado = "T0xB"
print(base64.b64decode().decode("utf-8"))`,
        hint: 'Passe dado dentro de b64decode(dado).',
        validate: (stdout) =>
          stdout.trim() === 'OLA'
            ? { passed: true, feedback: 'Decodificação Base64 concluída!' }
            : { passed: false, feedback: 'A saída esperada é "OLA".' },
      },
      {
        id: 'L07-D2',
        step: 2,
        title: 'Repetição 2 · Voltar 1 letra',
        prompt: 'Subtraia 1 de ord("B") dentro de chr(...) para imprimir "A".',
        starterCode: `letra = "B"
print(chr(ord(letra) - ))`,
        hint: 'Escreva: print(chr(ord(letra) - 1))',
        validate: (stdout) =>
          stdout.trim() === 'A'
            ? { passed: true, feedback: 'Exato! ord("B")=66, 66-1=65 -> chr(65)="A".' }
            : { passed: false, feedback: 'A saída esperada é "A".' },
      },
      {
        id: 'L07-D3',
        step: 3,
        title: 'Repetição 3 · Decifrar palavra',
        prompt: 'Volte 3 posições em "LIR" para revelar "IFO".',
        starterCode: `palavra = "LIR"
saida = ""
for c in palavra:
    saida += chr(ord(c) - )
print(saida)`,
        hint: 'Subtraia 3: saida += chr(ord(c) - 3)',
        validate: (stdout) =>
          stdout.trim() === 'IFO'
            ? { passed: true, feedback: 'Excelente! Você já pode encarar M16 e M17.' }
            : { passed: false, feedback: 'A saída esperada é "IFO".' },
      },
    ],
  },

  {
    id: 'L08',
    order: 8,
    circuit: 3,
    title: 'Hashes SHA-256 e Wordlists (hashlib)',
    subtitle: 'Prepara para Missões M18 e M19',
    readTimeMinutes: 3,
    relatedMissionIds: ['M18', 'M19'],
    intro: [
      'Um hash SHA-256 transforma qualquer texto em uma assinatura fixa de 64 caracteres hexadecimais — muito usada para verificar integridade de arquivos e proteger senhas.',
      'Como o hash espera bytes (e não texto puro), sempre chamamos .encode() antes: hashlib.sha256(texto.encode()).hexdigest().',
      'Em uma auditoria por wordlist, percorremos uma lista de senhas comuns, geramos o SHA-256 de cada uma e comparamos com o hash vazado até encontrar o par.',
    ],
    commandTable: [
      {
        command: 'texto.encode()',
        meaning: 'Converte string em bytes para calcular o hash',
        example: '"abc".encode()',
      },
      {
        command: 'hashlib.sha256(b).hexdigest()',
        meaning: 'Gera a assinatura SHA-256 em texto hexadecimal',
        example: '64 caracteres hex',
      },
      {
        command: 'break',
        meaning: 'Interrompe o loop assim que achar a senha',
        example: 'Economiza tempo de CPU',
      },
    ],
    sandboxExamples: [
      {
        label: 'Efeito avalanche',
        code: `import hashlib
h1 = hashlib.sha256("if2026".encode()).hexdigest()
h2 = hashlib.sha256("if2027".encode()).hexdigest()
print("if2026:", h1[:20], "...")
print("if2027:", h2[:20], "...")`,
      },
    ],
    drills: [
      {
        id: 'L08-D1',
        step: 1,
        title: 'Repetição 1 · Gerar SHA-256',
        prompt: 'Passe "python".encode() no sha256 para imprimir o tamanho (64).',
        starterCode: `import hashlib
resumo = hashlib.sha256().hexdigest()
print(len(resumo))`,
        hint: 'Escreva: hashlib.sha256("python".encode()).hexdigest()',
        validate: (stdout) =>
          stdout.trim() === '64'
            ? { passed: true, feedback: 'Perfeito! Todo hash SHA-256 tem exatamente 64 dígitos hex.' }
            : { passed: false, feedback: 'Passe "python".encode() para gerar os 64 caracteres.' },
      },
      {
        id: 'L08-D2',
        step: 2,
        title: 'Repetição 2 · Comparar integridade',
        prompt: 'Verifique se os dois textos geram o mesmo hash (deve imprimir IGUAL).',
        starterCode: `import hashlib
h1 = hashlib.sha256("nota10".encode()).hexdigest()
h2 = hashlib.sha256("nota10".encode()).hexdigest()
if h1 == :
    print("IGUAL")`,
        hint: 'Compare h1 com h2.',
        validate: (stdout) =>
          stdout.trim() === 'IGUAL'
            ? { passed: true, feedback: 'Integridade confirmada!' }
            : { passed: false, feedback: 'Escreva: if h1 == h2:' },
      },
      {
        id: 'L08-D3',
        step: 3,
        title: 'Repetição 3 · Mini wordlist',
        prompt: 'Encontre qual senha da lista gera o hash alvo ("segredo").',
        starterCode: `import hashlib
alvo = hashlib.sha256("segredo".encode()).hexdigest()
for s in ["1234", "segredo", "admin"]:
    if hashlib.sha256(s.encode()).hexdigest() == :
        print(s)
        break`,
        hint: 'Compare com a variável alvo.',
        validate: (stdout) =>
          stdout.trim() === 'segredo'
            ? { passed: true, feedback: 'Excelente! Pronto para as Missões M18 e M19.' }
            : { passed: false, feedback: 'Compare o hash gerado com alvo.' },
      },
    ],
  },

  {
    id: 'L09',
    order: 9,
    circuit: 3,
    title: 'Automação com range() e break (Chefão 20A & 20B)',
    subtitle: 'Prepara para a Fase Final Dupla (Blue & Red Team)',
    readTimeMinutes: 3,
    relatedMissionIds: ['M20A', 'M20B'],
    intro: [
      'A função range(inicio, fim) gera sequências numéricas sob demanda — por exemplo, range(1000, 10000) percorre todos os PINs de 4 dígitos (de 1000 até 9999).',
      'Como o número gerado é inteiro (int), usamos str(pin) quando uma função espera texto.',
      'O comando break encerra o loop imediatamente no instante em que encontramos a resposta, tornando a automação super rápida.',
    ],
    commandTable: [
      {
        command: 'range(1000, 10000)',
        meaning: 'Gera inteiros de 1000 até 9999',
        example: 'for pin in range(1000, 10000):',
      },
      {
        command: 'str(pin)',
        meaning: 'Converte o número inteiro para string',
        example: 'str(4827) -> "4827"',
      },
      {
        command: 'break',
        meaning: 'Para o loop for imediatamente',
        example: 'if achou: break',
      },
    ],
    sandboxExamples: [
      {
        label: 'Simular busca de PIN',
        code: `pin_secreto = "1042"
for tentativa in range(1000, 1100):
    if str(tentativa) == pin_secreto:
        print(f"PIN encontrado: {tentativa}")
        break`,
      },
    ],
    drills: [
      {
        id: 'L09-D1',
        step: 1,
        title: 'Repetição 1 · Usar range()',
        prompt: 'Percorra range(1, 5) para imprimir 1, 2, 3 e 4.',
        starterCode: `for n in range(1, ):
    print(n)`,
        hint: 'Em range(inicio, fim), o fim não é incluído: use range(1, 5).',
        validate: (stdout) =>
          stdout.trim() === '1\n2\n3\n4'
            ? { passed: true, feedback: 'Perfeito! range(1, 5) vai de 1 até 4.' }
            : { passed: false, feedback: 'Use range(1, 5) para imprimir 1, 2, 3 e 4.' },
      },
      {
        id: 'L09-D2',
        step: 2,
        title: 'Repetição 2 · Converter com str()',
        prompt: 'Converta o número pin com str(pin) para casar com "2026".',
        starterCode: `pin = 2026
if (pin) == "2026":
    print("ACESSO OK")`,
        hint: 'Escreva: if str(pin) == "2026":',
        validate: (stdout) =>
          stdout.trim() === 'ACESSO OK'
            ? { passed: true, feedback: 'Ótimo! Sem str(), int e str nunca são iguais.' }
            : { passed: false, feedback: 'Use str(pin) na condição.' },
      },
      {
        id: 'L09-D3',
        step: 3,
        title: 'Repetição 3 · Parar com break',
        prompt: 'Encontre o número 1015 em range(1000, 1050) e pare o loop com break.',
        starterCode: `for pin in range(1000, 1050):
    if pin == 1015:
        print(f"Achou: {pin}")
        `,
        hint: 'Adicione a palavra break na linha abaixo do print.',
        validate: (stdout) =>
          stdout.trim() === 'Achou: 1015'
            ? { passed: true, feedback: 'Você está 100% pronto para enfrentar 20A e 20B!' }
            : { passed: false, feedback: 'Adicione break para encerrar o loop ao achar 1015.' },
      },
    ],
  },
];

export function getLessonForMissionId(missionId: string): StudyLesson {
  return (
    STUDY_LESSONS.find((lesson) => lesson.relatedMissionIds.includes(missionId)) ??
    STUDY_LESSONS[0]
  );
}
