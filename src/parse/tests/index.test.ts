import { parse, createFluentAPI, createExecutableFluentAPI } from '..';

describe('Generated Fluent API', () => {
  class Machine {};
  class Action {};
  class State {};
  class Event {};

  const machine = new Machine();
  const action = new Action();
  const state = new State();
  const event = new Event();

  it('should work create a fluent API based on parsed sentences', () => {
    const { the , when } = createFluentAPI([
      parse`the ${Machine} should blink`,
      parse`the ${Machine} should hide`,
      parse`when the ${Machine} starts it should notify`,
    ])


    expect(() => the(machine).should.hide()).not.toThrow(Error);
    expect(() => the(machine).should.blink()).not.toThrow(Error);
    expect(() => the(machine).should.blink()).not.toThrow(Error);
    expect(() => when.the(machine).starts.it.should.notify()).not.toThrow(Error);
  });

  it('should handle mixed type attribute and function on the same word', () => {
    const { when } = createFluentAPI([
      parse`when the ${Machine} starts it should notify`,
      parse`when ${Machine} does ${Action} every ${Number} sec`,
      parse`when ${Machine} does ${Action} each ${Number} sec`,
      parse`when ${Machine} is ${State} it should blink`,
    ]);

    expect(() => when.the(machine).starts.it.should.notify()).not.toThrow(Error);
    expect(() => when(machine).does(action).every(2).sec()).not.toThrow(Error);
    expect(() => when(machine).is(state).it.should.blink()).not.toThrow(Error);
  })

  it('should call the correct function when a sentence is complete', () => {
    const sentenceConfig = {
      sentence: parse`when the ${Machine} starts it should notify`,
      execute: jest.fn(),
    };

    const { when } = createExecutableFluentAPI([
      sentenceConfig,
    ])

    const execute = () => when.the(machine).starts.it.should.notify;
    expect(execute).not.toThrow(Error);
    expect(sentenceConfig.execute).toHaveBeenCalled();
    expect(sentenceConfig.execute).toHaveBeenCalledWith(machine);
  });

  it('should execute the correct when several sentences are specified', () => {
    const sentenceConfig = {
      sentence: parse`when the ${Machine} starts it should notify`,
      execute: jest.fn(),
    };
    
    const sentenceConfig2 = {
      sentence: parse`when the ${Machine} starts it should blink`,
      execute: jest.fn(),
    };

    const { when } = createExecutableFluentAPI([
      sentenceConfig,
      sentenceConfig2,
    ]);

    when.the(machine).starts.it.should.notify()
    when.the(machine).starts.it.should.blink();

    expect(sentenceConfig2.execute).toHaveBeenCalled();
    expect(sentenceConfig2.execute).toHaveBeenCalledWith(machine);
  });

  it('should execute the correct when several variables are specified', () => {
    const sentenceConfig = {
      sentence: parse`when the ${Machine} starts it should notify ${Machine}`,
      execute: jest.fn(),
    };

    const { when } = createExecutableFluentAPI([
      sentenceConfig,
    ])

    when.the(machine).starts.it.should.notify(machine)

    expect(sentenceConfig.execute).toHaveBeenCalled();
    expect(sentenceConfig.execute).toHaveBeenCalledWith(machine, machine);
  });

  it('should execute the correct even with mixed word', () => {
    const sentenceConfig = {
      sentence: parse`when ${Machine} starts`,
      execute: jest.fn(),
    };
    
    const sentenceConfig2 = {
      sentence: parse`when the ${Machine} starts`,
      execute: jest.fn(),
    };

    const { when } = createExecutableFluentAPI([
      sentenceConfig,
      sentenceConfig2,
    ])

    when(machine).starts();
    when.the(machine).starts();

    expect(sentenceConfig.execute).toHaveBeenCalled();
    expect(sentenceConfig.execute).toHaveBeenCalledWith(machine);
    expect(sentenceConfig2.execute).toHaveBeenCalled();
    expect(sentenceConfig2.execute).toHaveBeenCalledWith(machine);
  })

  it('should execute the correct even with mixed word even with several arguments', () => {
    const sentenceConfig = {
      sentence: parse`when ${Machine} should do ${Action} when ${Event}`,
      execute: jest.fn(),
    };
    
    const sentenceConfig2 = {
      sentence: parse`when the ${Machine} must do ${Action} when it receives ${Event} is triggered`,
      execute: jest.fn(),
    };

    const { when } = createExecutableFluentAPI([
      sentenceConfig,
      sentenceConfig2,
    ]);

    when(machine).should.do(action).when(event);
    when.the(machine).must.do(action).when.it.receives(event).is.triggered();
    
    expect(sentenceConfig.execute).toHaveBeenCalled();
    expect(sentenceConfig.execute).toHaveBeenCalledWith(machine, action, event);
    expect(sentenceConfig2.execute).toHaveBeenCalled();
    expect(sentenceConfig2.execute).toHaveBeenCalledWith(machine, action, event);
  })

  it('should use internal words already used as function properties in js', () => {
    const sentenceConfig = {
      sentence: parse`the name of ${Machine} is uniq`, // name
      execute: jest.fn(),
    };

    const sentenceConfig2 = {
      sentence: parse`the name call ${Machine}`, // name call
      execute: jest.fn(),
    };

    const sentenceConfig3 = {
      sentence: parse`the constructor call ${Machine}`, // name call
      execute: jest.fn(),
    };

    const { the } = createExecutableFluentAPI([
      sentenceConfig,
      sentenceConfig2,
      sentenceConfig3,
    ]);

    const execute = () => the.name.of(machine).is.uniq();
    expect(execute).not.toThrow(Error);
    expect(sentenceConfig.execute).toHaveBeenCalled();
    expect(sentenceConfig.execute).toHaveBeenCalledWith(machine);
    
    const execute2 = () => the.name.call(machine);
    expect(execute2).not.toThrow(Error);
    expect(sentenceConfig2.execute).toHaveBeenCalled();
    expect(sentenceConfig2.execute).toHaveBeenCalledWith(machine);

    const execute3 = () => the.constructor.call(machine);
    expect(execute3).not.toThrow(Error);
    expect(sentenceConfig3.execute).toHaveBeenCalled();
    expect(sentenceConfig3.execute).toHaveBeenCalledWith(machine);
  })

  it('should discriminate between types of arguments', () => {
    class MachineType1 {};
    class MachineType2 {};

    const sentenceConfig = {
      sentence: parse`the ${MachineType1} should start`, // name
      execute: jest.fn(),
    };

    const sentenceConfig2 = {
      sentence: parse`the ${MachineType2} should start`, // name call
      execute: jest.fn(),
    };

    const { the } = createExecutableFluentAPI([
      sentenceConfig,
      sentenceConfig2,
    ]);

    const machine1 = new MachineType1();
    const machine2 = new MachineType2();

    the(machine1).should.start();
    expect(sentenceConfig.execute).toHaveBeenCalled();
    expect(sentenceConfig2.execute).not.toHaveBeenCalled();

    sentenceConfig.execute.mockClear()
    
    the(machine2).should.start();
    expect(sentenceConfig.execute).not.toHaveBeenCalled();
    expect(sentenceConfig2.execute).toHaveBeenCalled();
  });
});