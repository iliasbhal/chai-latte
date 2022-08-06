import { ConfigurableCallback } from './lib/ConfigurableCallback';

export interface RegisteredAPI<Callback extends Function> {
  api: any,
  callback: Callback,
  builder: FluentBuilder<Callback>,
};

export const register = <Callback extends Function>(
  createUsePattern: (fluentProxy: any) => void,
  callback: Callback,
) : RegisteredAPI<Callback> => {
  const builder = new FluentBuilder(callback);
  const buildListener = builder.createBuilderProxy();
  createUsePattern(buildListener);
  const api = builder.getFluentAPI();
  return {
    api,
    callback,
    builder,
  };
};

export class FluentBuilder<Callback extends Function> {
  fluentAPI: any = {};
  pointer: BuildPointer;
  static callbacks = new WeakSet();
  callback: Callback;
  args = [];
  constructor(callback: Callback) {
    this.callback = callback;
    FluentBuilder.callbacks.add(callback);
    this.pointer = new BuildPointer(this.fluentAPI);
  }

  static isFinalCallback(cb: any) {
    return FluentBuilder.callbacks.has(cb);
  }

  getFluentAPI() : any {
    return this.fluentAPI;
  }

  createConfigurableCallback() {
    return new ConfigurableCallback(this.callback, this.args);
  }

  isLastPointerCallback() {
    const lastPointer = this.pointer.getLastPointer();
    const isLastPointerCallback = typeof lastPointer === 'function';
    return isLastPointerCallback;
  }

  handleFunctionCalled(arg: unknown) {
    const fluentFunction = this.createConfigurableCallback();
    this.pointer.overrideLastPointer(fluentFunction.callback)
    fluentFunction.updateArg(arg);
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
