/**
 * AppError — Custom operational error class.
 *
 * Distinguishes between "operational" errors (expected, user-facing, e.g. 404,
 * validation failures) and programming errors (unexpected bugs).
 *
 * The global error handler uses `isOperational` to decide the response shape.
 */
class AppError extends Error {
  /**
   * @param {string} message  - Human-readable error message sent to client
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 404, 500)
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // status is 'fail' for 4xx errors, 'error' for 5xx
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Only operational errors are reported to the user
    this.isOperational = true;

    // Capture the stack trace, excluding the constructor itself from the trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
