import fs from 'fs-extra';
import path from 'path';
import dedent from 'dedent';
import { ConfigurableCallback } from '../builder/lib/ConfigurableCallback';
import { extractArguments } from '../builder/lib/extractArguments';
import { RegisteredAPI } from '../builder/register';
import { CompiledBuilder } from '../builder/compile';

export interface InputOutputConfig {
  input: string,
  output?: string,
}

export const readConfigFile = (filePath: string) => {
  const configPath = path.resolve(filePath, 'codegen.json');
  const fileContent = fs.readFileSync(configPath, 'utf8');
  const json = JSON.parse(fileContent);
  return json;
}

export const generateTypedApiFromPath = async (config: InputOutputConfig) => {
  const compiled = await getBuilderFromLocalFile(config);
  const typings = await createTypegingForBuilders(config, compiled);
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

  const outputFileName = config.output || 'generated.ts';
  const relativePath = path.relative(__dirname, configFilePath + '/' + outputFileName);
  const absolutePath = path.resolve(__dirname, relativePath);
  return absolutePath;
}

export const createTypegingForBuilders = async (config: InputOutputConfig, compiled: CompiledBuilder<any>) : Promise<string> => {
  const getTabs = (tabs) => {
    const TAB = '  ';
    return {
      start: Array.from({ length: tabs }).map(() => '').join(TAB),
      end: Array.from({ length: tabs - 1}).map(() => '').join(TAB),
      next: tabs + 1,
    }
  }

  const getArgumentNameFromArgType = (arg: FunctionConstructor) => {
    const firstChar = arg.name.toLowerCase().slice(0, 1);
    const lastChars = arg.name.slice(1);
    const argName = firstChar + lastChars;

    switch (argName) {
      case 'string': return 'str';
      case 'boolean': return 'bool';
      case 'number': return 'num';
      case 'object': return 'obj';
    }

    return argName;
  }

  const getArgumentTypeFromCallback = (callback: ConfigurableCallback, arg: unknown) => {
    const originalCallback = callback.originCallbackByArg.get(arg);
    const rowIdx = (originalCallback || callback).expression.index;
    const callIdx = callback.callIndex;
    return `Arg<${rowIdx}, ${callIdx}>`;
  }

  const buildKeys = (currentTabs: number, obj: object) => {
    const tabs = getTabs(currentTabs);
    let typings = "{\n"

    Object.keys(obj).map(key => {
      if (key.startsWith('__')) return;
      typings += `${tabs.start}${key}: ${buildValue(tabs.next, obj[key])}\n`
    }).join(';\n');

    typings += `${tabs.end}};`
    return typings;
  }

  const buildFunction = (currentTabs: number, fn: ConfigurableCallback) => {
    const callback = ConfigurableCallback.configByCallback.get(fn);
    const tabs = getTabs(currentTabs);
    const returnByArg = Array.from(callback.returnByArg)[0];
    const returned = returnByArg[1];
    const isLastCall = returned == callback.expression.callback;

    let typings = '{\n';

    Object.keys(callback.props).forEach((key) => {
      typings += `${tabs.start}${key}: ${buildValue(tabs.next, callback.props[key])}\n`
    })

    if (isLastCall) {
      const argName = getArgumentNameFromArgType(returnByArg[0]);
      const argType = getArgumentTypeFromCallback(callback, returnByArg[0]);
      const originalCallback = callback.originCallbackByArg.get(returnByArg[0]);
      const rowIdx = (originalCallback || callback).expression.index;
      typings += `${tabs.start}(${argName}: ${argType}) : Return<${rowIdx}>;\n`

    } else {
      callback.returnByArg.forEach((value, arg) => {
        const argName = getArgumentNameFromArgType(arg);
        const argType = getArgumentTypeFromCallback(callback, arg);
        typings += `${tabs.start}(${argName}: ${argType}) : ${buildKeys(tabs.next, value)}\n`
      });
    }


    typings += `${tabs.end}};`
    return typings;
  }

  const buildValue = (tabs: number, val: any) => {
    if (typeof val === 'object') {
      return buildKeys(tabs, val);
    }

    if (typeof val === 'function') {
      return buildFunction(tabs, val);
    }

    return 'any';
  }


  const typings = dedent`
    ${createBaseTypings(config)}

  type Root = ${buildKeys(3, compiled)}

  export default builder as unknown as Root;
  `;


  return typings;
}

export const getBuilderFromLocalFile = async (config: InputOutputConfig) => {
  const relativePath = path.relative(__dirname, config.input);
  const { default: builders } = await import('./' + relativePath)
  return builders;
}

const buildTypeForObject = ({ api, builder, args, index }) => {
  let typeings = '';

  const [key, value] = Object.entries(api)[0];
  const innerType = typeof value === 'function'
    ? buildTypesForFunction({ callback: value, builder, args, index })
    : buildTypeForObject({ api: value, builder, args, index });

  typeings += `${key}: { ${innerType}; }`;

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