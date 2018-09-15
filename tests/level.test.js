require('../index');
const chai = require('chai');
const expect = chai.expect;

describe('Test debug levels being set.', () => {
  const log0 = new Logger('Test 0');
  it('Accepts numeric levels', () => {
    const levelsNum = [ 5, 4, 3, 2, 1, 0 ];

    for (let level of levelsNum) {
      expect(log0.level(level)).to.equal(level);
    }
  });

  it('Accepts string levels', () => {

    [ [ 'debug', 5 ],
      [ 'info', 4 ],
      [ 'success', 3 ],
      [ 'warn', 2 ],
      [ 'error', 1 ],
      [ 'disable', 0 ] ].forEach(level => {
      expect(log0.level(level[ 0 ])).to.equal(level[ 1 ]);
    });

  });

  it(`Doesn't accept string levels that don't exist.`, () => {
    expect(() => log0.level('NotALevel'))
      .to.throw(Error)
      .with.property('message', `'notalevel' is not a valid logging level.`);
  });

  it(`Resets numeric levels outside of 0-5.`, () => {
    expect(log0.level(- 1)).to.equal(0);
    expect(log0.level(6)).to.equal(5);
  });
});

describe('Test namespace logging subscriptions.', () => {
  const log1 = new Logger('Test 1', 5);
  const levels = [ 'Debug', 'Info', 'Success', 'Warn', 'Error' ];

  for (let level of levels) {
    it(`Subscribes to ${level} events.`, (done) => {
      const num = Math.random();
      log1.events.on(level, (message, number) => {
        expect(message).to.equal(level);
        expect(number).to.equal(num);
        done();
      });

      log1[ level.toLowerCase() ](level, num);
    });
  }
});

describe('Test global logging subscriptions.', () => {
  const log2 = new Logger('Test 2', 5);
  const log3 = new Logger('Test 3', 5);
  const allEvents = Logger.allEvents;
  const levels = [ 'Debug', 'Info', 'Success', 'Warn', 'Error' ];

  for (let level of levels) {
    it(`Subscribes to global ${level} events.`, (done) => {
      const num = Math.random();
      let events = 0;
      allEvents.on(level, (message, number) => {
        expect(message).to.equal(level);
        expect(number).to.equal(num);
        if (++ events === 2) complete();
      });
      log2[ level.toLowerCase() ](level, num);
      log3[ level.toLowerCase() ](level, num);

      function complete() {
        // Clean up the subscription.
        allEvents.removeAllListeners(level);
        done()
      }
    });
  }
});

describe('Test that logging ignores overridden context', () => {
  const log4 = new Logger('Test 4', 5);

  [ 'debug',
    'info',
    'success',
    'warn',
    'error',
  ].forEach(level => {
    it(`Rebound ${level} should not throw error.`, (done) => {
      const log5 = log4[ level ].bind({});
      // If context wasn't ignored, this would throw an error.
      expect(log5(`${level} throw test.`)).to.equal(undefined);
      done();
    })
  });

});

//ToDo: Write tests to ensure that console logging is as expected.