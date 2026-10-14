export default class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}