import type { DefinedError, ValidateFunction } from 'ajv';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { AppError } from '../middlewares/handleErrors';

const ajv = new Ajv({ allowUnionTypes: true });
addFormats(ajv);

const sendInvalidDataError = (
    validateFunction: ValidateFunction<unknown>,
): void => {
    const errors = validateFunction.errors as DefinedError[];
    let errorMsg = 'Invalid data!';
    if (errors.length > 0) {
        errorMsg = errors[0].schemaPath + ' ' + errors[0].message || errorMsg;
    }
    throw new AppError('badRequest', errorMsg);
};

export { ajv, sendInvalidDataError };
