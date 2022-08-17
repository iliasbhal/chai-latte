import { Builder } from '..';
import { combineTest } from './lib/combineTest';

function createBuildTest(buildCallback, createTests, config: { only } = { only: false }) {
  const startOfFnBodyIdx = buildCallback.toString().match('=>').index + 2;
  const testName = buildCallback.toString().slice(startOfFnBodyIdx).trim();

  const testBody = () => {
    const callback = jest.fn();
    const { api } = Builder.register(buildCallback,callback);
  
    buildCallback(api);
    createTests(callback);
  };

  if (config.only) {
    it.only(testName, testBody);
  } else {
    it(testName,testBody);
  }
}

function buildFluentMock(buildCallback, forceCallback?) {
  const callback = forceCallback ?? jest.fn();
  const registeredFluentAPI = Builder.register(buildCallback,callback);
  return [registeredFluentAPI.api, callback];
}

createBuildTest.only = (a, b) => createBuildTest(a, b, { only: true });

describe('Single Builder', () => {
  createBuildTest(({ the }) => the.man.should.do(), (callback) => {
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(undefined);
  })

  createBuildTest(({ the }) => the.man.should.do('a string'), (callback) => {
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a string');
  })

  createBuildTest(({ the }) => the.man.do('a string').and.do(), (callback) => {
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a string', undefined);
  })

  createBuildTest(({ the }) => the.man.do('a string').and.do('another string'), (callback) => {
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a string', 'another string');
  })

  createBuildTest(({ the }) => the('a string').and.do('another string'), (callback) => {
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a string', 'another string');
  })

  createBuildTest(({ the }) => the('a string').and('another string').do(), (callback) => {
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a string', 'another string', undefined);
  })

  it('should be able to call it several times', () => {
    const [{ the }, callback] = buildFluentMock(({ the }) => the('a string').and('another string').do());
    the('a string').and('another string').do()
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a string', 'another string', undefined);
    callback.mockClear();

    the('a string').and('another string').do()
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a string', 'another string', undefined);
    callback.mockClear();

    the('a string').and('another string').do()
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a string', 'another string', undefined);
    callback.mockClear();
  })

  it('should not allow unsupported arguments', () => {
    {
      const [{ the }] = buildFluentMock(({ the }) => the('a string').and('another string').do());
      expect(() => the('something else')).toThrowError('Unsupported Argument');
      expect(() => the('a string').and('something else')).toThrowError('Unsupported Argument');
    }
    {
      const [{ the }, callback] = buildFluentMock(({ the }) => the(String).and().do());
      expect(() => the('name').and().do('aaaa')).toThrowError('Unsupported Argument');
      expect(callback).not.toHaveBeenCalled();
    }
  })

  it('works if argument matches String class', () => {
    const [{ the }, callback] = buildFluentMock(({ the }) => the(String).and(String).do());
    the('a string').and('another string').do()
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a string', 'another string', undefined);
    callback.mockClear();

    const arg = new String('false');
    the(String).and(arg).do()
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(String, arg, undefined);
    callback.mockClear();
  })

  it('returns what callback returns', () => {
    const expectedReturn = Symbol();
    const callback = jest.fn().mockReturnValue(expectedReturn);
    const { api: { the }} = Builder.register(({ the }) => the('1').and('2').do(), callback);
    expect(the('1').and('2').do()).toBe(expectedReturn);
  })

  it('works if argument matches Boolean class', () => {
    const [{ the }, callback] = buildFluentMock(({ the }) => the(Boolean).and(Boolean).do());
    the(true).and(false).do()
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(true, false, undefined);
    callback.mockClear();

    const arg = new Boolean(false);
    the(Boolean).and(arg).do()
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(Boolean, arg, undefined);
    callback.mockClear();
  })

  it('works if argument matches Number class', () => {
    const [{ the }, callback] = buildFluentMock(({ the }) => the(Number).and(Number).and(Number).and(Number).do());
    the(3).and(Infinity).and(NaN).and(-Infinity).do()
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(3, Infinity, NaN, -Infinity, undefined);
    callback.mockClear();

    
    const arg = new Number(99);
    the(Number).and(Number).and(Number).and(arg).do()
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(Number, Number, Number, arg, undefined);
    callback.mockClear();
  })

  it('works if argument inherites from class', () => {
    class Parent {};
    class Child extends Parent {};
    class GrandChild extends Child {};
    class OtherChild extends Parent {};

    const parent = new Parent()
    const child = new Child()
    const grandChild = new GrandChild()
    const otherChild = new OtherChild()

    const [{ the }, callback] = buildFluentMock(({ the }) => the(Parent).and(Parent).and(Parent).and(Parent).do());
    the(parent).and(child).and(grandChild).and(otherChild).do()
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(parent,child, grandChild, otherChild, undefined);
  })

  it('should not allow to undefined access property', () => {
    const [{ the }, callback] = buildFluentMock(({ the }) => the('s1').do());
    const attempt = () => the('s1').and('s2').do();
    expect(attempt).toThrow();
    expect(callback).not.toHaveBeenCalled();
  });

  it('should check that callback uses same number of arguments as expression', () => {
    throw new Error('TODO');
  });

  it.skip('can be chained liked regular objects', () => {
    // Not working at the moment
    // Everytine we access an attribute or call a function
    // we should forward a copy of the arguments instead of using the same reference
    const [builder1, callback1] = buildFluentMock(({ the }) => the(Number).name(Number).do(Number));
    const { the } = Builder.combine(builder1);

    const chain = the(1).name(2);

    Array.from({ length: 5 }).forEach((_, i) => {
      chain.do(i);
    });

    expect(callback1).toHaveBeenCalledTimes(5);
    callback1.calls

    expect(callback1.mock.calls[0]).toMatchObject([1,2,0]);
    expect(callback1.mock.calls[1]).toMatchObject([1,2,1]);
    expect(callback1.mock.calls[2]).toMatchObject([1,2,2]);
    expect(callback1.mock.calls[3]).toMatchObject([1,2,3]);
    expect(callback1.mock.calls[4]).toMatchObject([1,2,4]);
  })

  it.skip('uncompleted sentences should not trigger calls', () => {
    const [builder1, callback1] = buildFluentMock(({ the }) => the(Number).name(Number).do(Number));
    const { the } = Builder.combine(builder1);

    the(1).name(2);
    the(1).name(3).do(4);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith(1,3,4);
  })
})

