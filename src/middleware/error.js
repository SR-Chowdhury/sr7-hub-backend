import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const notFound = (req, _res, next) =>
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.code === 11000) {
    status = 409;
    message = `Duplicate value for: ${Object.keys(err.keyValue).join(', ')}`;
  }
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    error: { message, ...(err.details && { details: err.details }) },
    ...(env.NODE_ENV === 'development' && status >= 500 && { stack: err.stack }),
  });
};