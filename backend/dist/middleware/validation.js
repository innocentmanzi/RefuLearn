"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        const extractedErrors = errors.array().map((err) => ({
            field: err.type === 'field' ? err.path : err.type,
            message: err.msg,
            value: err.value
        }));
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: extractedErrors
        });
    };
};
exports.validate = validate;
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map((err) => ({
            field: err.type === 'field' ? err.path : err.type,
            message: err.msg,
            value: err.value
        }));
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: extractedErrors
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
//# sourceMappingURL=validation.js.map