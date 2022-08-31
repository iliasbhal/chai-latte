#! /usr/bin/env node

import { program } from 'commander';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { compileUsingTsNode } from './codegen/actions/compileUsingTsNode';

const getPkgInfo = () => {
  const pkgjsonPath = path.resolve(__dirname, '..', 'package.json');
  const pkgInfoString = fs.readFileSync(pkgjsonPath, 'utf-8');
  const pkgInfo = JSON.parse(pkgInfoString);
  return pkgInfo;
}

const pkgInfo = getPkgInfo();

program.name(pkgInfo.name)
  .version(pkgInfo.version)
  .option('-i --input <path>', 'Input file path that should be typed')
  .option('-o --output <filename>', 'Desired generated file name')
  .option('-w --watch', 'Watch for changes and re-generate typed file');

program.parse();

const options = program.opts();

const input = options.input || './index';
const output = options.output ? `${options.output}.ts` : 'generated.ts';

const runCompilation = () => {
  console.log('Start compiling...');
  
  compileUsingTsNode({
    input,
    output,
  });
  
  console.log('Done!');
}

runCompilation();

if (options.watch) {
  const watchPath = path.resolve(process.cwd(), input + '.ts');
  chokidar.watch(watchPath)
    .on('change', runCompilation);
}