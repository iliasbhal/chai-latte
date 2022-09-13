import { getPrototypeChain  } from "./getPrototypeChain";
import { getPrimitiveType } from "./getPrimitiveType";

export class ConfigurableCallback  {
  static list = new Set();
  static configByCallback = new Map<any, ConfigurableCallback>();
  static configByProps = new Map<any, ConfigurableCallback>();
  static getBuilderOf(key) { 
    return this.configByCallback.get(key) || this.configByProps.get(key);
  }

  expression: any;
  returnByArg = new Map();
  props = {};
  args: any = [];

  private execute: any;
  constructor(expression) {
    this.expression = expression;
    this.execute = expression.callback;
    this.args = expression.args ?? [];
    ConfigurableCallback.list.add(this);
    ConfigurableCallback.configByCallback.set(this.callback, this);
    ConfigurableCallback.configByCallback.set(this.handleFunctionCall, this);
    ConfigurableCallback.configByProps.set(this.props, this);

    // console.log('ConfigurableCallback.configByCallback', ConfigurableCallback.configByCallback);

    // (this.handleFunctionCall as any).aaaa = "AAAAAA"
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

  callIndex: number;
  setCallIdx(idx: number) {
    this.callIndex = idx;
  }

  originCallbackByArg = new Map<any, ConfigurableCallback>();
  setArgOrigin(arg, callback) {
    this.originCallbackByArg.set(arg, callback);
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

  handleFunctionCall = (arg) => {
    const matchedReturn = this.getMatchedReturn(arg);

    switch (typeof matchedReturn) {
      case 'function':
        const allArgs = [...this.getArgs(), arg];
        // clears accumulation of arguments for future calls
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

  callback = new Proxy(this.handleFunctionCall, {
    get: (target, prop, receiver) => {
      if (this.props[prop]) {
        return this.props[prop];
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}