const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  const statusCode = err.statusCode || 500;
  
  // In production, never expose internal error details
  const message = process.env.NODE_ENV === 'production' 
    ? (err.statusCode === 500 ? 'Internal server error' : err.message)
    : (err.message || 'Internal server error');
  
  res.status(statusCode).json({
    ok: false,
    error: message
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { errorHandler, asyncHandler };
