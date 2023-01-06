import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console()
    ],
});

class Log {
    info(msg) {
        logger.info(msg);
    }
}

export const log = new Log();
