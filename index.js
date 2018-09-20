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

class Logger {
  /**
   * @returns {{debug: number, info: number, success: number, warn: number, error: number, disable: number}}
   */
  static get levels() {
    return {
      debug : 5,
      info : 4,
      success : 3,
      warn : 2,
      error : 1,
      disable : 0,
    }
  };

  static get colors() {
    return {
      debug : 'cyan',
      info : 'blue',
      success : 'green',
      warn : 'yellow',
      error : 'red',
    }
  }

  static debug() {
    log(...Logger._log('debug')(...arguments));
  }

  static info() {
    log(...Logger._log('info')(...arguments));
  }

  static success() {
    log(...Logger._log('success')(...arguments));
  }

  static warn() {
    log(...Logger._log('warn')(...arguments));
  }

  static error() {
    log.error(...Logger._log('error')(...arguments));
  }

  /**
   *
   * @param {String} namespace (Required)
   * @param {Number|String} [logLevel] Set the log level.
   * @returns {{debug: <Function>, info: <Function>,
   *          success: <Function>, warn: <Function>,
   *          error: <Function>, events: Events,
   *          level: <Function>}}
   */
  constructor(namespace, logLevel = 1) {
    if (typeof namespace !== 'string' || namespace.trim() === '')
      throw new Error('"Namespace" parameter cannot be empty.');

    this.namespace = namespace;
    this.events = new Events();
    this.logLevel = this.updateDebugLevel(logLevel);

    return {
      debug : this.debug.bind(this),
      info : this.info.bind(this),
      success : this.success.bind(this),
      warn : this.warn.bind(this),
      error : this.error.bind(this),
      events : this.events,
      level : this.updateDebugLevel.bind(this),
    };
  }

  /**
   * Updates the log level for the logger namespace.
   * @param {String|Number} level
   * @returns {Number}
   */
  updateDebugLevel(level) {
    if (typeof level !== 'undefined') {
      if (typeof level === 'string') {
        level = level.toLowerCase();
        let debugLevels = Logger.levels;
        if (! debugLevels.hasOwnProperty(level)) {
          throw new Error(`'${level}' is not a valid logging level.`);
        }
        this.logLevel = debugLevels[ level ];
      } else if (typeof level === 'number') {
        if (level < 0) level = 0;
        if (level > 5) level = 5;
        this.logLevel = level;
      } else {
        throw new Error('Parameter "level" must be a string or number.');
      }
    }
    return this.logLevel;
  }

  /**
   * @param {Number|String|Object|Array} [arguments]
   */
  debug() {
    if (this.logLevel >= 5) {
      log(...this._log('debug')(...arguments));
      this.events.emit('Debug', ...arguments);
      allLoggers.emit('Debug', ...arguments);
    }
  }

  /**
   * @param {Number|String|Object|Array} [arguments]
   */
  info() {
    if (this.logLevel >= 4) {
      log(...this._log('info')(...arguments));
      this.events.emit('Info', ...arguments);
      allLoggers.emit('Info', ...arguments);
    }
  }

  /**
   * @param {Number|String|Object|Array} [arguments]
   */
  success() {
    if (this.logLevel >= 3) {
      log(...this._log('success')(...arguments));
      this.events.emit('Success', ...arguments);
      allLoggers.emit('Success', ...arguments);
    }
  }

  /**
   * @param {Number|String|Object|Array} [arguments]
   */
  warn() {
    if (this.logLevel >= 2) {
      log(...this._log('warn')(...arguments));
      this.events.emit('Warn', ...arguments);
      allLoggers.emit('Warn', ...arguments);
    }
  }

  /**
   * @param {Number|String|Object|Array} [arguments]
   */
  error() {
    if (this.logLevel >= 1) {
      log.error(...this._log('error')(...arguments));
      this.events.emit('Error', ...arguments);
      allLoggers.emit('Error', ...arguments);
    }
  }

  /**
   * @param {String} type
   * @returns {Function} Bound function
   * @private
   */
  _log(type) {
    return (function () {
      const argArr = [
        chalk.underline(this.namespace + ':'),
        chalk[ Logger.colors[ type ] ](...stringArgs(arguments))
      ];

      if (type === 'debug') {
        argArr.unshift(chalk[ Logger.colors[ type ] ]('☼'));
      } else {
        argArr.unshift(symbols[ type === 'warn' ? 'warning' : type ]);
      }

      return argArr;
    }).bind(this)
  }

  /**
   * @param {String} type
   * @returns {Function} Unbound function
   * @private
   */
  static _log(type) {
    return (function () {
      const argArr = [ chalk[ Logger.colors[ type ] ](...stringArgs(arguments)) ];

      if (type === 'debug') {
        argArr.unshift(chalk[ Logger.colors[ type ] ]('☼'));
      } else {
        argArr.unshift(symbols[ type === 'warn' ? 'warning' : type ]);
      }

      return argArr;
    })
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

module.exports = Logger;
module.exports.allEvents = allLoggers;
global.Logger = Logger;
