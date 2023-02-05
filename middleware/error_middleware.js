const sendErrorForDev = (err, res) => {
  return res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
    status: err.status,
  });
};

const sendErrorForProd = (err, res) => {
  return res.status(err.statusCode).json({
    message: err.message,
    status: err.status,
  });
};

const errorHandling = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    sendErrorForProd(err, res);
  }
};

module.exports = errorHandling;
