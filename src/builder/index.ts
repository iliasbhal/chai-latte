import { combine } from './combine';
import { register } from './register';
import { createTypegingForBuilders } from './codegen';

export class Builder {
  static combine = combine;
  static register = register;
  static traverse = createTypegingForBuilders;
}