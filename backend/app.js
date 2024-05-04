const express = require("express");
const cookieParser = require("cookie-parser")
require("dotenv/config");

const userRouter = require("./routes/userRoutes");


const app = express();
const mongoose = require("mongoose");


const morgan = require("morgan");
const cors = require("cors");

app.use(cors());
app.options("*", cors);

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan("tiny"));
app.use(express.static("public"));

// routes
app.use("/api/v1/users", userRouter);

mongoose
  .connect(process.env.DATABASE, {
    dbName: "econoza",
  })
  .then(() => {
    console.log("Database Connection Established....");
  })
  .catch((error) => {
    console.log("Database connection has failed", error);
  });

  const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
