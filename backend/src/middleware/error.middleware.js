function errorHandler(error, _request, response, _next) {
  if (error.type === "entity.parse.failed") {
    return response.status(400).json({
      error: {
        message: "Request body must contain valid JSON"
      }
    });
  }

  if (error.type === "entity.too.large") {
    return response.status(413).json({
      error: {
        message: "Request body is too large"
      }
    });
  }

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
