import express from "express";
import multer from "multer";
import { Request, Response } from "express"; // Import Express types
import mysql from "mysql";
import bcrypt from 'bcryptjs';

// Firebase
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

// MySQL
import { conn } from "../dbconn"; // Import connection from your dbconn
import { UploadPostRequest } from "../model/UploadModel";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC0VTfNMh9G9KbOj7QAosHKSqtRbDDj1mg",
  authDomain: "delivery-67f06.firebaseapp.com",
  projectId: "delivery-67f06",
  storageBucket: "delivery-67f06.appspot.com",
  messagingSenderId: "20496632069",
  appId: "1:20496632069:android:6984f9bda2f114f5d1cf6c",
};



export const router = express.Router();


initializeApp(firebaseConfig);
const storage = getStorage();


class FileMiddleware {
    filename = "";
    public readonly diskLoader = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 67108864 
        }
    });
}
const fileupload = new FileMiddleware();


//add
router.post("/", fileupload.diskLoader.single("file"), async (req, res) => {
    const filename = Math.round(Math.random() * 100000) + '.png';
    const storageRef = ref(storage, "/images/" + filename);
    const metadata = { contentType: req.file!.mimetype };
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
    const url = await getDownloadURL(snapshot.ref);
    res.status(200).json({
        filename: filename,
        url :url
    });
});

router.post("/order", fileupload.diskLoader.single("file"), async (req, res) => {
  const filename = Math.round(Math.random() * 100000) + '.png';
  const storageRef = ref(storage, "/order/" + filename);
  const metadata = { contentType: req.file!.mimetype };
  const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
  const url = await getDownloadURL(snapshot.ref);
  res.status(200).json({
      filename: filename,
      url :url
  });
});

router.post("/upstatus", fileupload.diskLoader.single("file"), async (req, res) => {
  const filename = Math.round(Math.random() * 100000) + '.png';
  const storageRef = ref(storage, "/statusOrder/" + filename);
  const metadata = { contentType: req.file!.mimetype };
  const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
  const url = await getDownloadURL(snapshot.ref);
  res.status(200).json({
      filename: filename,
      url :url
  });
});


//-------------------------------------------------------------------------------------------------


const saltRounds = 10;

router.post("/update", async (req, res) => {
    // รับข้อมูลจาก body
    let add: UploadPostRequest = req.body;
  
    // SQL คำสั่งอัปเดตข้อมูล
    let sql = "UPDATE `users` SET `Image` = ? WHERE `UserID` = ?";
    sql = mysql.format(sql, [add.Image, add.UserID]);
  
    // เรียกใช้คำสั่ง SQL
    conn.query(sql, (err, result) => {
      if (err) {
        console.error("Error updating data:", err);
        return res.status(500).json({ error: "Failed to update data" });
      }
      // ส่งผลลัพธ์กลับไปยังผู้ใช้
      res.status(200).json({ affected_rows: result.affectedRows });
    });
  });
  router.post("/updateRider", async (req, res) => {
    // รับข้อมูลจาก body
    const { RiderID, Image } = req.body;
   
  
    // SQL คำสั่งอัปเดตข้อมูล
    let sql = "UPDATE `riders` SET `Image` = ? WHERE `RiderID` = ?";
    sql = mysql.format(sql, [Image, RiderID]);
  
    // เรียกใช้คำสั่ง SQL
    conn.query(sql, (err, result) => {
      if (err) {
        console.error("Error updating data:", err);
        return res.status(500).json({ error: "Failed to update data" });
      }
      // ส่งผลลัพธ์กลับไปยังผู้ใช้
      res.status(200).json({ affected_rows: result.affectedRows });
    });
  });

  router.post("/imageUP", async (req, res) => {
    // รับข้อมูลจาก body
    const { OrderID,Image ,Status } = req.body;
  
    // SQL คำสั่งอัปเดตข้อมูล
    let sql = "UPDATE `deliveryorders` SET `Image` = ? ,`Status` = ?  WHERE `OrderID` = ?";
    sql = mysql.format(sql, [Image ,Status, OrderID]);
  
    // เรียกใช้คำสั่ง SQL
    conn.query(sql, (err, result) => {
      if (err) {
        console.error("Error updating data:", err);
        return res.status(500).json({ error: "Failed to update data" });
      }
      // ส่งผลลัพธ์กลับไปยังผู้ใช้
      res.status(200).json({ affected_rows: result.affectedRows });
    });
  });


