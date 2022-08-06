export const getPrototypeChain = (obj) => {
  const chain = []
  let t = obj
  while (t) {
    t = Object.getPrototypeOf(t)
    if (t === null) {
      break;
    }
    if (t.constructor) {
      chain.push(t.constructor)
    }
    chain.push(t)
  }

  return chain
}