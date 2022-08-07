import fs from 'fs-extra';
import path from 'path';
import dedent from 'dedent';
import { ConfigurableCallback } from '../lib/ConfigurableCallback';
import { extractArguments } from '../lib/extractArguments';
import { RegisteredAPI } from '../register';

export interface InputOutputConfig {
  input: string
}

export const readConfigFile = (filePath: string) => {
  const configPath = path.resolve(filePath, 'codegen.json');
  const fileContent = fs.readFileSync(configPath, 'utf8');
  const json = JSON.parse(fileContent);
  return json;
}

export const generateTypedApiFromPath = async (config: InputOutputConfig) => {
  const compiled = await getBuilderFromLocalFile(config);
  const typings = await createTypegingForBuilders(config, compiled.__expressions as any);
  await writeGeneratedFile(config, typings);

  return true
}

const writeGeneratedFile = async (config: InputOutputConfig, typings: string) => {
  const outputFilePath = await getOutputFilePath(config);
  await fs.ensureFile(outputFilePath);
  await fs.writeFile(outputFilePath, typings);
}

const getOutputFilePath = async (config: InputOutputConfig) => {
  const pathStats = await fs.stat(config.input + '.ts');
  
  let configFilePath = config.input;
  if (pathStats.isFile()) {
    const filePaths = config.input.split('/')
    filePaths.pop();
    configFilePath = filePaths.join('/');
  }
  // stats.isFile()
  const relativePath = path.relative(__dirname, configFilePath + '/generated.ts');
  const absolutePath = path.resolve(__dirname, relativePath);
  return absolutePath;
}

export const createTypegingForBuilders = async (config: InputOutputConfig, builders: RegisteredAPI<any>[]) : Promise<string> => {
  let typings = dedent`
    ${createBaseTypings(config)}

    type Root = {}
  `;

  builders.forEach(({ builder }, index) => {
    const api = builder.getFluentAPI();
    const args = extractArguments(builder.callback);
  
    typings += `\n  & { ${buildTypeForObject({ api, builder, args, index })}; }`
  });

  typings += ';\n\n'
  typings += dedent`
    export default builder as Root;
  `
  return typings;
}

export const getBuilderFromLocalFile = async (config: InputOutputConfig) => {
  const relativePath = path.relative(__dirname, config.input);
  const { default: builders } = await import('./' + relativePath)
  return builders;
}

const buildTypeForObject = ({ api, builder, args, index }) => {
  let typeings = '';

  Object.entries(api).map(([key, value]) => {
    const innerType = typeof value === 'function'
      ? buildTypesForFunction({ callback: value, builder, args, index })
      : buildTypeForObject({ api: value, builder, args, index });

    typeings += `${key}: { ${innerType}; }`;
  })

  return typeings;
}

const buildTypesForFunction = ({ callback, builder, args, index }) => {
  const callbackConfig = ConfigurableCallback.configByCallback.get(callback);
  const returnByArg = Array.from(callbackConfig.returnByArg)[0];
  const returned = returnByArg[1];

  const argumentOrder = args.lastIndexOf(undefined) + 1;
  const argumentName = args[argumentOrder]
  args[argumentOrder] = undefined;
  const argumentType = `Arg<${index}, ${argumentOrder}>`

  const isLastCall = builder.callback == returned;
  const returnType = isLastCall
    ? `Return<${index}>`
    : `{ ${buildTypeForObject({ api: returned, builder, args, index })} }`;

  return `(${argumentName}: ${argumentType}) : ${returnType}`;
}

const createBaseTypings = (config: InputOutputConfig) => {
  // console.log('builderFilePath', builderFilePath);
  const localPath = './' + config.input.split('/').pop();
  return dedent`
    /* ------------------------------------
    *  Generated by chai-latte
    *  Please do not edit this file directly
    *  Instead, edit the file '${localPath}'
    * ------------------------------------
    */

    import builder from '${localPath}';

    type Expressions = typeof builder.__expressions;
    type ExpressionCallback<Idx extends number> = Expressions[Idx]['callback'];
    type Arg<Idx extends number, ArgIndex extends number> = Parameters<ExpressionCallback<Idx>>[ArgIndex];
    type Return<Idx extends number> = ReturnType<ExpressionCallback<Idx>>;
  `
}