import { ConfigurableCallback } from './lib/ConfigurableCallback';

export interface RegisteredAPI<Callback extends Function> {
  api: any,
  callback: Callback,
  expression: Expression<Callback>,
};

type FluentCreator = (fluentProxy: any) => void;


type Register = 
  (<Callback extends Function>(create: FluentCreator, callback: Callback) => RegisteredAPI<Callback>[])
 & (<Callback extends Function>(create: FluentCreator, create2: FluentCreator, callback: Callback) => RegisteredAPI<Callback>[])
 & (<Callback extends Function>(create: FluentCreator, create2: FluentCreator, create3: FluentCreator, callback: Callback) => RegisteredAPI<Callback>[])
 & (<Callback extends Function>(create: FluentCreator, create2: FluentCreator, create3: FluentCreator, create4: FluentCreator, callback: Callback) => RegisteredAPI<Callback>[])
 & (<Callback extends Function>(create: FluentCreator, create2: FluentCreator, create3: FluentCreator, create4: FluentCreator, create5: FluentCreator, callback: Callback) => RegisteredAPI<Callback>[]);

export const register : Register = (...args) => {
  const callback = args.pop();
  
  return args.map((createUsePattern) => {
    const expression = new Expression(callback);
    const buildListener = expression.createBuilderProxy();
    createUsePattern(buildListener);
    const api = expression.getFluentAPI();
    return {
      api,
      callback,
      expression,
    };
  })
};

export class Expression<Callback extends Function> {
  fluentAPI: any = {};
  pointer: BuildPointer;
  static callbacks = new WeakSet();
  callbacks = new Set<ConfigurableCallback>();
  callback: Callback;
  args = [];
  constructor(callback: Callback) {
    this.callback = callback;
    Expression.callbacks.add(callback);
    this.pointer = new BuildPointer(this.fluentAPI);
  }

  index: number = 0;
  setExpressionIdx(index: number) {
    this.index = index;
    this.callbacks.forEach((callback) => {
    });
  }

  static isFinalCallback(cb: any) {
    return Expression.callbacks.has(cb);
  }

  getFluentAPI() : any {
    return this.fluentAPI;
  }

  createConfigurableCallback() {
    const callback = new ConfigurableCallback(this);
    this.callbacks.add(callback);
    return callback;
  }

  isLastPointerCallback() {
    const lastPointer = this.pointer.getLastPointer();
    const isLastPointerCallback = typeof lastPointer === 'function';
    return isLastPointerCallback;
  }

  debugId = '';
  updateDebugProp(prop) {
    this.debugId += this.debugId ? '.' + prop : prop;
  }

  updateDebugFunction(arg) {
    if (typeof arg === 'undefined') {
      this.debugId += '()';
      return;
    }

    this.debugId += '(' + arg.name + ')';
  }

  callbackCount = 0;
  handleFunctionCalled(arg: any) {
    const fluentFunction = this.createConfigurableCallback();
    this.pointer.overrideLastPointer(fluentFunction.callback)
    fluentFunction.updateArg(arg);
    fluentFunction.setCallIdx(this.callbackCount++);
    this.updateDebugFunction(arg);
  }

  handlePropertyAccess(prop: string) {
    const isAccessingPropAfterCall = this.isLastPointerCallback();
    if (isAccessingPropAfterCall) {
      const lastPointer = this.pointer.getLastPointer();
      const fluentFunction = ConfigurableCallback.getBuilderOf(lastPointer);
      const nextReturn = {};
      this.pointer = new BuildPointer(nextReturn);
      fluentFunction.updateReturn(nextReturn);
    }

    this.updateDebugProp(prop);
    this.pointer.accessProp(prop);
    this.pointer.movePointer(prop);
  }

  createBuilderProxy(): any {
    const attribute = (arg: any) => {
      this.handleFunctionCalled(arg);
      return proxyBuilder;
    };

    const proxyBuilder = new Proxy(
      attribute,
      {
        get: (target, prop: string) => {
          this.handlePropertyAccess(prop);
          return proxyBuilder;
        },
      },
    );

    return proxyBuilder;
  }
}

class BuildPointer {
  lastWord: string = null;
  lastPointer: any = null;
  pointer: any = null;
  
  constructor(initialValue: any) {
    this.pointer = initialValue
  }

  overrideLastPointer(override) {
    return this.lastPointer[this.lastWord] = override;;
  }

  getLastPointer() {
    return this.lastPointer?.[this.lastWord];
  }

  movePointer(prop) {
    this.lastPointer = this.pointer;
    this.lastWord = prop;
    this.pointer = this.pointer[prop];
  }

  accessProp(prop) {
    if (!this.pointer[prop]) {
      this.pointer[prop] = {};
    }
  }
}
