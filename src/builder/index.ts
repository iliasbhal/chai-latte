import { combine } from './combine';
import { register } from './register';
import { compile } from './compile';
import { createTypegingForBuilders } from './codegen';

export class Builder {
  static compile = compile;
  static combine = combine;
  static register = register;
  static traverse = createTypegingForBuilders;
}