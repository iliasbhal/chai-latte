import { getPrototypeChain  } from "./getPrototypeChain";
import { getPrimitiveType } from "./getPrimitiveType";

export class ConfigurableCallback  {
  static configByCallback = new Map<any, ConfigurableCallback>();
  static configByProps = new Map<any, ConfigurableCallback>();
  static getBuilderOf(key) { 
    return this.configByCallback.get(key) || this.configByProps.get(key);
  }

  returnByArg = new Map();
  props = {};
  args: any = [];

  private execute: any;
  constructor(callback, args) {
    this.execute = callback;
    this.args = args ?? [];
    ConfigurableCallback.configByCallback.set(this.callback, this);
    ConfigurableCallback.configByProps.set(this.props, this);
  }

  lastArg: any = null;
  updateReturn(obj: any) {
    this.returnByArg.set(this.lastArg, obj);
    this.lastArg = undefined;
  }

  updateArg(arg: any) {
    this.lastArg = arg;
    this.returnByArg.set(this.lastArg, this.execute);
  }

  getMatchedReturn(arg: any) : any {
    const isExactMatch = this.returnByArg.has(arg);
    if (isExactMatch) {
      return this.returnByArg.get(arg);
    }

    const primitiveType = getPrimitiveType(arg);
    const isMatchPrimitiveType = this.returnByArg.has(primitiveType);
    if (isMatchPrimitiveType) {
      return this.returnByArg.get(primitiveType);
    }

    const prototypeChain = getPrototypeChain(arg);
    for (const proto of prototypeChain) {
      const isMatchPrototype = this.returnByArg.has(proto);
      if (isMatchPrototype) {
        return this.returnByArg.get(proto);
      }
    }
  }
  
  getArgs() {
    return this.args;
  }

  onFunctionCalled = (arg) => {
    const matchedReturn = this.getMatchedReturn(arg);

    switch (typeof matchedReturn) {
      case 'function':
        const allArgs = [...this.getArgs(), arg];
        // clears accumulation of argumens for future calls
        this.getArgs().splice(0);
        return matchedReturn(...allArgs);
      case 'object': 
        this.getArgs().push(arg);
        return matchedReturn;
      default:
        this.getArgs().splice(0);
        throw new Error('Unsupported Argument');
    }
  };

  callback = new Proxy(this.onFunctionCalled, {
    get: (target, prop, receiver) => {
      if (this.props[prop]) {
        return this.props[prop];
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}