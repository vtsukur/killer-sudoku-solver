import chalk from 'chalk';
import winston from 'winston';

const format = winston.format;

class Log {
    #label;
    #logger;

    constructor(label) {
        this.#label = label;
        this.#logger = winston.createLogger({
            level: 'info',
            transports: [
                new winston.transports.Stream({
                    stream: process.stderr
                })
            ],
            format: format.combine(
                format.label({ label: this.#label }),
                format.printf((info) => {
                    return `${chalk.yellow(info.level.toUpperCase())} [${info.label}]: ${info.message}`;
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
