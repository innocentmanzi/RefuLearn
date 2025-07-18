import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map((validation: ValidationChain) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err: any) => ({
      field: err.path || err.param || 'unknown',
      message: err.msg,
      type: err.type
    }));

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors
    });
  };
};

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err: any) => ({
      field: err.path || err.param || 'unknown',
      message: err.msg,
      type: err.type
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors
    });
  }
  next();
}; 