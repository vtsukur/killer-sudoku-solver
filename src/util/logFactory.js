import winston from 'winston';

class Log {
    #namespace;
    #logger;

    constructor(namespace) {
        this.#namespace = namespace;
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
        this.#logger.info(`[${this.#namespace}] ${msg}`);
    }
}

class LogFactory {
    of(namespace) {
        return new Log(namespace);
    }
}

export const logFactory = new LogFactory();
