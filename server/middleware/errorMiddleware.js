// import ApiError from '../utils/ApiError.js';

// const notFound = (req, res, next) => {
//   next(new ApiError(404, `Route not found: ${req.originalUrl}`));
// };

// const errorHandler = (err, req, res, next) => {
//   const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
//   const message = statusCode === 500 && process.env.NODE_ENV === 'production'
//     ? 'Internal Server Error'
//     : err.message || 'Internal Server Error';

//   res.status(statusCode).json({
//     success: false,
//     message
//   });
// };

// export { notFound, errorHandler };


import ApiError from '../utils/ApiError.js';

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {

  // 👇 Print complete error in terminal
  console.error("================================");
  console.error("ERROR:", err);
  console.error("MESSAGE:", err.message);
  console.error("STACK:", err.stack);
  console.error("================================");
  
  import('fs').then(fs => {
    fs.appendFileSync('error_log.txt', `ERROR: ${err.message}\nSTACK: ${err.stack}\n\n`);
  });

  const statusCode =
    err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

export { notFound, errorHandler };