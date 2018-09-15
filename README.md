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
Log happy automatically adds the `Logger` constructor to the global namespace.

Requiring the library will be enough to get started:
```javascript
require('log-happy');
```

##### Initiating A Logger
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
Log Happy usage is essentially identical to using `console`. However, it doesn't have certain utility features like `.time()`/`.timeEnd()`. 

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

![Image of console colors](https://imgur.com/AuZsDIQ)

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
const allEvents = Logger.allevents;
allEvents.on('Warn', () => {
  fs.writeFileSync('path/to/log.txt', JSON.stringify(arguments) + '\n', {flag: 'a'});
});

allEvents.on('Error', () => {
  fs.writeFileSync('path/to/log.txt', JSON.stringify(arguments) + '\n', {flag: 'a'});
});
```

**Note:** Event types are upper-cased. (i.e. `warn` events are `Warn`, `info` events are `Info`)

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
