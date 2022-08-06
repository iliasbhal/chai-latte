// https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically

export function extractArguments(func) {  
  return (func + '')
    .replace(/[/][/].*$/mg,'') // strip single-line comments
    .replace(/\s+/g, '') // strip white space
    .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments  
    .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters  
    .replace(/=[^,]+/g, '') // strip any ES6 defaults  
    .split(',')
    .filter(Boolean) // split & filter [""]
    .map(t => t.replace(/\)$/g, ''))
}  