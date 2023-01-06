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
                winston.format.simple(),
                winston.format.colorize()
            )
        });
    }

    info(msg) {
        this.#logger.info(`[${this.#label}] ${msg}`);
    }
}

class LogFactory {
    of(label) {
        return new Log(label);
    }
}

export const logFactory = new LogFactory();
