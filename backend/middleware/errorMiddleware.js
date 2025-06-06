const notFound = (req, res, next) => {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Ensure statusCode is a number
  let message = err.message;

  // If Mongoose not found error, set to 404 and change message
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Ensure statusCode is a valid HTTP status code number
  if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
    statusCode = 500; // Default to 500 if statusCode is invalid
  }

  res.status(statusCode).json({
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

export { notFound, errorHandler };
