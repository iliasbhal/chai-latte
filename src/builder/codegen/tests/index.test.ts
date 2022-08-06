// import fs from 'fs-extra';
import path from 'path';
import dedent from 'dedent';
import { createTypegingForBuilders, generateTypedApiFromPath } from '..';
import { Builder } from '../..'

describe('Codegen', () => {
    it('should throw when file doesnt exist', async () => {
      const inOutConfig = {
        input: path.resolve(__dirname, './ljdskfhlkjshdfkjasdf'),
      };

      await expect(generateTypedApiFromPath.bind(null, inOutConfig)).rejects.toThrow();
    })

    it('should emit file when file doesnt exist', async () => {
      const inOutConfig = {
        input: path.resolve(__dirname, './example/fixtures'),
      };

      await generateTypedApiFromPath(inOutConfig);
      
    })

    it('should create a typeging for builders', async () => {
      const inOutConfig = {
        input: path.resolve(__dirname, './example/fixtures'),
      };

      const typings = await createTypegingForBuilders(inOutConfig, [
        Builder.register(
          ({ the }) => the.man.is.alive(Boolean).and.well(Boolean),
          (isAlive: Boolean, isWell: Boolean) => 'First',
        ),
      
        Builder.register(
          ({ the }) => the(Boolean).and.well(Boolean),
          (isAlive: Boolean, isWell: Boolean) => 'Second',
        )
      ]);

      expect(typings).toEqual(dedent`
        // 
        // Generated by chai-latte
        // Please do not edit this file directly
        // Instead, edit the file './fixtures'
        //

        import { Builder } from 'chai-latte';
        import sentences from './fixtures';
        
        type BuilSentences = typeof sentences;
        type CallbackType<Idx extends number> = BuilSentences[Idx]['callback'];
        type CallbackArg<Idx extends number, ArgIndex extends number> = Parameters<CallbackType<Idx>>[ArgIndex];
        type CallbackReturn<Idx extends number> = ReturnType<CallbackType<Idx>>;
        
        type Root = {}
          & { the: { man: { is: { alive: { (isAlive: CallbackArg<0, 0>) : { and: { well: { (isWell: CallbackArg<0, 1>) : CallbackReturn<0>; }; } }; }; }; }; }; }
          & { the: { (isAlive: CallbackArg<1, 0>) : { and: { well: { (isWell: CallbackArg<1, 1>) : CallbackReturn<1>; }; } }; }; };
        
        const apis = sentences.map(a => a.api);
        export default Builder.combine(...apis) as Root;
      `)
    })
});
 