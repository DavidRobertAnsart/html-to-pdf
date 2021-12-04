import type { Request, Response } from 'express';

import { ajv, sendInvalidDataError } from '../lib/json-schema-validator';

const PDF_HANDLER_SCHEMA = {
    type: 'object',
    properties: {
        content: {
            type: 'object',
            properties: { url: { type: 'string', format: 'uri' } },
            required: ['url'],
            additionalProperties: false,
        },
    },
    required: ['content'],
    additionalProperties: false,
};
const pdfHandlerValidate = ajv.compile(PDF_HANDLER_SCHEMA);

export const generatePdfHandler = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const data = req.body;
    if (!pdfHandlerValidate(data)) {
        sendInvalidDataError(pdfHandlerValidate);
    }
    res.send('');
};
