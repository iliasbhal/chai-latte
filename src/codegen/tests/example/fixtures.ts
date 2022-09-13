import { compile, expression } from '../../../';

export default compile(
  expression(
    ({ the }) => the.man.is.alive(Boolean).and.well(Boolean),
    (isAlive: Boolean, isWell: Boolean) => 'First',
  ),

  expression(
    ({ the }) => the(Boolean).and.well(Boolean),
    ({ the }) => the(Boolean).and.very.well(Boolean),
    ({ the }) => the(Boolean).and.realy.well(Boolean),
    (isAlive: Boolean, isWell: Boolean) => 'Second',
  )
);