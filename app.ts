import express from "express";
import bodyParser from "body-parser";
import { router as register } from "./api/register";
import { router as login } from "./api/login";
import { router as profile } from "./api/profile";
import { router as user } from "./api/user";

export const app = express();

const cors = require('cors');
app.use(cors());
app.use(bodyParser.text());
app.use(bodyParser.json());

// Register your routes first
app.use("/login", login);
app.use("/register", register);
app.use("/profile", profile);
app.use("/user", user);



// The root route should be the last
app.use("/", (req, res) => {
  res.send("Hello World!");
});