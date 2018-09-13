process.env.LOG_LEVEL = 5;
require('./index');

const log = new Logger('test1');

const testable = [ 'debug', 'info', 'success', 'warn', 'error' ];

let wait = 0, increment = 400;

// No context testing.
testable.forEach(test => {
  try {
    setTimeout(() => {
      log[ test ](test);
    }, wait);
  } catch (e) {
  }
  wait += increment;
});

// Context testing.
testable.forEach(test => {
  try {
    setTimeout(() => {
      log[ test ].call(null, `${test} lost context`);
    }, wait);
  } catch (e) {
  }
  wait += increment;
});
