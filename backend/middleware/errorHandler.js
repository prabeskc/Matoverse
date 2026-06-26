const AppError = require('../utils/AppError');

// ─── Specific Mongoose/JWT Error Handlers ────────────────────────────────────

/** Mongoose: Invalid ObjectId (e.g. /api/products/not-a-valid-id) */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: "${err.value}". Please provide a valid ID.`;
  return new AppError(message, 400);
};

/** Mongoose: Duplicate key (e.g. email already registered) */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `"${value}" is already in use for field "${field}". Please use a different value.`;
  return new AppError(message, 409);
};

/** Mongoose: Validation error (e.g. required field missing) */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Validation failed: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/** JWT: Token is invalid or tampered */
const handleJWTError = () =>
  new AppError('Invalid authentication token. Please log in again.', 401);

/** JWT: Token has expired */
const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401);

// ─── Response Formatters ─────────────────────────────────────────────────────

/** Development: send full error details for debugging */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

/** Production: only send safe, user-friendly messages */
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // Trusted error — safe to expose to client
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming/unknown error — don't leak details
    console.error('💥 UNHANDLED ERROR:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong on our end. Please try again later.',
    });
  }
};

// ─── Global Error Handling Middleware ────────────────────────────────────────

/**
 * Express global error handler.
 * Must be registered LAST in app.js (after all routes).
 * Express identifies it as an error handler because it has 4 parameters (err, req, res, next).
 */
const errorHandler = (err, req, res, next) => {
  // Set defaults if not already set by AppError
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    // Clone error to avoid mutating the original
    let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
    error.message = err.message;

    // Transform known error types into user-friendly AppErrors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
