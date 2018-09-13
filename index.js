'use strict';
const chalk = require('chalk');
const log = require('fancy-log');
const symbols = require('log-symbols');
const util = require('util');
const Event = require('events');

class Events extends Event {
}

// Consolidated location for all loggers neutral of namespace.
const allLoggers = new Events();

const logLevel = process.env.LOG_LEVEL || 1;

class Logger {

  constructor(namespace) {
    this.namespace = namespace;
    this.events = new Events();
    // return this;
    return {
      debug : this.debug.bind(this),
      info : this.info.bind(this),
      success : this.success.bind(this),
      warn : this.warn.bind(this),
      error : this.error.bind(this),
      events : this.events,
    };
  }

  debug() {
    if (logLevel >= 5) {
      log(
        chalk.cyan('☼'),
        chalk.underline(this.namespace + ':'),
        chalk.cyan(...stringArgs(arguments))
      );
      this.events.emit('Debug', arguments);
      allLoggers.emit('Debug', arguments);
    }
  }

  info() {
    if (logLevel >= 4) {
      log(
        symbols.info,
        chalk.underline(this.namespace + ':'),
        chalk.blue(...stringArgs(arguments))
      );
      this.events.emit('Info', arguments);
      allLoggers.emit('Info', arguments);
    }
  }

  success() {
    if (logLevel >= 3) {
      log(
        symbols.success,
        chalk.underline(this.namespace + ':'),
        chalk.green(...stringArgs(arguments))
      );
      this.events.emit('Success', arguments);
      allLoggers.emit('Success', arguments);
    }
  }

  warn() {
    if (logLevel >= 2) {
      log(
        symbols.warning,
        chalk.underline(this.namespace + ':'),
        chalk.yellow(...stringArgs(arguments))
      );
      this.events.emit('Warn', arguments);
      allLoggers.emit('Warn', arguments);
    }
  }

  error() {
    if (logLevel >= 1) {
      log.error(
        symbols.error,
        chalk.underline(this.namespace + ':'),
        chalk.red(...stringArgs(arguments))
      );

      try {
        this.events.emit('Error', arguments);
        allLoggers.emit('Error', arguments);
      } catch (e) {
        console.error(e);
      }
    }
  }
}

/**
 * Returns all arguments as strings.
 * @param args
 * @returns {String[]}
 */
function stringArgs(args) {
  for (let i = 0; i < args.length; i ++) {
    if (typeof args[ i ] === 'object' && ! Array.isArray(args[ i ])) {
      args[ i ] = util.inspect(args[ i ], {
        depth : 6
      });
    }
  }
  return args;
}

exports.allEvents = allLoggers;
module.exports = Logger;
global.Logger = Logger;
