//create express app
const express = require("express");

const app = express();
const path = require("path");
//config environment
require("dotenv").config();

//connect mongodb
require("./config/db")();

app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

//requires
const globalErrorHandling = require("./middleware/error_middleware");
const ApiError = require("./utils/ApiError");
const auth = require("./routes/authServices");
const userServices = require("./routes/userServices");
const categoryRoutes = require("./routes/categoryRoutes");

//mounting routes
app.use("/api/v1/auth", auth);
app.use("/api/v1/user", userServices);
app.use("/api/v1/categories", categoryRoutes);

//Error handler to catch router does not exist from upove
app.all("*", (req, res, next) =>
  //Create an error and send it to error handling middleware
  next(new ApiError(`Can't find this route : ${req.originalUrl}`, 400))
);

//global error handling for express
app.use(globalErrorHandling);

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`app running success`);
});

//handling exception out express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log("server closed ...");
    process.exit(1);
  });
});
