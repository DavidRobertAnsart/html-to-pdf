import { format, createLogger, transports } from 'winston';

export const logger = createLogger({
    level: 'info',
    exitOnError: false,
    format:
        process.env.NODE_ENV === 'production'
            ? format.combine(
                  format.splat(),
                  format.timestamp(),
                  format.printf(
                      ({ level, message, timestamp }) =>
                          `[${timestamp} ${level}]: ${message}`,
                  ),
              )
            : format.combine(
                  format.splat(),
                  format.colorize(),
                  format.simple(),
              ),
    transports:
        process.env.NODE_ENV === 'production'
            ? [
                  // In production, write all logs with level `error` and `warning` to `error.log`
                  new transports.File({
                      filename: 'error.log',
                      level: 'warn',
                  }),
              ]
            : [
                  // In development, log to the `console`.
                  new transports.Console(),
              ],
});
