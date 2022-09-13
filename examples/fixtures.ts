import { compile, expression } from 'chai-latte';

export const withNarration = <T extends (...args: any[]) => any>(callback: T) : ReturnType<T> => {
  // const narrationCtx = NarrationBuildContext.getCurrent();

  const returned = callback();
  // narrationCtx.add(returned);

  return returned;
}

export default compile(
  expression(
    ({ it }) => it.starts.as(String),
    (stateName: string) => {
      return withNarration(() => {
        // return new State(stateName, { initial: true }); aaaaa
      });
    }
  ),
  expression(
    ({ it }) => it.can.be(String),
    (stateName: string) => {
      return withNarration(() => {
        // return new State(stateName);
      });
    }
  ),
  expression(
    ({ it }) => it.can.be(String),
    (stateName: string) => {
      return withNarration(() => {
        // return new State(stateName);
      });
    }
  ),
);