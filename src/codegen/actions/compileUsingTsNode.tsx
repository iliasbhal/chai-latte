import { tsnode } from './tsnode';

interface CompileConfig {
  input: string;
  output: string;
}

export const compileUsingTsNode = (config: CompileConfig) => {  
  // We need to run the script with ts-node 
  // to be able to import entry ts file
  tsnode`
    import { generateTypedApiFromPath } from 'chai-latte';
    generateTypedApiFromPath({
      input: '${config.input}',
      output: '${config.output}'
    });
  `;
}