describe('Combined Builders', () => {
  function buildFluentAPIMock(buildCallback, forceCallback?) {
    const callback = forceCallback ?? jest.fn();
    const registeredFluentAPI = Builder.register(buildCallback,callback);
    return [registeredFluentAPI, callback];
  }

  combineTest('should combine several fluent apis', () => {
    const [builder1, callback1] = buildFluentAPIMock(({ the }) => the.man.should.do());
    const [builder2, callback2] = buildFluentAPIMock(({ el }) => el.man.should.do('a string'));
    const { the, el } = Builder.combine(builder1, builder2);

    el.man.should.do('a string')
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith('a string');
    callback2.mockClear();

    the.man.should.do();
    expect(callback2).not.toHaveBeenCalled();
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith(undefined);
  })

  combineTest('combined functions: call correct callback based on argument', () => {
    const [builder1, callback1] = buildFluentAPIMock(({ the }) => the.man());
    const [builder2, callback2] = buildFluentAPIMock(({ the }) => the.man('a string'));
    const { the } = Builder.combine(builder1, builder2);

    the.man('a string')
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith('a string');
  })

  combineTest('prop can be callable and also be accessed like an object', () => {
    const [builder1, callback1] = buildFluentAPIMock(({ the }) => the.man.should().do());
    const [builder2, callback2] = buildFluentAPIMock(({ the }) => the.man.should.do('a string'));
    const { the } = Builder.combine(builder1, builder2);

    the.man.should.do('a string')
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith('a string');
    callback2.mockClear();

    the.man.should().do()
    expect(callback2).not.toHaveBeenCalled();
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith(undefined, undefined);
  });

  const nativeFnProps = ["length","prototype", "name", "apply", "call", "arguments", "bind"];
  nativeFnProps.forEach((nativefnProp) => {
    combineTest(`native function prop (${nativefnProp}) should be usable by the fluent api`, () => {
      const [builder1, callback1] = buildFluentAPIMock(({ the }) => the().do());
      const [builder2, callback2] = buildFluentAPIMock(({ the }) => the[nativefnProp]());
      const [builder3, callback3] = buildFluentAPIMock(({ the }) => the[nativefnProp].do());
      const { the } = Builder.combine(builder2, builder1, builder3);
      expect(typeof the).toBe('function');
  
      the().do();
      expect(callback2).not.toBeCalled();
      expect(callback3).not.toBeCalled();
      expect(callback1).toBeCalledTimes(1);
      expect(callback1).toBeCalledWith(undefined, undefined);
      callback1.mockClear();

      the[nativefnProp]()
      expect(callback1).not.toBeCalled();
      expect(callback3).not.toBeCalled();
      expect(callback2).toBeCalledTimes(1);
      expect(callback2).toBeCalledWith(undefined);
      callback2.mockClear();

      the[nativefnProp].do()
      expect(callback1).not.toBeCalled();
      expect(callback2).not.toBeCalled();
      expect(callback3).toBeCalledTimes(1);
      expect(callback3).toBeCalledWith(undefined);
    });
  })

  // add more of these tests
  combineTest('return correct subtree', () => {
    const [builder1, callback1] = buildFluentAPIMock(({ the }) => the.man('1').should.build());
    const [builder2, callback2] = buildFluentAPIMock(({ the }) => the.man('2').should.action());
    const [builder3, callback3] = buildFluentAPIMock(({ the }) => the.man('3').should.build());
    const { the } = Builder.combine(builder1, builder2, builder3);

    the.man('3').should.build()
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledWith('3', undefined);
    callback3.mockClear();

    the.man('1').should.build()
    expect(callback2).not.toHaveBeenCalled();
    expect(callback3).not.toHaveBeenCalled();
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith('1', undefined);
    callback1.mockClear();

    the.man('2').should.action()
    expect(callback1).not.toHaveBeenCalled();
    expect(callback3).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith('2', undefined);
    callback2.mockClear();
  });

  combineTest('matches multiple inherited class and proritize more precise match', () => {
    class Parent {};
    class Child extends Parent {};

    const [builder1, callback1] = buildFluentAPIMock(({ the }) => the(Parent).do());
    const [builder2, callback2] = buildFluentAPIMock(({ the }) => the(Child).do());
    const { the } = Builder.combine(builder2, builder1);

    const parent = new Parent();
    const child = new Child();

    the(child).do();
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith(child, undefined);
    callback2.mockClear();

    the(parent).do();
    expect(callback2).not.toHaveBeenCalled();
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith(parent, undefined);
  });

  combineTest('matches first builder if compatible, should override parent api', () => {
    class Parent {};
    class Child extends Parent {};
    const [builder1, callback1] = buildFluentAPIMock(({ the }) => the(Parent).action('2'));
    const [builder2, callback2] = buildFluentAPIMock(({ the }) => the(Child).action('1'));
    const { the } = Builder.combine(builder2, builder1);

    const child = new Child();

    the(child).action('1');
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith(child, '1');
    callback2.mockClear();

    the(child).action('2');
    expect(callback2).not.toHaveBeenCalled();
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith(child, '2');
    callback1.mockClear();
  });

  combineTest('1. matches first builder if compatible', () => {
    class Parent {};
    class Child extends Parent {};
    const [builder1, callback1] = buildFluentAPIMock(({ the }) => the(Parent).action('1'));
    const [builder2, callback2] = buildFluentAPIMock(({ the }) => the(Child).do());
    const { the } = Builder.combine(builder2, builder1);

    const parent = new Parent();
    const child = new Child();

    the(child).action('1');
    expect(callback2).not.toHaveBeenCalled();
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith(child, '1');
    callback1.mockClear();

    the(child).do();
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith(child, undefined);
    callback2.mockClear();

    the(parent).action('1');
    expect(callback2).not.toHaveBeenCalled();
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith(parent, '1');
    callback1.mockClear();

    expect(() => the(parent).do()).toThrow();
  });

  combineTest('2. matches first builder if compatible', () => {
    class Parent {};
    class Child extends Parent {};
    const [builder1, callback1] = buildFluentAPIMock(({ the }) => the(Parent).action('1'));
    const [builder2, callback2] = buildFluentAPIMock(({ the }) => the(Child).action());
    const { the } = Builder.combine(builder2, builder1);

    const parent = new Parent();
    const child = new Child();

    the(child).action('1');
    expect(callback2).not.toHaveBeenCalled();
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith(child, '1');
    callback1.mockClear();

    the(child).action();
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith(child, undefined);
    callback2.mockClear();

    the(parent).action('1');
    expect(callback2).not.toHaveBeenCalled();
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith(parent, '1');
    callback1.mockClear();

    expect(() => the(parent).action()).toThrow();
  });

  combineTest('should throw if a fluent api overrides another one', () => {
    const [builder1, callback1] = buildFluentAPIMock(({ the }) => the.do());
    const [builder2, callback2] = buildFluentAPIMock(({ the }) => the.do().add());

    expect(() => Builder.combine(builder1, builder2)).toThrowError('Incompatible Fluent API');
  });
  
  describe('Complexe Cases', () => {
    const createCallbackTester = (callbacks) => (idx, args) => {
      callbacks.forEach((callback, index) => {
        if (idx - 1 === index) {
          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(...args);
        } else {
          expect(callback).not.toHaveBeenCalled();
        }
      })
    
      callbacks.forEach((callback) => {
        callback.mockClear();
      })
    }

    combineTest('complexe case 1', () => {
      const [builder1, callback1] = buildFluentAPIMock(({ the }) => the.name.do());
      const [builder2, callback2] = buildFluentAPIMock(({ the }) => the.name());
      const [builder3, callback3] = buildFluentAPIMock(({ the }) => the().name.do());
      const [builder4, callback4] = buildFluentAPIMock(({ the }) => the().name().do());
      const { the } = Builder.combine(builder1, builder2, builder3, builder4);
  
      const testCallback = createCallbackTester([callback1, callback2, callback3, callback4])
      the.name.do(); testCallback(1, [undefined])
      the.name(); testCallback(2, [undefined])
      the().name.do(); testCallback(3, [undefined, undefined])
      the().name().do(); testCallback(4, [undefined, undefined, undefined]);
    })
  });
});