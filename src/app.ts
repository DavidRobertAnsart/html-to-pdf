import fs from 'fs';
import path from 'path';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { logger } from './lib/logger';
import { normalizePort, onError } from './lib/server';
import { handleErrors } from './middlewares/handleErrors';
import { removeTrailingSlash } from './middlewares/removeTrailingSlash';
import { generatePdfHandler } from './pdf/generate-pdf-handler';

const isProd = process.env.NODE_ENV === 'production';
const logStream = isProd
    ? fs.createWriteStream(path.join(__dirname, '..', 'access.log'), {
          flags: 'a',
      })
    : undefined;

// --- Init express ---
const app = express();

// --- Add middlewares ---
app.use(helmet());
app.use(cors());
app.use(removeTrailingSlash);
app.use(
    morgan(isProd ? 'combined' : 'dev', {
        skip: (req) => req.path === '/',
        stream: logStream,
    }),
);
app.use(bodyParser.json());

// --- Add routes ---
app.get('/', function (_req, res) {
    res.send('Server running!');
});
app.post('/pdf', handleErrors(generatePdfHandler));
app.use(`/static/pdf`, express.static(path.join(__dirname, './static/pdf')));
app.use((_, res) => {
    res.status(404).send('Error 404 - Not found.');
});

// -- Start server --
const port = process.env.PORT || 3000;
const normalizedPort = normalizePort(port);
if (normalizedPort === false) {
    logger.error(`Exiting. Invalid port to use: %s`, port);
} else {
    const server = app.listen(normalizedPort);
    server.on('error', onError);
    server.on('listening', () => {
        logger.info(`App listening on port ${normalizedPort}!`);
    });
}
