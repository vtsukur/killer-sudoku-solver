import chalk from 'chalk';
import winston from 'winston';
import config from 'config';

const logLevel = config.get('logLevel')
const isDebugGlobal = logLevel === 'debug';

const format = winston.format;

class Log {
    #label;
    #logger;

    constructor(label) {
        this.#label = label;
        this.#logger = winston.createLogger({
            level: logLevel,
            transports: [
                new winston.transports.Stream({
                    stream: process.stderr
                })
            ],
            format: format.combine(
                format.label({ label: this.#label }),
                format.printf((info) => {
                    const level = chalk.white.bgBlue(`[${info.level.toUpperCase()}]`);
                    const label = chalk.black.bgYellowBright.bold(`[${info.label}]`);
                    return `${level} ${label} ${info.message}`;
                })
            ),
            colorize: true
        });
    }

    info(msg) {
        this.#logger.info(msg);
    }

    debug(msg) {
        this.#logger.log('debug', msg);
    }

    get isDebug() {
        return isDebugGlobal;
    }
}

class LogFactory {
    of(label) {
        return new Log(label);
    }
}

export const logFactory = new LogFactory();
