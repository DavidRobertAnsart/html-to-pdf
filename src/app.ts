import express from 'express';

import { logger } from './lib/logger';
import { normalizePort, onError } from './lib/server';

const app = express();
app.get('/', function (_req, res) {
    res.send('Hello, World!');
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
