"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFound = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    logger_1.logger.error(`Error: ${err.message}`, {
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    if (err.name === 'CastError' || err.name === 'not_found') {
        const message = 'Resource not found';
        error = { ...error, message, statusCode: 404 };
    }
    if (err.name === 'conflict' || (err.name === 'MongoError' && err.code === 11000)) {
        const message = 'Duplicate field value entered';
        error = { ...error, message, statusCode: 400 };
    }
    if (err.name === 'ValidationError' || err.name === 'doc_validation') {
        const message = err.message || 'Validation error';
        error = { ...error, message, statusCode: 400 };
    }
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = { ...error, message, statusCode: 401 };
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = { ...error, message, statusCode: 401 };
    }
    if (err.name === 'MulterError') {
        let message = 'File upload error';
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File too large';
        }
        else if (err.code === 'LIMIT_FILE_COUNT') {
            message = 'Too many files';
        }
        else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected file field';
        }
        error = { ...error, message, statusCode: 400 };
    }
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Server Error';
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};
exports.notFound = notFound;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map