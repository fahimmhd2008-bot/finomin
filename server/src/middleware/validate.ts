// server/src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'The submitted request payload failed validation constraints.',
          issues: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        });
        return;
      }
      res.status(400).json({ error: 'Malformed request payload' });
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Query Parameter Validation Error',
          issues: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        });
        return;
      }
      res.status(400).json({ error: 'Malformed query parameters' });
    }
  };
};
