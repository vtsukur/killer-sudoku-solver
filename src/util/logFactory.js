import winston from 'winston';

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
            format: winston.format.combine(
                winston.format.label({ label: this.#label }),
                winston.format.printf((info) => {
                    return `${info.level.toUpperCase()} [${info.label}]: ${info.message}`;
                }),
                winston.format.colorize()
            )
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
