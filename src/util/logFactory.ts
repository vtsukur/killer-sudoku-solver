import * as chalk from 'chalk';
import * as config from 'config';
import { createLogger, format, transports } from 'winston';

const logLevel: string = config.get('logLevel')
const isDebugGlobal: boolean = logLevel === 'debug';

class Log {
    #label;
    #logger;

    constructor(label: string) {
        this.#label = label;
        this.#logger = createLogger({
            level: logLevel,
            transports: [
                new transports.Stream({
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
            )
        });
    }

    info(msg: string) {
        this.#logger.info(msg);
    }

    debug(msg: string) {
        this.#logger.log('debug', msg);
    }

    get isDebug() {
        return isDebugGlobal;
    }
}

class LogFactory {
    of(label: string) {
        return new Log(label);
    }
}

export const logFactory = new LogFactory();
