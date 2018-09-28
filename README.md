# Log Happy

Log Happy is a basic logger with event subscriptions, namespaces, and log levels.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Support](#support)
- [Dependencies](#dependencies)
- [Contributing](#contributing)

## Installation

```npm i log-happy```

## Usage

Requiring the library will be enough to get started:
```javascript
require('log-happy');
```

Log happy automatically adds the `Logger` constructor to the global namespace.

#### Static Logger

The global `Logger` instance can be used to do logging without a namespace. 

**Caveats:**
- There are no log level restrictions. All of the logger functions fire regardless of the
log level set. 
- The static log functions do not fire logging subscription events.

Static functions are `debug`, `info`, `success`, `warn`, and `error`.

```javascript
// debug example
Logger.debug( 'This is static logging.', {key1: 1, key2: 2} );
> [18:29:48] ☼ This is static logging. { key1: 1, key2: 2 }
```

#### Namespace Logger

##### Initiating A Namespace Logger
You can create a logger by instantiating a new `Logger` constructor. 
The syntax for the logger constructor is `Logger(namespace<String>[, logLevel:<Number|String>])`

```javascript
// New logger with default log level (error only)
const errorOnlyLogger = new Logger('namespace 1');

// New logger with most verbose log level (debug)
const verboseLogger = new Logger('namespace 2', 'debug');
```

##### Log Levels
The log levels can be set with a numeric value or a string value. Valid values are:
- `debug` or `5` - Use to add console debugging that should you don't want in production.
- `info` or `4` - Best for more important messages than debug.
- `success` or `3` - Slightly more important than `info`, good for when you need to see successes without debugging on.
- `warn` or `2` - Only slightly less important than `error`, use to display important non-error information like 
deprecation alerts.
- `error` or `1` - Logs out errors. Seen as most important logging. Recommended to stay on for production environments.
- `disable` or `0` - Keeps logging completely quiet. No logging is performed.

##### Logging
Log Happy usage is essentially identical to using `console`. 
However, it doesn't have certain utility features like `.time()`/`.timeEnd()`.

(See [Benchmarks](#Benchmarks) for benchmarking methods.) 

All of the logging methods accept an unlimited number of arguments. `Array` and `Object` parameters are inspected to 
strings (up to 6 layers deep). Syntax:
```javascript
loggerInstance( param1 [, param2 ] [, paramN ] );
```

```javascript
// Instantiate a new logger with the namespace "Test Module".
const log = new Logger('Test Module', 'debug');

// debug
log.debug( 'This object has a couple keys:', {key1: 1, key2: 2} );
> [18:29:48] ☼ Test Module: This object has a couple keys: { key1: 1, key2: 2 }

// info
log.info( 'This object has a couple keys:', {key1: 1, key2: 2} );
> [18:29:48] ℹ Test Module: This object has a couple keys: { key1: 1, key2: 2 }

// success
log.success( 'This object has a couple keys:', {key1: 1, key2: 2} );
> [18:29:48] ✔ Test Module: This object has a couple keys: { key1: 1, key2: 2 }

// warn
log.warn( 'This object has a couple keys:', {key1: 1, key2: 2} );
> [18:29:48] ⚠ Test Module: This object has a couple keys: { key1: 1, key2: 2 }

// error
log.error( 'This object has a couple keys:', {key1: 1, key2: 2} );
> [18:29:48] ✖ Test Module: This object has a couple keys: { key1: 1, key2: 2 }
``` 

![console colors](https://i.imgur.com/AuZsDIQ.png)

##### Benchmarks
Benchmarking is made possible through the `.bench()` method available in both Logger instances and the
global Logger class (static method). 

`.bench()` has 2 parameters:
- `namespace` {String} - The identifier for your benchmark.
- `end` {Boolean} \[optional] - Tells the benchmark to end.

Benchmarks track the original time of creating the benchmark/namespace combination up to the point 
that the benchmark method is called with `end` equaling `true`. This means that you can continue to
call the benchmark method on the same namespace to get the incremental benchmark time.

**Note:** The `.bench()` method ignores debug levels. 

Calling the `.bench()` method on the Logger instance or Logger class will return the milliseconds passed
in decimal form. For example, if 100025 microseconds have passed, the method will return 1000.25.

If the benchmark method is called from a Logger instance, the results are automatically output to the console. 

```javascript
const log = new Logger('Application Bootstrap', 'debug');

const varStart = log.bench('Start-up');
> [18:04:37] ◷ Application Bootstrap: Benchmark - Start-up: 0ms
// varStart -> 0

// ... do some start up stuff...

const varTick = log.bench('Start-up');
> [18:04:38] ◷ Application Bootstrap: Benchmark - Start-up: 1006.081488ms
// varTick -> 1006.081488

// ... do more start up stuff...

const varEnd = log.bench('Start-up', true); // Use 'true' to end the benchmark
> [18:04:38] ◷ Application Bootstrap: Benchmark - Start-up: 1508.363578ms
// varEnd -> 1508.363578
```

When using the Logger static `.bench()` method, the debugger does not automatically output to console.

```javascript
const varStart = Logger.bench('Start-up');
// varStart -> 0

// ... do some start up stuff...

const varTick = Logger.bench('Start-up');
// varTick -> 1006.081488

// ... do more start up stuff...

const varEnd = Logger.bench('Start-up', true); // Use 'true' to end the benchmark
// varEnd -> 1508.363578
```


##### Subscriptions
A feature of the Log Happy is subscriptions. You can subscribe to specific log events for a individual namespaces, and/or
you can subscribe to all of the namespaces at once. One use case for this would be to output the logging to a file, database, 
or to a logging service like Rollbar.

To subscribe to an individual namespace, the `events` property is exposed. This is a standard `EventListener` class.
```javascript
const fs = require('fs');
const log = new Logger('System Events', 'warn');
log.events.on('Warn', () => {
  fs.writeFileSync('path/to/log.txt', JSON.stringify(arguments) + '\n', {flag: 'a'});
});

log.events.on('Error', () => {
  fs.writeFileSync('path/to/log.txt', JSON.stringify(arguments) + '\n', {flag: 'a'});
});
```

To subscribe to an global Logger events, the `allEvents` property is exposed on the initial `Logger` constructor. 
This is a standard `EventListener` class.

Events from any namespace logger will also be emitted on the `allEvents` event listener.
```javascript
const fs = require('fs');
const allEvents = Logger.allEvents;
allEvents.on('Warn', () => {
  fs.writeFileSync('path/to/log.txt', JSON.stringify(arguments) + '\n', {flag: 'a'});
});

allEvents.on('Error', () => {
  fs.writeFileSync('path/to/log.txt', JSON.stringify(arguments) + '\n', {flag: 'a'});
});
```

**Note:** Event types are upper-cased. (i.e. `warn` events are `Warn`, `info` events are `Info`)

When the `.bench()` method is called on a Logger instance, the `Bench` event is emitted on both the
`Logger.allEvents` and the instance `.events` event listeners.

However, there is a specific signature returned to the event listeners:
```javascript
const log = new Logger('Benchmark Events', 'debug');

log.events.on('Bench', (namespace, time, type) => {
  log.debug(`${namespace}, ${time}, ${type}`);
});

log.bench('Bench Events');
> [18:04:37] ☼ Benchmark Events: Bench Events, 0, start  

log.bench('Bench Events');
> [18:04:37] ☼ Benchmark Events: Bench Events, 1.1002, tick

log.bench('Bench Events', true);
> [18:04:37] ☼ Benchmark Events: Bench Events, 2.421, end  
```

##### Tests

Run `npm test` to run tests.

## Reporting Issues
Please [open an issue](https://github.com/crash83k/log-happy/issues/new) for support.

## Dependencies
Log Happy relies on the following projects:
- [fancy-log](https://github.com/js-cli/fancy-log)
- [chalk](https://github.com/chalk/chalk)
- [log-symbols](https://github.com/sindresorhus/log-symbols)

Testing dependencies:
- Mocha
- Chai

## Contributing

Please contribute using [Github Flow](https://guides.github.com/introduction/flow/). Create a branch, add commits, and [open a pull request](https://github.com/fraction/readme-boilerplate/compare/).
