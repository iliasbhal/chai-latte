import { TemplateBuilder } from './template';

export interface ParsedChunk {
  name: string;
  isCallable: boolean;
  template: string;
  arg: any;
}

export interface ParsedSentence {
  words: ParsedChunk[],
  template: string,
}

export const parse = ([...chunks]: TemplateStringsArray, ...variables: unknown[]) : ParsedSentence => {
  const hasVariables = variables.length > 0;
  if (!hasVariables) {
    throw new Error('Parsing Error: a sentence should have at least one variable');
  }

  const reservedKeywords = new Set([
    'if', 'while', 
  ])

  const validateAndShouldSkip = (word, chunkIndex) => {
    const hasWord = word.length > 0;
    if (!hasWord) {
      const isEmptyString = chunks.length === 1;
      if (isEmptyString) {
        throw new Error('Parsing Error: a sentence cannot be empty');
      }

      const isStartingWithVariable = chunkIndex === 0;
      if (isStartingWithVariable) {
        throw new Error('Parsing Error: sentences cannot start with variable')
      }

      const hasSuccessiveVariables = chunkIndex !== chunks.length - 1;
      if (hasSuccessiveVariables) {
        throw new Error('Parsing Error: two variables should be separated by a word')
      }

      return true;
    }

    const isStartingWithReservedKeyword = reservedKeywords.has(word)
    if (isStartingWithReservedKeyword) {
      throw new Error('Parsing Error: sentence cannot start with a reserved keyword');
    }

    return false;
  }

  const words = chunks.reduce((acc, chunk, chunkIndex) => {
    chunk.trim().split(' ').forEach((word, index, arr) => {
      const shouldSkip = validateAndShouldSkip(word, chunkIndex);
      if (shouldSkip) {
        return;
      }

      const isCallable = index === arr.length - 1;
      const variable = isCallable ? variables[chunkIndex] : undefined;
      const templateVariable = variable
        ? ` \${${TemplateBuilder.createTemplateType(variable)}}`
        : '';

      const parsedChunk : ParsedChunk = {
        name: word,
        isCallable: isCallable,
        arg: variable,
        template: `${word}` + templateVariable,
      }
      acc.push(parsedChunk);
    });
    
    return acc;
  }, [] as ParsedChunk[]);

  const parsed = {
    words,
    template: words.map(word => word.template).join(' '),
  };

  return parsed;
}