#! /usr/bin/env node

import { tsnode } from './codegen/tsnode';

const entryFile = './index';
const outputFileName = 'generated.ts';

// We need to run the script with ts-node 
// to be able to import entry ts file
tsnode`
  import { generateTypedApiFromPath } from 'chai-latte';
  generateTypedApiFromPath({
    input: '${entryFile}',
    output: '${outputFileName}'
  });
`;