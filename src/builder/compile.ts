import { combine } from './combine';
import { RegisteredAPI } from './register';

export interface CompiledBuilder<T> {
  [key: string]: any;
  __expressions: T;
};

export function compile<T extends RegisteredAPI<Function>[]>(...expressions: T) : CompiledBuilder<T> {
  return {
    ...combine(...expressions),
    __expressions: expressions,
  }; 
}