import * as path from 'path';

import fs from 'fs-extra';
import type { PDFOptions } from 'puppeteer';
import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';

import { logger } from '../lib/logger';
import { AppError } from '../middlewares/handleErrors';

export type generatePdfArgs = {
    filename: string;
    content: {
        url: string;
    };
    format: PDFOptions['format'];
    margin: PDFOptions['margin'];
    landscape: PDFOptions['landscape'];
    omitBackground: PDFOptions['omitBackground'];
};

export async function generatePdf({
    filename,
    content,
    format = 'a4',
    margin,
    landscape,
    omitBackground,
}: generatePdfArgs) {
    if (!content.url) {
        // should not happen
        throw new AppError('unknown', '');
    }

    const id = uuidv4();
    const directory = path.join(__dirname, '..', 'static/pdf', id);
    await fs.mkdirs(directory);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(content.url);
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 });
    const pdfBuffer = await page.pdf({
        format,
        margin,
        landscape,
        omitBackground,
        printBackground: true,
    });
    await fs.writeFile(path.join(directory, `${filename}.pdf`), pdfBuffer);
    await browser.close();

    logger.info(`File ${filename}.pdf successfully generated!`);

    // Set timeout of 10 minutes to delete pdf
    setTimeout(() => {
        fs.unlinkSync(path.join(directory, `${filename}.pdf`));
        fs.rmdir(directory);
    }, 10 * 60 * 1000); // Minutes * Seconds * Milliseconds

    // Return url
    return `${id}/${filename}.pdf`;
}
