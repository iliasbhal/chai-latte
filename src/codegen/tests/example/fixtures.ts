import { compile, expression } from '../../../';

export default compile(
  expression(
    ({ the }) => the.man.is.alive(Boolean).and.well(Boolean),
    (isAlive: Boolean, isWell: Boolean) => 'First',
  ),

  expression(
    ({ the }) => the(Boolean).and.well(Boolean),
    (isAlive: Boolean, isWell: Boolean) => 'Second',
  )
);