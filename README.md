<img src="https://raw.githubusercontent.com/iliasbhal/chai-latte/main/public/repo_hero.png" />

## ✨ What is chai-latte?

It's a tool for building expressive fluent interface libraries. <br/>
Think of it as a simple tool to buid libraries à la [chaijs](https://www.chaijs.com/) but not necessarly related to testing. It can be about anyhting :).

## 🤔 Motivation

<p>Building expressive fluent interfaces isn't easy. the more expressions you add the more it becomes un-maintainable. You'll quickly run into conflicts between expressions.</p>
<p>This tool will do all the heavy lifting for you, removing all the repetitive and soul crushing tasks needed do to create such libraries. Now, You can focus on adding expressions and it will just work! ✨.</p>


## 🔌 Installation
It's available on npm. To install it, type:

```sh
npm i chai-latte
```
or
```sh
yarn add chai-latte
```

## :rocket: Quick Start!

Lets create a library that will be able to create arrays and add number to it.
I know... The example is not exiting 😅. But let's create it anyway! The library we'll create should be able to execute the command below:

```tsx
import example from './the/library/we/will/create';

const { create, add } = example;

const arr = create.an.array();
add(4).to.this.array(arr)
add(5).to(arr)

const arr2 = create.a.copy.of(arr);
add(5).to(arr2);
```

1. Let's create our first expression. The `expression` function takes two arguments. The first argument should be a function that shows how to use the expression. The second argument is the callback. See example below:

```ts
import { expression } from 'chai-latte';

const ourFirstExpression = expression(
  ({ create }) => create.an.array(), 
  () => {
    console.log('Array Created!');
    return [];
  }
);
```

2. Make the expression executable. `expression` alone just returns a configuration object. we should `compile` it in order to use it. See example:

```ts
import { expression, compile } from 'chai-latte';

const ourLibrary = compile(
  expression(
    ({ create }) => create.an.array(), 
    () => {
      console.log('Array Created!');
      return [];
    }
  )
);

// 

const { create } = ourLibrary;
const arr = create.an.array(); // [] and logged 'Array Created!'.
```

3. Add the other expressions! In order to do so, just add them as extra argument to the `compile` function. See example:

```ts
const addNumToArray = (num: number, arr: any[]) => arr.push(num);
const createArray = () : any[]=> [];
const cloneArray = (arr: any[]) : any[] => [...arr];

const ourLibrary = compile(
  expression(({ create }) => create.an.array(), createArray),
  expression(({ create }) => create.a.copy.of(Array), cloneArray),
  expression(({ add }) => add(Number).to.this.array(Array), addNumToArray),
  expression(({ add }) => add(Number).to(Array), addNumToArray),
);
```
4. Congrtulations!! 🎉 You can now use your library! See example:

```ts
const { create, add } = ourLibrary;

const arr = create.an.array();
add(4).to.this.array(arr)
add(5).to(arr)
console.log(arr) // logs [4, 5]

const arr2 = create.a.copy.of(arr);
add(12).to(arr2);
console.log(arr2) // logs [4, 5, 12]
```

## 📚 Typescript
To make your library type-safe, you can generate the corresponding typings using the command line. It will create a new file called `generated.ts` that will export the same fluent interface but fully typed. Then simply use this new file as your entry file!<br/><br/>
To create the `generated.ts` type this in the terminal:

```sh
npx chai-latte ./index.ts
```

## 🙈 Things to know & Limitations

1. When creating expressions, you have to provide a class for each callable parts. This is how the engine avoid conflicts.
```tsx
// example
class Human {}
class Child extends Human {}

the(Human).can.jump(); // expression 1
the(Child).will.play(); // expression 2

// if we try to call
const human = new Human();
const child = new Child();
the(child).can.jump(); // <-- will work since Child inherits Human
the(human).will.play(); // <- won't work because .will.play() isn't defined for expression 1
```
2. The last word on an expression has to be function. It can accept an argument.
```tsx
// example
the(Human).works.up.until(Number);
the(Human).can.jump();
the(Human).is.alive // <- won't compile because it doesn't end with a function
```

3. Expressions that share the exact same code path and argument types cannot co-exist. Here is an example of 3 expressions to illustrate the issue:
```tsx
// example
the(Human).can.say('Hi!');
the(Baby).can.say('Hi!'); // <- will work, because Human and Baby are different classes
the(Baby).can.say('Hi!').and.say('I\'m hungry'); // <- won't compile
```
## :handshake: Contributing

Thank you very much for considering to contribute! <br />
Please don't hesitate to create issues, PRs or just . Your contribution is very much welcome!.

## :book: License

The MIT License

Copyright (c) 2022 Chai-Latte

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

<br />
<img src="https://raw.githubusercontent.com/iliasbhal/chai-latte/main/public/repo_footer.png" />
<br />
