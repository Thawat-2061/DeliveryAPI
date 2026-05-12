import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mysql from "mysql";
import { conn } from "../dbconn";
import { UploadPostRequest } from "../model/UploadModel";

export const router = express.Router();

const makeDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
makeDir("uploads/images");
makeDir("uploads/order");
makeDir("uploads/statusOrder");

const makeStorage = (folder: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, `uploads/${folder}`),
    filename: (_req, file, cb) => {
      const unique = Math.round(Math.random() * 100000);
      cb(null, unique + path.extname(file.originalname || ".png"));
    },
  });

const uploaders = {
  images: multer({ storage: makeStorage("images"), limits: { fileSize: 67108864 } }),
  order: multer({ storage: makeStorage("order"),  limits: { fileSize: 67108864 } }),
  statusOrder: multer({ storage: makeStorage("statusOrder"), limits: { fileSize: 67108864 } }),
};


// POST /upload/
router.post("/", uploaders.images.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const url = `uploads/images/${req.file.filename}`;
  res.status(200).json({ filename: req.file.filename, url });
});

// POST /upload/order
router.post("/order", uploaders.order.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const url = `uploads/order/${req.file.filename}`;
  res.status(200).json({ filename: req.file.filename, url });
});

// POST /upload/upstatus
router.post("/upstatus", uploaders.statusOrder.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const url = `uploads/statusOrder/${req.file.filename}`;
  res.status(200).json({ filename: req.file.filename, url });
});


router.post("/update", async (req, res) => {
  let add: UploadPostRequest = req.body;
  let sql = mysql.format(
    "UPDATE `users` SET `Image` = ? WHERE `UserID` = ?",
    [add.Image, add.UserID]
  );
  conn.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update data" });
    res.status(200).json({ affected_rows: result.affectedRows });
  });
});

router.post("/updateRider", async (req, res) => {
  const { RiderID, Image } = req.body;
  let sql = mysql.format(
    "UPDATE `riders` SET `Image` = ? WHERE `RiderID` = ?",
    [Image, RiderID]
  );
  conn.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update data" });
    res.status(200).json({ affected_rows: result.affectedRows });
  });
});

router.post("/imageUP", async (req, res) => {
  const { OrderID, Image, Status } = req.body;
  let sql = mysql.format(
    "UPDATE `deliveryorders` SET `Image` = ?, `Status` = ? WHERE `OrderID` = ?",
    [Image, Status, OrderID]
  );
  conn.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update data" });
    res.status(200).json({ affected_rows: result.affectedRows });
  });
});