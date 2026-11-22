import { TranslatedPythonError } from '../types/ctf';

/**
 * Translates raw Pyodide/Python tracebacks into friendly, beginner-oriented
 * Portuguese guidance tailored for Ensino Médio Técnico students.
 */
export function translatePythonError(rawError: string): TranslatedPythonError {
  const cleanRaw = rawError.trim();

  // Extract line number belonging to student script "missao.py"
  const missionLineMatches = [...cleanRaw.matchAll(/File\s+"missao\.py",\s+line\s+(\d+)/g)];
  let line: number | null = null;
  if (missionLineMatches.length > 0) {
    line = Number(missionLineMatches[missionLineMatches.length - 1][1]);
  } else {
    const genericLine = cleanRaw.match(/line\s+(\d+)/);
    if (genericLine) {
      line = Number(genericLine[1]);
    }
  }

  const lineLabel = line !== null ? ` na linha ${line}` : '';

  // 1. IndentationError / TabError
  if (/IndentationError|TabError/.test(cleanRaw)) {
    return {
      errorType: 'IndentationError',
      title: `Erro de indentação${lineLabel}`,
      explanation:
        'Em Python, os espaços no início da linha indicam o que está dentro de um bloco (como if ou for).',
      tip: 'Use sempre 4 espaços (ou a tecla Tab) nas linhas logo abaixo de dois-pontos (:).',
      line,
      rawError: cleanRaw,
    };
  }

  // 2. SyntaxError (specific patterns first)
  if (/SyntaxError/.test(cleanRaw)) {
    if (/unterminated string literal|EOL while scanning string/i.test(cleanRaw)) {
      return {
        errorType: 'SyntaxError',
        title: `Faltou fechar as aspas${lineLabel}`,
        explanation:
          'Você abriu um texto com aspas (" ou \') mas esqueceu de fechar no final da linha.',
        tip: 'Confira se toda aspa aberta tem um par correspondente do mesmo tipo.',
        line,
        rawError: cleanRaw,
      };
    }

    if (/expected ':'/i.test(cleanRaw)) {
      return {
        errorType: 'SyntaxError',
        title: `Faltou dois-pontos (:)${lineLabel}`,
        explanation:
          'Estruturas como if, elif, else, for, while e def precisam terminar com dois-pontos (:).',
        tip: 'Adicione ":" ao final da instrução condicional ou do loop.',
        line,
        rawError: cleanRaw,
      };
    }

    if (/was never closed|unexpected EOF/i.test(cleanRaw)) {
      return {
        errorType: 'SyntaxError',
        title: `Faltou fechar parêntese, colchete ou chave${lineLabel}`,
        explanation:
          'Algum parêntese (), colchete [] ou chave {} ficou aberto sem fechamento.',
        tip: 'Verifique especialmente as chamadas print(...) e listas [...] próximas a essa linha.',
        line,
        rawError: cleanRaw,
      };
    }

    return {
      errorType: 'SyntaxError',
      title: `Erro de escrita (sintaxe)${lineLabel}`,
      explanation:
        'O Python não conseguiu entender um trecho do comando escrito nessa linha.',
      tip: 'Verifique se há vírgulas faltando, sinais "=" em vez de "==" dentro de if, ou palavras reservadas escritas errado.',
      line,
      rawError: cleanRaw,
    };
  }

  // 3. NameError
  const nameMatch = cleanRaw.match(/NameError:\s+name\s+'([^']+)'\s+is not defined/);
  if (nameMatch) {
    const missingName = nameMatch[1];
    return {
      errorType: 'NameError',
      title: `Nome "${missingName}" não reconhecido${lineLabel}`,
      explanation: `O Python procurou a variável ou função "${missingName}", mas ela ainda não foi criada (ou foi digitada diferente).`,
      tip: 'Confira letras maiúsculas/minúsculas e se você não esqueceu aspas caso quisesse escrever um texto.',
      line,
      rawError: cleanRaw,
    };
  }

  // 4. TypeError
  if (/TypeError/.test(cleanRaw)) {
    return {
      errorType: 'TypeError',
      title: `Tipos incompatíveis${lineLabel}`,
      explanation:
        'Você tentou combinar ou passar valores de tipos diferentes (por exemplo, somar texto com número ou esquecer str()).',
      tip: 'Use str(...) para transformar números em texto, ou int(...) para transformar texto numérico em inteiro.',
      line,
      rawError: cleanRaw,
    };
  }

  // 5. ValueError
  if (/ValueError/.test(cleanRaw)) {
    return {
      errorType: 'ValueError',
      title: `Valor inválido${lineLabel}`,
      explanation:
        'O tipo do dado está certo, mas o conteúdo não é aceito pela função (ex.: IP inválido ou texto que não é número).',
      tip: 'Se estiver validando IPs com ipaddress, envolva a chamada em um bloco try / except ValueError.',
      line,
      rawError: cleanRaw,
    };
  }

  // 6. KeyError
  const keyMatch = cleanRaw.match(/KeyError:\s+(.+)/);
  if (keyMatch) {
    return {
      errorType: 'KeyError',
      title: `Chave ${keyMatch[1].trim()} não encontrada no dicionário${lineLabel}`,
      explanation:
        'Você tentou ler uma chave que ainda não existe dentro do dicionário.',
      tip: 'Use dicionario.get(chave, 0) para começar com 0 quando a chave aparecer pela primeira vez.',
      line,
      rawError: cleanRaw,
    };
  }

  // 7. IndexError
  if (/IndexError/.test(cleanRaw)) {
    return {
      errorType: 'IndexError',
      title: `Posição fora da lista${lineLabel}`,
      explanation:
        'Você tentou acessar um índice maior do que a quantidade de itens existentes na lista.',
      tip: 'Lembre-se que em Python as listas começam na posição 0.',
      line,
      rawError: cleanRaw,
    };
  }

  // 8. AttributeError
  const attrMatch = cleanRaw.match(/AttributeError:\s+'([^']+)'\s+object has no attribute\s+'([^']+)'/);
  if (attrMatch) {
    return {
      errorType: 'AttributeError',
      title: `Método ".${attrMatch[2]}" não existe em ${attrMatch[1]}${lineLabel}`,
      explanation: `Esse tipo de dado (${attrMatch[1]}) não possui o comando ".${attrMatch[2]}".`,
      tip: 'Revise o nome do método no exemplo da micro-leitura ao lado.',
      line,
      rawError: cleanRaw,
    };
  }

  // 9. ZeroDivisionError
  if (/ZeroDivisionError/.test(cleanRaw)) {
    return {
      errorType: 'ZeroDivisionError',
      title: `Divisão por zero${lineLabel}`,
      explanation: 'Não é possível dividir um número por zero em Python.',
      tip: 'Verifique se o divisor pode ser 0 antes de fazer a conta.',
      line,
      rawError: cleanRaw,
    };
  }

  // 10. ModuleNotFoundError
  const modMatch = cleanRaw.match(/ModuleNotFoundError:\s+No module named\s+'([^']+)'/);
  if (modMatch) {
    return {
      errorType: 'ModuleNotFoundError',
      title: `Módulo "${modMatch[1]}" não disponível${lineLabel}`,
      explanation: `O módulo "${modMatch[1]}" não faz parte da biblioteca padrão carregada nesta missão.`,
      tip: 'Use os módulos nativos indicados na missão (ipaddress, base64, hashlib, re, json ou alvo).',
      line,
      rawError: cleanRaw,
    };
  }

  return {
    errorType: 'RuntimeError',
    title: `Erro durante a execução${lineLabel}`,
    explanation:
      'O script encontrou um problema inesperado enquanto rodava no interpretador Python.',
    tip: 'Leia a mensagem técnica abaixo e compare sua linha com o exemplo da micro-leitura.',
    line,
    rawError: cleanRaw,
  };
}
