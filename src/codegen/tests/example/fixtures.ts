import { compile, expression } from '../../../';

export class Common {};
export class Event extends Common {};
export class State extends Common {};
export class Action extends Common {};

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
  ),

  expression(
    ({ given }) => given(State).when(Event).then.it.becomes(State),
    ({ given }) => given(State).when(Event).then(State),
    (state : State, event: Event, nextstate: State) => 'Third',
  ),

  expression(
    ({ given }) => given(State).when(Event).then.it.does(Action),
    ({ given }) => given(State).when(Event).then(Action),
    (state : State, event: Event, action: Action) => 'Fourth',
  ),
);