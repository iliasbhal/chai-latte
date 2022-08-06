export class TemplateBuilder {
  template = '';
  variables: unknown[] = [];
  callback?: (tempalte: TemplateBuilder) => void;
  canTrace = true;

  disable() {
    this.canTrace = false;
  }

  enable() {
    this.canTrace = true;
  }

  constructor(callback?) {
    this.callback = callback;
  }

  reset() {
    if (!this.canTrace) return;

    this.template = '';
    this.variables = [];
  }

  trace(config: { variable?: string, word?: string }) {
    if (!this.canTrace) return;

    let templateChunk = config.variable
      ? `\${${TemplateBuilder.getTemplateFromVariable(config.variable)}}`
      : config.word;

    if (config.variable) {
      this.variables.push(config.variable);
    }

    this.template += ` ${templateChunk}`;
    this.template = this.template.trim();

    if (this.callback) {
      this.callback(this);
    }
  }

  static createTemplateType(type: unknown) {
    switch (typeof type) {
      case 'function':
        return this.createPrototypalChainHash(type);
      default:
        throw new Error(`Template Error: cannot use a ${typeof type} as a variable`);
    }
  }

  static getTemplateFromVariable(variable: unknown) {
    switch (typeof variable) {
      case 'string':
      case 'boolean':
      case 'number':
      case 'object':
        return this.getPrototypalChainFromInstance(variable);
      default:
        throw new Error(`Template Error: cannot use a ${typeof variable} as a variable`);
    }
  }

  static hashByClass = new Map();
  static createPrototypalChainHash(classObj: any) {
    let prototipalChain = [];
    prototipalChain.push(classObj);

    let proto = classObj.__proto__;
    while (proto.name) {
      prototipalChain.push(proto);
      proto = proto.__proto__
    }

    const hash = prototipalChain
      .map((proto) => proto.name)
      .join('->');
    this.hashByClass.set(classObj, hash);

    return hash;
  }

  static getPrototypalChainFromInstance(instance: any) {
    let proto = instance.constructor;
    while (proto && !this.hashByClass.has(proto)) {
      proto = proto.__proto__
    }

    const hash = this.hashByClass.get(proto);
    return hash;
  }
}
