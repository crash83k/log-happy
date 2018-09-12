import chalk from 'chalk';
import log from 'fancy-log';
import symbols from 'log-symbols';
import util from 'util';
import Event from 'events';

class Events extends Event {}

// Consolidated location for all events regardless of namespace.
export const allEvents = new Events();

class Logger {
  constructor(namespace) {
    this.namespace = () => `${namespace}`;
    this.logLevel = process.env.LOG_LEVEL || 1;
    this.event = new Events();
    return this;
  }

  debug() {
    if (this.logLevel >= 5) {
      log(
        chalk.cyan('☼'),
        chalk.underline(this.namespace() + ':'),
        chalk.cyan(...stringArgs(arguments))
      );
      this.event.emit('debug', arguments);
      allEvents.emit('debug', arguments);
    }
  }

  info() {
    if (this.logLevel >= 4) {
      log(
        symbols.info,
        chalk.underline(this.namespace() + ':'),
        chalk.blue(...stringArgs(arguments))
      );
      this.event.emit('info', arguments);
      allEvents.emit('info', arguments);
    }
  }

  success() {
    if (this.logLevel >= 3) {
      log(
        symbols.success,
        chalk.underline(this.namespace() + ':'),
        chalk.green(...stringArgs(arguments))
      );
      this.event.emit('success', arguments);
      allEvents.emit('success', arguments);
    }
  }

  warn() {
    if (this.logLevel >= 2) {
      log(
        symbols.warning,
        chalk.underline(this.namespace() + ':'),
        chalk.yellow(...stringArgs(arguments))
      );
      this.event.emit('warn', arguments);
      allEvents.emit('warn', arguments);
    }
  }

  error() {
    if (this.logLevel >= 1) {
      log.error(
        symbols.error,
        chalk.underline(this.namespace() + ':'),
        chalk.red(...stringArgs(arguments))
      );
      this.event.emit('error', arguments);
      allEvents.emit('error', arguments);
    }
  }
}

/**
 * Returns all arguments as strings.
 * @param args
 * @returns {String[]}
 */
function stringArgs(args) {
  for (let i = 0; i < args.length; i++) {
    if (typeof args[i] === 'object' && !Array.isArray(args[i])) {
      args[i] = util.inspect(args[i], {
        depth: 6
      });
    }
  }
  return args;
}

global.Logger = Logger;
