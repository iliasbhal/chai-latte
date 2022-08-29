#! /usr/bin/env node

import { tsnode } from './codegen/tsnode';
import { program } from 'commander';
import fs from 'fs';
import path from 'path';

const getPkgInfo = () => {
  const pkgjsonPath = path.resolve(__dirname, '..', 'package.json');
  const pkgInfoString = fs.readFileSync(pkgjsonPath, 'utf-8');
  const pkgInfo = JSON.parse(pkgInfoString);
  return pkgInfo;
}

const pkgInfo = getPkgInfo();

program.name(pkgInfo.name)
  .version(pkgInfo.version)
  .option('-i --input <path>', 'input file path')
  .option('-i --output <filename>', 'desired generated file name');

program.parse();

const options = program.opts();
const entryFile = options.input || './index';
const outputFileName = options.output ? `${options.output}.ts` : 'generated.ts';

// We need to run the script with ts-node 
// to be able to import entry ts file
tsnode`
  import { generateTypedApiFromPath } from 'chai-latte';
  generateTypedApiFromPath({
    input: '${entryFile}',
    output: '${outputFileName}'
  });
`;