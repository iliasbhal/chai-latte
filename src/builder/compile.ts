import { combine } from './combine';
import { RegisteredAPI } from './register';

interface InternalConfig<T> {
  __expressions: T;
};

export function compile<T extends RegisteredAPI<Function>[]>(...expressions: T) : any & InternalConfig<T> {
  return {
    ...combine(...expressions),
    __expressions: expressions,
  }; 
}