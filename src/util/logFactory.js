import chalk from 'chalk';
import winston from 'winston';

import { parseArgs } from 'node:util';

const format = winston.format;

const { values: { logLevel } } = parseArgs({
    options: {
        logLevel: {
            type: 'string',
            default: 'info'
        }
    },
    allowPositionals: true
});

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
}

class LogFactory {
    of(label) {
        return new Log(label);
    }
}

export const logFactory = new LogFactory();
