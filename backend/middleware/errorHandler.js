const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Postgres/Supabase error codes worth mapping to friendlier responses
  if (err.code === "23505") {
    // unique_violation
    statusCode = 400;
    message = "That record already exists.";
  }
  if (err.code === "23502") {
    // not_null_violation
    statusCode = 400;
    message = "A required field is missing.";
  }
  if (err.code === "22P02") {
    // invalid_text_representation (e.g. bad id passed where a number is expected)
    statusCode = 404;
    message = "Resource not found";
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
