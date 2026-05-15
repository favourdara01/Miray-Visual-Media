export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: "Something went wrong. Please try again later.",
  });
};