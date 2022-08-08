/* ------------------------------------
*  Generated by chai-latte
*  Please do not edit this file directly
*  Instead, edit the file './fixtures'
* ------------------------------------
*/

import builder from './fixtures';

type Expressions = typeof builder.__expressions;
type ExpressionCallback<Idx extends number> = Expressions[Idx]['callback'];
type Arg<Idx extends number, ArgIndex extends number> = Parameters<ExpressionCallback<Idx>>[ArgIndex];
type Return<Idx extends number> = ReturnType<ExpressionCallback<Idx>>;

type Root = {}
  & { the: { man: { is: { alive: { (isAlive: Arg<0, 0>) : { and: { well: { (isWell: Arg<0, 1>) : Return<0>; }; } }; }; }; }; }; }
  & { the: { (isAlive: Arg<1, 0>) : { and: { well: { (isWell: Arg<1, 1>) : Return<1>; }; } }; }; };

export default builder as Root;