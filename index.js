const dotenv = require('dotenv')
dotenv.config()
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGOID);
const path = require("path");
const session = require("express-session");
const nocache = require("nocache");

const express = require("express");
const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.use(
  session({ 
    secret: process.env.SESSIONSECRET,
    saveUninitialized: true,
    resave: false,
  })
);

app.use(nocache());

//for user routes

const userRouter = require("./router/userRouter");
app.use("/", userRouter);

//for admin routes

const adminRouter = require("./router/adminRouter");
app.use("/admin", adminRouter);

app.listen(process.env.PORTN0, () => {
  console.log("server running...");
});
