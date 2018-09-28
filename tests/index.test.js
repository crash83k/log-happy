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
    [
      [ 'debug', 5 ],
      [ 'info', 4 ],
      [ 'success', 3 ],
      [ 'warn', 2 ],
      [ 'error', 1 ],
      [ 'disable', 0 ]
    ].forEach(level => {
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

describe('Test that static loggers work', () => {
  [ 'debug',
    'info',
    'success',
    'warn',
    'error',
  ].forEach(level => {
    it(`Static ${level} should not throw error.`, (done) => {
      // If context wasn't ignored, this would throw an error.
      expect(Logger[ level ](`${level} static test.`)).to.equal(undefined);
      done();
    })
  });
});

describe('Benchmark tests', () => {
  const log5 = new Logger('Test 5', 5);
  after(() => {
    log5.bench('Bench Test 1', true);
  });

  it('Namespace benchmarks start', done => {
    expect(log5.bench('Bench Test 1')).to.equal(0);
    expect(log5.bench('Bench Test 2')).to.equal(0);

    let benchTime = 0;
    setTimeout(() => {
      benchTime = log5.bench('Bench Test 1');
      expect(benchTime).to.be.above(500);
      expect(benchTime).to.be.below(510);
      done();
    }, 500);
  });

  it('Continued benchmarking', done => {
    let benchTime = 0;
    setTimeout(() => {
      benchTime = log5.bench('Bench Test 1');
      expect(benchTime).to.be.above(100);
      expect(benchTime).to.be.below(1020);
      done();
    }, 500);
  });

  it('Ends benchmarking', done => {
    let benchTime = 0;
    setTimeout(() => {
      benchTime = log5.bench('Bench Test 1', true);
      expect(benchTime).to.be.above(1500);
      expect(benchTime).to.be.below(1530);
      expect(log5.bench('Bench Test 1')).to.equal(0);
      done()
    }, 500);
  });

  it('Ensures other benchmarks run in parallel', done => {
    let benchTime2 = log5.bench('Bench Test 2', true);
    expect(benchTime2).to.be.above(1500);
    expect(benchTime2).to.be.below(1530);
    done();
  })
});

describe('Test namespace benchmark subscriptions.', () => {
  const log6 = new Logger('Test 6', 5);
  const namespace = 'benchSubscribe';
  let iteration = 0, waitTime = 200;
  for (let eventType of [ 'start', 'tick', 'end' ]) {
    it(`Gets the ${eventType} call`, done => {
      setTimeout(() => log6.bench(namespace, eventType === 'end'), waitTime);
      log6.events.on('Bench', (namespace, time, type) => {
        expect(type).to.equal(eventType);
        expect(time).to.be.at.least(waitTime * iteration);
        expect(time).to.be.below(waitTime * iteration + 10);
        log6.events.removeAllListeners('Bench');
        iteration ++;
        done();
      });
    });
  }
});

describe('Test global benchmark subscriptions.', () => {
  const log7 = new Logger('Test 7', 5);
  const namespace = 'benchSubscribe';
  let iteration = 0, waitTime = 200;
  for (let eventType of [ 'start', 'tick', 'end' ]) {
    it(`Gets the ${eventType} call`, done => {
      setTimeout(() => log7.bench(namespace, eventType === 'end'), waitTime);
      Logger.allEvents.on('Bench', (namespace, time, type) => {
        expect(type).to.equal(eventType);
        expect(time).to.be.at.least(waitTime * iteration);
        expect(time).to.be.below(waitTime * iteration + 10);
        Logger.allEvents.removeAllListeners('Bench');
        iteration ++;
        done();
      });
    });
  }
});

//ToDo: Write tests to ensure that console logging is as expected.