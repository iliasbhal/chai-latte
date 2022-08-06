interface ParsedChunk {
  name: string;
  isCallable: boolean;
  template: string;
  arg: any;
}


export class WordNode {
  isRoot = false;
  word: string;
  accessor: any

  parsedSentences = [];
  childrenChunks = new Map<string, ParsedChunk>();
  childrenNodes = new Map<string, Set<WordNode>>();

  get isCallable() {
    return Array.from(this.childrenChunks.values())
      .some(chunk => chunk && !!chunk.isCallable);
  }

  get isLeaf() {
    return Array.from(this.childrenNodes.values())
      .every(set => set.size === 0);
  }

  constructor(props: any) {
    this.word = props.word;
    this.accessor = props.accessor;
    this.isRoot = !!props.isRoot;
  }

  addparsedSentence(parsed) {
    this.parsedSentences.push(parsed)
  }

  addChunk(chunk: ParsedChunk) {
    if (!this.childrenChunks.has(chunk.template)) {
      this.childrenChunks.set(chunk.template, chunk);
      this.childrenNodes.set(chunk.template, new Set());
    }
  }

  addNextWord(nextWord: WordNode, previousChunk: ParsedChunk ) {
    if (previousChunk) {
      const chunk = this.childrenChunks.get(previousChunk.template);
      const nextWords = this.childrenNodes.get(chunk.template);
      nextWords.add(nextWord);
    } else if (this.isRoot) {
      if (!this.childrenNodes.has(null)) {
        this.childrenNodes.set(null, new Set());
      }

      this.childrenNodes.get(null).add(nextWord);
    }
  }

  traverse(callback: (word: WordNode, chunk: ParsedChunk) => void) {
    for( const [template, children] of this.childrenNodes.entries()) {
      for( const word of children.values()) {
        const chunk = this.childrenChunks.get(template);
        callback(word, chunk);
        word.traverse(callback);
      }
    }
  }

  static createRootNode(accessor: any) {
    const word =  new WordNode({
      accessor: accessor,
      isRoot: true,
    });

    return word;
  }
}