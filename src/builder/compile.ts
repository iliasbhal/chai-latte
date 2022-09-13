import { combine } from './combine';
import { ConfigurableCallback } from './lib/ConfigurableCallback';
import { RegisteredAPI } from './register';

export interface CompiledBuilder<T> {
  [key: string]: any;
  __expressions: T;
  __callbacks: typeof ConfigurableCallback;
};

export function compile<T extends RegisteredAPI<Function>[]>(...expressions: T) : CompiledBuilder<T> {
  const combinedExpresions = combine(...expressions) as { [key: string]: any; };
  const internalAPI = {
    __callbacks: ConfigurableCallback,
    __expressions: expressions,
  };

  return {
    ...combinedExpresions,
    ...internalAPI,
  }; 
}