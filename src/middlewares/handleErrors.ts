import type { RequestHandler, NextFunction, Request, Response } from 'express';

import { logger } from '../lib/logger';

const ERRORS = {
    badRequest: { code: 400, msg: 'Bad request' },
    forbidden: { code: 403, msg: 'Access forbidden' },
    unknown: { code: 500, msg: 'An unknown error happened' },
};
export type APP_ERRORS = keyof typeof ERRORS;

export class AppError extends Error {
    public errorName: APP_ERRORS;

    constructor(errorName: APP_ERRORS, message = '') {
        super(message);
        this.errorName = errorName;
    }
}

export function handleErrors(fn: RequestHandler): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        const sendError = (err: Error | AppError): void => {
            if (!(err instanceof AppError)) {
                logger.error(err.message);
                logger.error(JSON.stringify(err.stack));
                res.setHeader('Content-Type', 'application/json');
                res.status(ERRORS.unknown.code).send(`${ERRORS.unknown.msg}.`);
                return;
            }
            const errorMsg = err.message;
            const appError = ERRORS[err.errorName];
            res.setHeader('Content-Type', 'application/json');
            res.status(appError.code).send(
                `${appError.msg}${errorMsg ? ` - ${errorMsg}` : ''}.`,
            );
        };

        try {
            Promise.resolve(fn(req, res, next)).catch(sendError);
        } catch (err) {
            sendError(err as Error);
        }
    };
}
