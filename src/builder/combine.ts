import { getPrototypeChain } from './lib/getPrototypeChain';
import { ConfigurableCallback } from './lib/ConfigurableCallback';
import { Expression, RegisteredAPI } from './register';

export const combine = (...registeredAPIs: RegisteredAPI<any>[]) => {
  const sharedArgs = [];
  const combinedFluentAPI: any = {};

  // share argument between all functions in the subtree.
  Array.from(ConfigurableCallback.configByCallback).forEach(([_, configurableCallback]) => {
    configurableCallback.args = sharedArgs;
  });

  registeredAPIs.forEach((registeredAPI, i) => {
    registeredAPI.builder.setExpressionIdx(i);
  });

  registeredAPIs.forEach((registeredAPI, i) => {
    mergeSubtree(registeredAPI.api, combinedFluentAPI);
  });

  return combinedFluentAPI;
}

const mergeSubtree = (source, target) => {
  const isSourceObj = typeof source === 'object';
  const isTargetObj = typeof target === 'object';
  if (isSourceObj && isTargetObj) {
    // console.log('merging {} with {}', source, target);
    return mergeObjectWithObject(source, target);
  }

  const isSourceFn = typeof source === 'function';
  const isTargetFn = typeof target === 'function';
  if (isSourceFn && isTargetFn) {
    // console.log('merging callbacks', source, target)
    return mergeCallbackWithCallback(source, target);
  }

  if (isSourceObj && isTargetFn) {
    // console.log('merging {} with callback', source, target);
    return mergeObjectWithFunctionProps(source, target);
  }

  if (isSourceFn && isTargetObj) {
    // console.log('merging callback with {}', source, target);
    return mergeFunctionWithObject(source, target);
  }

  throw new Error(`Case handled src:${typeof source} target:${typeof target}`)
};

const parentTargetByTarget = new Map<any, any>();
const mergeObjectWithObject = (source, target) => {
  const [[sourceProp, sourceSubtree]] = Object.entries(source);
  const doesKeyExist = !!target[sourceProp];
  parentTargetByTarget.set(target[sourceProp], { parent: target, prop: sourceProp });
  if (!doesKeyExist) {
    target[sourceProp] = sourceSubtree;
    parentTargetByTarget.set(sourceSubtree, { parent: target, prop: sourceProp });
    return;
  }

  mergeSubtree(sourceSubtree, target[sourceProp]);
  return target;
}

const mergeCallbackWithCallback = (source, target) => {
  const targetCallbackBuilder = ConfigurableCallback.getBuilderOf(target);
  const srcCallbackBuilder = ConfigurableCallback.getBuilderOf(source);
  if (!srcCallbackBuilder || !targetCallbackBuilder) {
    return;
  }

  srcCallbackBuilder.returnByArg.forEach((returned, arg) => {
    if (!targetCallbackBuilder.returnByArg.get(arg)) {
      targetCallbackBuilder.setArgOrigin(arg, srcCallbackBuilder);
      targetCallbackBuilder.returnByArg.set(arg, returned);
    } else {
      mergeSubtree(returned, targetCallbackBuilder.returnByArg.get(arg))
    }
  });

  // port parent class api to all its extends subclasses;
  targetCallbackBuilder.returnByArg.forEach((retuned, arg) => {
    const argProtoChain = getPrototypeChain(arg);
    argProtoChain.forEach((proto) => {
      if (targetCallbackBuilder.returnByArg.has(proto)) {
        mergeSubtree(targetCallbackBuilder.returnByArg.get(proto), retuned);
      }
    })
  })

  // console.log('srcCallbackBuilder.returnByArg', srcCallbackBuilder.returnByArg)
  // console.log('targetCallbackBuilder.returnByArg', targetCallbackBuilder.returnByArg)
  return target;
}


const mergeObjectWithFunctionProps = (source, target) => {
  ensureExpressionsAreNotOveridden(source, target);

  const targetConfig = ConfigurableCallback.getBuilderOf(target);
  Object.entries(source).forEach(([srcKey, srcVal]) => {
    parentTargetByTarget.set(targetConfig.props[srcKey], { 
      parent: targetConfig.props,
      prop: srcKey 
    })

    if (targetConfig.props[srcKey]) {
      return mergeSubtree(srcVal, targetConfig.props[srcKey]);
    }

    targetConfig.props[srcKey] = srcVal;
    parentTargetByTarget.set(srcVal, { 
      parent: targetConfig.props,
      prop: srcKey 
    })
  });
  return target;
}

const mergeFunctionWithObject = (source, target) => { 
  ensureExpressionsAreNotOveridden(source, target);
  
  const { parent, prop } = parentTargetByTarget.get(target);
  parent[prop] = source;
  parentTargetByTarget.set(parent[prop], {
    parent: parent,
    prop: prop,
  });

  return mergeObjectWithFunctionProps(target, source);
}

const ensureExpressionsAreNotOveridden = (source, target) => {
  const isSrcFinal = Expression.isFinalCallback(source);
  const isTargetFinal = Expression.isFinalCallback(target);
  if (isSrcFinal || isTargetFinal) {
    // should not override a preexisting API.
    // ex: defining two expressions like the.guy('xyz') and the.guy('xyz').are.incompatible();
    // will cause a conflict, the latter overrides the former.
    throw new Error('Incompatible Fluent API');
  }
}
