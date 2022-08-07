<img src="https://raw.githubusercontent.com/iliasbhal/chai-latte/main/public/repo_hero.png" />

## ✨ What is chai-latte?

Let's you create expressive & readable fluent interface libraries. <br/>
Think of it as a simple tool to buid things that looks like [chaijs](https://www.chaijs.com/) but it can do anything, not just testing :).

## 🤔 Motication

Building expressive fluent interfaces isn't easy. As you add new expressions, it quickly become un-maintainable and run into conflict between expressions. This tool will do all the heavy lifting for you, removing all the repetitive and soul crushing tasks, needed do to create such libraries. Now, You can focus on adding expressions and watch it just work ✨.

## :rocket: Quick Start!

It's available on npm. To install it, type:

```sh
yarn add -D chai-latte
```

Lets create a library that will be able to create arrays and add number to it.
I know... The example is not exiting 😅. But let's create it anyway!

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
import { compile } from 'chai-latte';

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
const arr = create.an.array(); // it returned [] and logged 'Array Created!'.
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
4. Congrtulations!! 🎉 you can now use your library! in the example above, `ourLibrary` implements every expression provied to the `compile` function. See example:

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

5. Optional. To make your library type-safe, we can generate typescript types from the compiled fluent interface we just created. This will give a better exprience to your users as it will improve api discovery and enable autocomplete with their IDE's. The command line will create a new file called `generated.ts`. Use it as your entry file. Type this in the terminal:

```sh
npx chai-latte ./index.ts
```

<br />
<img src="https://raw.githubusercontent.com/iliasbhal/chai-latte/main/public/repo_footer.png" />
<br />

## :handshake: Contributing

Thank you very much for considering to contribute! <br />
Please create issues, PRs and stuff. Your contribution is very much welcome!.

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
