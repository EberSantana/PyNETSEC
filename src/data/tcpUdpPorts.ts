export type PortRangeCategory = 'well-known' | 'registered' | 'dynamic';
export type PortStatus = 'Oficial' | 'Não-oficial' | 'Conflito' | 'Fora de Serviço';
export type PortTransport = 'TCP' | 'UDP' | 'TCP/UDP';

export interface TcpUdpPortEntry {
  port: string;
  portNum: number;
  transport: PortTransport;
  service: string;
  description: string;
  status: PortStatus;
  range: PortRangeCategory;
  category:
    | 'Web & Proxy'
    | 'E-mail'
    | 'Acesso Remoto & Arquivos'
    | 'Infraestrutura & Rede'
    | 'Bancos de Dados'
    | 'Segurança & VPN'
    | 'Monitoramento & Admin'
    | 'Mídia, Voz & Jogos';
}

export const PORT_RANGE_SUMMARY: {
  id: PortRangeCategory;
  rangeLabel: string;
  title: string;
  description: string;
}[] = [
  {
    id: 'well-known',
    rangeLabel: '0 a 1023',
    title: 'Portas Bem Conhecidas (Well-Known)',
    description:
      'Reservadas pela IANA para serviços fundamentais da internet e do sistema operacional (HTTP, HTTPS, SSH, DNS, DHCP, SMTP, FTP, SMB, NTP).',
  },
  {
    id: 'registered',
    rangeLabel: '1024 a 49151',
    title: 'Portas Registradas (Registered)',
    description:
      'Usadas por bancos de dados, VPNs, acesso remoto, painéis administrativos, proxy e jogos (MySQL 3306, RDP 3389, PostgreSQL 5432, OpenVPN 1194, HTTP Alt 8080).',
  },
  {
    id: 'dynamic',
    rangeLabel: '49152 a 65535',
    title: 'Portas Dinâmicas / Efêmeras',
    description:
      'Por definição da IANA, não há registro oficial neste intervalo. São sorteadas temporariamente pelo sistema operacional do cliente ao iniciar conexões.',
  },
];

export const PORT_STATUS_LEGEND: {
  status: PortStatus;
  meaning: string;
}[] = [
  {
    status: 'Oficial',
    meaning: 'A aplicação e a combinação de porta constam na lista oficial de atribuições da IANA.',
  },
  {
    status: 'Não-oficial',
    meaning: 'Amplamente utilizada na prática por um software ou serviço, mas sem registro oficial na IANA.',
  },
  {
    status: 'Conflito',
    meaning: 'Porta disputada ou utilizada usualmente por dois ou mais protocolos/softwares diferentes.',
  },
  {
    status: 'Fora de Serviço',
    meaning: 'Porta reservada pelo sistema (como a porta 0), não utilizada para tráfego normal de serviços.',
  },
];

