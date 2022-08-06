import { RegisteredAPI } from './register';

export const tuple = <T extends RegisteredAPI<any>[]>(...args: T) => args;

export const build = (...args: RegisteredAPI<any>[]) => {
  
}
