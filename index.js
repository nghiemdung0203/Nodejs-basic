const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRouter = require('./routers/userRouter')
const todoRouter = require('./routers/todoRouter')
const uploadRouter = require('./routers/uploadImageRouter')
require('dotenv').config()
const PORT = 8000;
const cors = require("cors");
const helmet = require('helmet');


app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(userRouter);
app.use(todoRouter);
app.use(uploadRouter)

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, async () => {
  console.log(`server up on port ${PORT}`);
});
