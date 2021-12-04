import type { JSONSchemaType } from 'ajv';
import type { Request, Response } from 'express';

import { ajv, sendInvalidDataError } from '../lib/json-schema-validator';
import type { generatePdfArgs } from './generate-pdf';
import { generatePdf } from './generate-pdf';

const PDF_HANDLER_SCHEMA: JSONSchemaType<generatePdfArgs> = {
    type: 'object',
    properties: {
        filename: {
            type: 'string',
        },
        content: {
            type: 'object',
            properties: { url: { type: 'string', format: 'uri' } },
            required: ['url'],
            additionalProperties: false,
        },
        format: {
            type: 'string',
            enum: [
                'letter',
                'legal',
                'tabloid',
                'ledger',
                'a0',
                'a1',
                'a2',
                'a3',
                'a4',
                'a5',
                'a6',
            ],
            nullable: true,
        },
        margin: {
            type: 'object',
            properties: {
                top: { type: ['string', 'number'], nullable: true },
                bottom: { type: ['string', 'number'], nullable: true },
                left: { type: ['string', 'number'], nullable: true },
                right: { type: ['string', 'number'], nullable: true },
            },
            additionalProperties: false,
            nullable: true,
        },
        landscape: {
            type: 'boolean',
            nullable: true,
        },
        omitBackground: {
            type: 'boolean',
            nullable: true,
        },
    },
    required: ['content', 'filename'],
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
        return;
    }
    const url = await generatePdf(data);
    res.send({
        url,
    });
};
