//create express app
const express = require("express");

const app = express();

//config environment
require("dotenv").config();

//connect mongodb
require("./config/db")();

app.listen(process.env.PORT || 3000, () => {
  console.log(`app running success`);
});
