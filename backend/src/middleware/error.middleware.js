function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode ?? 500;

  if (statusCode === 500) {
    console.error(error);
  }

  return response.status(statusCode).json({
    error: {
      message: statusCode === 500 ? "Internal server error" : error.message
    }
  });
}

module.exports = { errorHandler };
