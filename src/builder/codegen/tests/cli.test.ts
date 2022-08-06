import fs from 'fs-extra';
import * as path from 'path';
// import { Codegen } from '../Codegen';

describe.skip('CLI', () => {
  const fixtures = path.resolve(__dirname, 'fixtures');
  const config = path.resolve(fixtures, 'codegen.json');
  const index = path.resolve(fixtures, 'index.ts');
  // const folder = path.resolve(__dirname, '..', '.codegen');

  beforeAll(() => {
    fs.writeJsonSync(config, {
      entry: index,
    }, { spaces: 2 });
  })

  it('should build verbal api with command line', async () => {
    // await fs.remove(folder);
    // await fs.copy(fixture, folder);

    // const types = await Codegen.build(fixtures);
    // console.log(types);

    // const {  } = await import(entry);
  });
});
 