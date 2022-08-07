import { Builder } from '../../..';

export default Builder.compile(
  Builder.register(
    ({ the }) => the.man.is.alive(Boolean).and.well(Boolean),
    (isAlive: Boolean, isWell: Boolean) => 'First',
  ),

  Builder.register(
    ({ the }) => the(Boolean).and.well(Boolean),
    (isAlive: Boolean, isWell: Boolean) => 'Second',
  )
);