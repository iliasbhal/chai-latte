export const getPrimitiveType = (arg: any) => {
  switch (typeof arg) {
    case 'string': 
      return String;
    case 'boolean': 
      return Boolean;
    case 'number': 
      return Number;
    default:
      return undefined;
  }
}