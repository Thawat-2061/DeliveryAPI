import express from "express";
import bodyParser from "body-parser";
import { router as register } from "./api/register";
import { router as login } from "./api/login";
import { router as profile } from "./api/profile";
import { router as user } from "./api/user";
import { router as upload } from "./api/upload";
import { router as order } from "./api/order";
import { router as rider } from "./api/rider";
import { router as status } from "./api/status";





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
app.use("/upload", upload);
app.use("/order", order);
app.use("/rider", rider);
app.use("/status", status);






// The root route should be the last
app.use("/", (req, res) => {
  res.send("Hello World!");
});