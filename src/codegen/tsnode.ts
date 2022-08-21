
import cp from 'child_process';

const getBinPath = () => {
  const buffer = cp.execSync('npm bin', { stdio: 'pipe' });
  return buffer.toString().trim();
}

const mergeScriptWithArguments = (script: string[], ...variables: unknown[]) => {
  const scriptCopy = [...script];
  return variables.reduce((acc, variable, index) => {
    const mergedString = acc + scriptCopy.shift() + variable;
    
    const isLastVariable = index === variables.length - 1;
    if (isLastVariable) {
      return mergedString + scriptCopy.shift();
    }

    return mergedString;
  }, '');
}

export const tsnode = (script: TemplateStringsArray, ...variables: unknown[]) => {
  const binPath = getBinPath();
  const tsNodePath = `${binPath}/ts-node`;

  const mergedString = mergeScriptWithArguments(script as any, ...variables);
  console.log(mergedString);

  const child = cp.execSync(`${tsNodePath} -e "
    ${mergedString}
  "`);

  return child.toString();
}