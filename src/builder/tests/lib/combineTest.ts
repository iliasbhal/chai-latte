import { Builder } from '../..';
import { getPermutations } from './getPermutations';

export const combineTest = (testName: string, testCallback: any) => {
  const orginalCombine = Builder.combine;
  const retrievePermutations = () => {
    const permutations: any[][] = []
    Builder.combine = (...args) => {
      const argPermutations = getPermutations(args)
        .map(order => {
          return order.map((item) => args.indexOf(item))
        });

      permutations.push(...argPermutations);
      throw new Error('Got Permutations');
    }

    const log = console.log
    try {
      console.log = () => {};
      testCallback();
    } catch (err) {
    } 

    console.log = log;
    Builder.combine = orginalCombine;
    return permutations;
  }

  const runPermutationTests = (permutations) => {
    for(const permutation of permutations) {        
      try {
        Builder.combine = (...args) => {
          const shuffledArgs = permutation.map((idx) => args[idx]);
          return orginalCombine(...shuffledArgs);
        }
        testCallback();
      } catch (err) {
        Builder.combine = orginalCombine;
        throw err;
      }

      Builder.combine = orginalCombine;
    }
  }

  const permutations = retrievePermutations();
  it(`(x${permutations.length}) ${testName}`, () => {
    runPermutationTests(permutations);
  });
}