export const TCP_UDP_PORTS: TcpUdpPortEntry[] = [
  // 0 a 1023 — Portas Bem Conhecidas
  { port: '0', portNum: 0, transport: 'TCP/UDP', service: 'Reservada', description: 'Porta reservada (não utilizada em conexões comuns).', status: 'Fora de Serviço', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '7', portNum: 7, transport: 'TCP/UDP', service: 'ECHO', description: 'Serviço Echo — devolve exatamente os dados recebidos para testes.', status: 'Oficial', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '13', portNum: 13, transport: 'TCP/UDP', service: 'DAYTIME', description: 'Envia data e hora legível para a máquina requerente.', status: 'Oficial', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '20', portNum: 20, transport: 'TCP', service: 'FTP (Dados)', description: 'File Transfer Protocol — canal de transferência de dados.', status: 'Oficial', range: 'well-known', category: 'Acesso Remoto & Arquivos' },
  { port: '21', portNum: 21, transport: 'TCP', service: 'FTP (Controle)', description: 'File Transfer Protocol — canal de comandos e autenticação (texto claro).', status: 'Oficial', range: 'well-known', category: 'Acesso Remoto & Arquivos' },
  { port: '22', portNum: 22, transport: 'TCP/UDP', service: 'SSH / SFTP / SCP', description: 'Secure Shell — logins remotos criptografados, transferência segura de arquivos e túneis.', status: 'Oficial', range: 'well-known', category: 'Acesso Remoto & Arquivos' },
  { port: '23', portNum: 23, transport: 'TCP/UDP', service: 'Telnet', description: 'Terminal remoto em texto puro sem criptografia (inseguro — substituir por SSH).', status: 'Oficial', range: 'well-known', category: 'Acesso Remoto & Arquivos' },
  { port: '25', portNum: 25, transport: 'TCP/UDP', service: 'SMTP', description: 'Simple Mail Transfer Protocol — roteamento de e-mail entre servidores (CGI.br recomenda 587 para envio por clientes).', status: 'Oficial', range: 'well-known', category: 'E-mail' },
  { port: '42', portNum: 42, transport: 'TCP/UDP', service: 'Host Name Server / WINS', description: 'Oficialmente Host Name Server; historicamente em conflito com Microsoft WINS.', status: 'Conflito', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '43', portNum: 43, transport: 'TCP', service: 'WHOIS', description: 'Protocolo de consulta de informações de registro de domínios e blocos IP.', status: 'Oficial', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '49', portNum: 49, transport: 'TCP/UDP', service: 'TACACS', description: 'Protocolo de autenticação e controle de acesso para equipamentos de rede.', status: 'Oficial', range: 'well-known', category: 'Segurança & VPN' },
  { port: '53', portNum: 53, transport: 'TCP/UDP', service: 'DNS', description: 'Domain Name System — tradução de nomes de domínio em IPs (UDP para consultas rápidas, TCP para transferência de zona).', status: 'Oficial', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '67', portNum: 67, transport: 'UDP', service: 'DHCP / BOOTP (Servidor)', description: 'Servidor DHCP responsável por distribuir IPs automaticamente na rede.', status: 'Oficial', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '68', portNum: 68, transport: 'UDP', service: 'DHCP / BOOTP (Cliente)', description: 'Cliente DHCP recebendo configurações de IP, máscara, gateway e DNS.', status: 'Oficial', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '69', portNum: 69, transport: 'UDP', service: 'TFTP', description: 'Trivial File Transfer Protocol — transferência simples sem autenticação (boot PXE / firmware).', status: 'Oficial', range: 'well-known', category: 'Acesso Remoto & Arquivos' },
  { port: '79', portNum: 79, transport: 'TCP', service: 'Finger', description: 'Serviço antigo para consultar informações de usuários conectados.', status: 'Oficial', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '80', portNum: 80, transport: 'TCP', service: 'HTTP', description: 'HyperText Transfer Protocol — tráfego web padrão sem criptografia.', status: 'Oficial', range: 'well-known', category: 'Web & Proxy' },
  { port: '88', portNum: 88, transport: 'TCP', service: 'Kerberos', description: 'Protocolo de autenticação segura baseada em tickets (Active Directory / redes corporativas).', status: 'Oficial', range: 'well-known', category: 'Segurança & VPN' },
  { port: '110', portNum: 110, transport: 'TCP', service: 'POP3', description: 'Post Office Protocol v3 — download de e-mails do servidor (sem SSL).', status: 'Oficial', range: 'well-known', category: 'E-mail' },
  { port: '111', portNum: 111, transport: 'TCP/UDP', service: 'Sun RPC (portmap)', description: 'Chamada de procedimento remoto usada pelo NFS (Network File System).', status: 'Oficial', range: 'well-known', category: 'Acesso Remoto & Arquivos' },
  { port: '119', portNum: 119, transport: 'TCP', service: 'NNTP', description: 'Network News Transfer Protocol — leitura e envio em grupos de notícias.', status: 'Oficial', range: 'well-known', category: 'E-mail' },
  { port: '123', portNum: 123, transport: 'UDP', service: 'NTP', description: 'Network Time Protocol — sincronização precisa de relógios em servidores e roteadores.', status: 'Oficial', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '135', portNum: 135, transport: 'TCP/UDP', service: 'Microsoft RPC (EPMAP)', description: 'End Point Mapper — serviço de localização RPC do Windows.', status: 'Oficial', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '137-139', portNum: 137, transport: 'TCP/UDP', service: 'NetBIOS (Name / Datagram / Session)', description: 'Resolução de nomes e sessões legadas em redes locais Windows.', status: 'Oficial', range: 'well-known', category: 'Acesso Remoto & Arquivos' },
  { port: '143', portNum: 143, transport: 'TCP/UDP', service: 'IMAP4', description: 'Internet Message Access Protocol — leitura e sincronização de e-mails no servidor.', status: 'Oficial', range: 'well-known', category: 'E-mail' },
  { port: '161', portNum: 161, transport: 'TCP/UDP', service: 'SNMP', description: 'Simple Network Management Protocol — monitoramento de roteadores, switches e servidores.', status: 'Oficial', range: 'well-known', category: 'Monitoramento & Admin' },
  { port: '162', portNum: 162, transport: 'TCP/UDP', service: 'SNMPTRAP', description: 'Recebimento de alertas assíncronos (traps) enviados por equipamentos de rede.', status: 'Oficial', range: 'well-known', category: 'Monitoramento & Admin' },
  { port: '179', portNum: 179, transport: 'TCP', service: 'BGP', description: 'Border Gateway Protocol — roteamento global entre sistemas autônomos da internet.', status: 'Oficial', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '194', portNum: 194, transport: 'TCP', service: 'IRC', description: 'Internet Relay Chat — protocolo clássico de salas de bate-papo.', status: 'Oficial', range: 'well-known', category: 'Mídia, Voz & Jogos' },
  { port: '389', portNum: 389, transport: 'TCP/UDP', service: 'LDAP', description: 'Lightweight Directory Access Protocol — consulta a diretórios de usuários.', status: 'Oficial', range: 'well-known', category: 'Segurança & VPN' },
  { port: '443', portNum: 443, transport: 'TCP/UDP', service: 'HTTPS / QUIC (HTTP/3)', description: 'HTTP seguro sobre TLS/SSL (TCP) e HTTP/3 via QUIC (UDP) — padrão da web moderna.', status: 'Oficial', range: 'well-known', category: 'Web & Proxy' },
  { port: '445', portNum: 445, transport: 'TCP/UDP', service: 'SMB (Microsoft-DS)', description: 'Server Message Block — compartilhamento de pastas, impressoras e Active Directory na LAN.', status: 'Oficial', range: 'well-known', category: 'Acesso Remoto & Arquivos' },
  { port: '465', portNum: 465, transport: 'TCP', service: 'SMTPS (SMTP over SSL)', description: 'Envio seguro de e-mail via SSL/TLS (historicamente registrou conflito com protocolo Cisco).', status: 'Conflito', range: 'well-known', category: 'E-mail' },
  { port: '500', portNum: 500, transport: 'TCP/UDP', service: 'ISAKMP / IKE', description: 'Negociação de chaves criptográficas para túneis VPN IPsec.', status: 'Oficial', range: 'well-known', category: 'Segurança & VPN' },
  { port: '502', portNum: 502, transport: 'TCP/UDP', service: 'Modbus', description: 'Protocolo de comunicação industrial (CLPs e automação SCADA).', status: 'Oficial', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '514', portNum: 514, transport: 'UDP', service: 'Syslog', description: 'Coleta centralizada de logs de servidores Linux, roteadores e firewalls.', status: 'Oficial', range: 'well-known', category: 'Monitoramento & Admin' },
  { port: '520', portNum: 520, transport: 'UDP', service: 'RIP (Routing)', description: 'Routing Information Protocol — troca dinâmica de rotas em redes internas.', status: 'Oficial', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '546-547', portNum: 546, transport: 'TCP/UDP', service: 'DHCPv6 (Cliente / Servidor)', description: 'Configuração dinâmica de endereços em redes IPv6.', status: 'Oficial', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '554', portNum: 554, transport: 'TCP/UDP', service: 'RTSP', description: 'Real Time Streaming Protocol — controle de câmeras IP e transmissão de vídeo ao vivo.', status: 'Oficial', range: 'well-known', category: 'Mídia, Voz & Jogos' },
  { port: '587', portNum: 587, transport: 'TCP', service: 'SMTP (Submissão)', description: 'Porta oficial recomendada para envio autenticado de e-mails por clientes (RFC 2476 / CGI.br).', status: 'Oficial', range: 'well-known', category: 'E-mail' },
  { port: '631', portNum: 631, transport: 'TCP/UDP', service: 'IPP (CUPS)', description: 'Internet Printing Protocol — compartilhamento de impressoras em rede (Linux/macOS/Windows).', status: 'Oficial', range: 'well-known', category: 'Infraestrutura & Rede' },
  { port: '636', portNum: 636, transport: 'TCP/UDP', service: 'LDAPS', description: 'LDAP sobre SSL/TLS — consulta criptografada a diretórios.', status: 'Oficial', range: 'well-known', category: 'Segurança & VPN' },
  { port: '860', portNum: 860, transport: 'TCP', service: 'iSCSI', description: 'Protocolo de armazenamento em bloco sobre redes IP (SAN).', status: 'Oficial', range: 'well-known', category: 'Acesso Remoto & Arquivos' },
  { port: '873', portNum: 873, transport: 'TCP', service: 'rsync', description: 'Sincronização incremental e backups eficientes de arquivos no Linux.', status: 'Oficial', range: 'well-known', category: 'Acesso Remoto & Arquivos' },
  { port: '989-990', portNum: 989, transport: 'TCP/UDP', service: 'FTPS (Dados / Controle)', description: 'FTP protegido sobre TLS/SSL.', status: 'Oficial', range: 'well-known', category: 'Acesso Remoto & Arquivos' },
  { port: '993', portNum: 993, transport: 'TCP', service: 'IMAPS (IMAP4 sobre SSL)', description: 'Recebimento e sincronização segura de e-mails com criptografia.', status: 'Oficial', range: 'well-known', category: 'E-mail' },
  { port: '995', portNum: 995, transport: 'TCP', service: 'POP3S (POP3 sobre SSL)', description: 'Recebimento seguro de e-mails via POP3 criptografado.', status: 'Oficial', range: 'well-known', category: 'E-mail' },

  // 1024 a 49151 — Portas Registradas
  { port: '1080', portNum: 1080, transport: 'TCP', service: 'SOCKS Proxy', description: 'Servidor proxy SOCKS para encaminhamento genérico de tráfego TCP/UDP.', status: 'Oficial', range: 'registered', category: 'Web & Proxy' },
  { port: '1194', portNum: 1194, transport: 'UDP', service: 'OpenVPN', description: 'Porta padrão para túneis VPN criptografados com OpenVPN.', status: 'Oficial', range: 'registered', category: 'Segurança & VPN' },
  { port: '1433', portNum: 1433, transport: 'TCP/UDP', service: 'Microsoft SQL Server', description: 'Sistema gerenciador de banco de dados Microsoft SQL Server.', status: 'Oficial', range: 'registered', category: 'Bancos de Dados' },
  { port: '1521', portNum: 1521, transport: 'TCP', service: 'Oracle Database Listener', description: 'Porta padrão clássica do listener Oracle Database (substituída oficialmente pela 2483/2484).', status: 'Não-oficial', range: 'registered', category: 'Bancos de Dados' },
  { port: '1701', portNum: 1701, transport: 'UDP', service: 'L2TP', description: 'Layer 2 Tunneling Protocol — protocolo de tunelamento VPN.', status: 'Oficial', range: 'registered', category: 'Segurança & VPN' },
  { port: '1723', portNum: 1723, transport: 'TCP/UDP', service: 'Microsoft PPTP VPN', description: 'Protocolo legado de VPN ponto a ponto da Microsoft.', status: 'Oficial', range: 'registered', category: 'Segurança & VPN' },
  { port: '1812-1813', portNum: 1812, transport: 'UDP', service: 'RADIUS (Auth / Accounting)', description: 'Autenticação centralizada de usuários Wi-Fi corporativo (802.1X) e provedores.', status: 'Oficial', range: 'registered', category: 'Segurança & VPN' },
  { port: '1883', portNum: 1883, transport: 'TCP/UDP', service: 'MQTT', description: 'Message Queuing Telemetry Transport — mensageria leve para dispositivos IoT.', status: 'Não-oficial', range: 'registered', category: 'Infraestrutura & Rede' },
  { port: '1900', portNum: 1900, transport: 'UDP', service: 'SSDP / UPnP', description: 'Descoberta automática de dispositivos multimídia e roteadores na rede local.', status: 'Oficial', range: 'registered', category: 'Infraestrutura & Rede' },
  { port: '2049', portNum: 2049, transport: 'UDP', service: 'NFS', description: 'Network File System — compartilhamento nativo de diretórios entre sistemas Linux/Unix.', status: 'Oficial', range: 'registered', category: 'Acesso Remoto & Arquivos' },
  { port: '2082-2083', portNum: 2082, transport: 'TCP', service: 'cPanel (HTTP / SSL)', description: 'Painel de controle de hospedagem web (2082 comum, 2083 sobre SSL).', status: 'Não-oficial', range: 'registered', category: 'Monitoramento & Admin' },
  { port: '2483-2484', portNum: 2483, transport: 'TCP/UDP', service: 'Oracle DB (Oficial / SSL)', description: 'Portas oficiais registradas para conexões cliente ao Oracle Database (2484 com SSL).', status: 'Oficial', range: 'registered', category: 'Bancos de Dados' },
  { port: '3000', portNum: 3000, transport: 'TCP', service: 'Grafana / Dev Servers / Miralix', description: 'Usada comumente por servidores web de desenvolvimento e Grafana (em conflito com Miralix).', status: 'Conflito', range: 'registered', category: 'Web & Proxy' },
  { port: '3128', portNum: 3128, transport: 'TCP', service: 'Squid Web Proxy', description: 'Porta padrão de proxy web e cache HTTP em escolas e empresas.', status: 'Oficial', range: 'registered', category: 'Web & Proxy' },
  { port: '3260', portNum: 3260, transport: 'TCP', service: 'iSCSI Target', description: 'Alvo de armazenamento em redes SAN baseadas em iSCSI.', status: 'Oficial', range: 'registered', category: 'Acesso Remoto & Arquivos' },
  { port: '3306', portNum: 3306, transport: 'TCP/UDP', service: 'MySQL / MariaDB', description: 'Porta padrão do banco de dados relacional MySQL e MariaDB.', status: 'Oficial', range: 'registered', category: 'Bancos de Dados' },
  { port: '3389', portNum: 3389, transport: 'TCP', service: 'RDP (Microsoft Terminal Server)', description: 'Remote Desktop Protocol — área de trabalho remota do Windows.', status: 'Oficial', range: 'registered', category: 'Acesso Remoto & Arquivos' },
  { port: '3690', portNum: 3690, transport: 'TCP', service: 'Subversion (SVN)', description: 'Sistema de controle de versão Subversion.', status: 'Oficial', range: 'registered', category: 'Acesso Remoto & Arquivos' },
  { port: '5004-5005', portNum: 5004, transport: 'UDP', service: 'RTP (Real-time Transport)', description: 'Transporte em tempo real de pacotes de áudio e vídeo (VoIP e videoconferência).', status: 'Oficial', range: 'registered', category: 'Mídia, Voz & Jogos' },
  { port: '5060-5061', portNum: 5060, transport: 'TCP/UDP', service: 'SIP / SIP over TLS', description: 'Session Initiation Protocol — sinalização de chamadas de telefonia IP (VoIP).', status: 'Oficial', range: 'registered', category: 'Mídia, Voz & Jogos' },
  { port: '5222', portNum: 5222, transport: 'TCP', service: 'XMPP / Jabber', description: 'Conexão de clientes em sistemas de mensagens instantâneas XMPP.', status: 'Oficial', range: 'registered', category: 'Mídia, Voz & Jogos' },
  { port: '5353', portNum: 5353, transport: 'UDP', service: 'mDNS (Multicast DNS)', description: 'Resolução de nomes ".local" na rede local sem servidor DNS central (Bonjour / Avahi).', status: 'Oficial', range: 'registered', category: 'Infraestrutura & Rede' },
  { port: '5432', portNum: 5432, transport: 'TCP', service: 'PostgreSQL', description: 'Sistema de banco de dados objeto-relacional PostgreSQL.', status: 'Oficial', range: 'registered', category: 'Bancos de Dados' },
  { port: '5900', portNum: 5900, transport: 'TCP', service: 'VNC', description: 'Virtual Network Computing — controle gráfico remoto de telas.', status: 'Oficial', range: 'registered', category: 'Acesso Remoto & Arquivos' },
  { port: '5938', portNum: 5938, transport: 'TCP/UDP', service: 'TeamViewer', description: 'Acesso remoto e suporte técnico via TeamViewer.', status: 'Não-oficial', range: 'registered', category: 'Acesso Remoto & Arquivos' },
  { port: '6697', portNum: 6697, transport: 'TCP', service: 'IRC sobre SSL/TLS', description: 'Conexão criptografada para redes de chat IRC.', status: 'Não-oficial', range: 'registered', category: 'Mídia, Voz & Jogos' },
  { port: '6881-6999', portNum: 6881, transport: 'TCP/UDP', service: 'BitTorrent', description: 'Faixa clássica utilizada para compartilhamento P2P BitTorrent.', status: 'Não-oficial', range: 'registered', category: 'Acesso Remoto & Arquivos' },
  { port: '8080', portNum: 8080, transport: 'TCP', service: 'HTTP Alternate / Tomcat / Proxy', description: 'Alternativa muito comum à porta 80 para servidores web, proxies e Tomcat sem root.', status: 'Oficial', range: 'registered', category: 'Web & Proxy' },
  { port: '8291', portNum: 8291, transport: 'TCP', service: 'Winbox (MikroTik RouterOS)', description: 'Gerenciamento remoto de roteadores MikroTik via aplicativo Winbox.', status: 'Não-oficial', range: 'registered', category: 'Monitoramento & Admin' },
  { port: '8443', portNum: 8443, transport: 'TCP', service: 'HTTPS Alternate', description: 'Porta alternativa frequente para painéis web administrativos sobre TLS/SSL.', status: 'Não-oficial', range: 'registered', category: 'Web & Proxy' },
  { port: '9001', portNum: 9001, transport: 'TCP', service: 'Tor Network (ORPort)', description: 'Porta padrão frequentemente utilizada por relays da rede Tor.', status: 'Não-oficial', range: 'registered', category: 'Segurança & VPN' },
  { port: '9100', portNum: 9100, transport: 'TCP', service: 'HP JetDirect (Impressão)', description: 'Envio direto de trabalhos para impressoras de rede.', status: 'Oficial', range: 'registered', category: 'Infraestrutura & Rede' },
  { port: '10000', portNum: 10000, transport: 'TCP', service: 'Webmin', description: 'Interface web de administração para servidores Linux.', status: 'Não-oficial', range: 'registered', category: 'Monitoramento & Admin' },
  { port: '10050-10051', portNum: 10050, transport: 'TCP/UDP', service: 'Zabbix (Agent / Server)', description: 'Monitoramento de infraestrutura de TI, hosts e alertas de rede.', status: 'Oficial', range: 'registered', category: 'Monitoramento & Admin' },
  { port: '25565', portNum: 25565, transport: 'TCP/UDP', service: 'Minecraft', description: 'Porta padrão para servidores multiplayer de Minecraft.', status: 'Não-oficial', range: 'registered', category: 'Mídia, Voz & Jogos' },
  { port: '27015', portNum: 27015, transport: 'TCP/UDP', service: 'Half-Life / Counter-Strike', description: 'Porta padrão de servidores Source / Counter-Strike.', status: 'Não-oficial', range: 'registered', category: 'Mídia, Voz & Jogos' },
  { port: '32400', portNum: 32400, transport: 'TCP', service: 'Plex Media Server', description: 'Streaming local e remoto de bibliotecas de mídia no Plex.', status: 'Não-oficial', range: 'registered', category: 'Mídia, Voz & Jogos' },
  { port: '33434', portNum: 33434, transport: 'UDP', service: 'traceroute', description: 'Porta base usada pelo comando traceroute no Linux/Unix para mapear saltos de rede.', status: 'Oficial', range: 'registered', category: 'Infraestrutura & Rede' },
  { port: '47808', portNum: 47808, transport: 'UDP', service: 'BACnet', description: 'Building Automation and Control Networks — automação predial.', status: 'Oficial', range: 'registered', category: 'Infraestrutura & Rede' },

  // 49152 a 65535 — Portas Dinâmicas / Efêmeras
  {
    port: '49152-65535',
    portNum: 49152,
    transport: 'TCP/UDP',
    service: 'Portas Dinâmicas / Privadas (Efêmeras)',
    description:
      'Por definição da IANA, não pode haver registro oficial neste intervalo. São alocadas automaticamente pelo sistema operacional como porta de origem temporária em conexões de clientes.',
    status: 'Oficial',
    range: 'dynamic',
    category: 'Infraestrutura & Rede',
  },
];
