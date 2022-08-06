import { WordNode } from './WordNode';
import { parse, ParsedSentence } from './parse';
import { TemplateBuilder } from './template';

export { WordNode } from './WordNode';
export { parse } from './parse';

export interface ExecutableSentence {
  sentence: any;
  execute: any;
};

export const buildFluentTree = (builder: (parse: any) => ParsedSentence[]) : WordNode => {
  const executables = builder(parse).map((parsed) => {
    return {
      sentence: () => parsed,
      execute: () => {},
    };
  });

  const executableRoot = createExecutableFluentAPI(executables);
  return executableRoot.node;
}

export const createExecutableFluentAPI = (executables: ExecutableSentence[]) : any => {
  const executableByTemplate = new Map<string, any>();

  const parsed : ParsedSentence[] = [];
  executables.forEach((executable) => {
    executableByTemplate.set(executable.sentence.template, executable.execute);
    parsed.push(executable.sentence);
  });

  const callback = (template: TemplateBuilder) => {
    const isfunctionAvailable = executableByTemplate.has(template.template);
    if (isfunctionAvailable) {
      const execute = executableByTemplate.get(template.template);
      execute(...template.variables);
    }
  };

  return createFluentAPI(parsed, callback);
};  

export const createFluentAPI = (sentences: ParsedSentence[], onExecute?: (template: TemplateBuilder) => void) => {
  const root : any = {};
  root.node = WordNode.createRootNode({ accessor: root })

  let lastFunctionCalled: any = null;
  const template = new TemplateBuilder(onExecute);
  template.disable();

  sentences.forEach((parsedSentence) => {
    let prev = root;

    root.node.addparsedSentence(parsedSentence);
    parsedSentence.words.map((parsedChunk, i) => {
      const word = parsedChunk.name;
      const isImplemented = prev[word]
        && prev[word].node;
      if (!isImplemented) {
        createWordAccessor(prev, word);
      }

      const wordNode = prev[word].node
      wordNode.addChunk(parsedChunk);
      
      const previousWordNode = prev.node as WordNode;
      const currentWordNode = prev[word].node as WordNode;
      const previousChunk = parsedSentence.words[i-1];
      previousWordNode.addNextWord(currentWordNode, previousChunk);
      prev = prev[word];
    });
  });

  function createWordAccessor(parent: any, attribute: any) {
    const accessor = function(variable: any) {
      if(!variable) {
        return;
      }
  
      const isFirstWord = parent === root;
      if (isFirstWord) {
        template.reset();
        template.trace({ word: attribute });
        lastFunctionCalled = accessor;
      }

      template.trace({ variable });
      return parent[attribute]
    };

    accessor.node = new WordNode({
      word: attribute,
      accessor: accessor,
    });

    Object.defineProperty(parent, attribute, {
      get() {
        tracePropertyAccess(parent, attribute, accessor);
        return accessor;
      }
    });
  }

  function tracePropertyAccess(parent: any, attribute: any, accessor: any) {
    const isAlreadyTraced = lastFunctionCalled === accessor
    if (isAlreadyTraced) {
      return;
    }

    const isFirstWord = parent === root;
    const isReAccessed = lastFunctionCalled === parent
    if (!isFirstWord && !isReAccessed) {
      template.reset();
      template.trace({ word: parent.node.word })
    }

    template.trace({ word: attribute })
    lastFunctionCalled = accessor;
  }

  template.enable();
  return root;
}