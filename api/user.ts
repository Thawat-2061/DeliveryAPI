import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn'; // ตรวจสอบให้แน่ใจว่าไฟล์นี้มีการเชื่อมต่อฐานข้อมูลอย่างถูกต้อง
import bcrypt from 'bcryptjs';

export const router = express.Router();

router.get("/:userId", (req, res) => {
  const userId = req.params.userId; // รับค่า UserID จาก URL parameter

  // SQL query เพื่อค้นหาผู้ใช้ทุกคนยกเว้นตัวเอง
  const sql = "SELECT * FROM users WHERE UserID != ?";

  // เรียกใช้การ query ไปที่ฐานข้อมูล โดยส่ง UserID ไปใน array แทน
  conn.query(sql, [userId], (err, result) => {
    if (err) {
      // ส่ง error 500 หากเกิดข้อผิดพลาดจากการ query
      return res.status(500).json({ error: err.message });
    }

    // ตรวจสอบว่าพบข้อมูลผู้ใช้หรือไม่
    if (result.length === 0) {
      return res.status(404).json({ message: "No user found" });
    }

    // ส่งข้อมูลที่พบกลับไปให้ผู้เรียก API
    res.json(result);
  });
});

router.get("/show/:SenderID", (req, res) => {
  const userId = req.params.SenderID; // รับค่า UserID จาก URL parameter

  // SQL query เพื่อค้นหาข้อมูลจากตาราง deliveryorders พร้อมกับข้อมูลจาก users โดยใช้ JOIN
  const sql = `
  SELECT d.*, 
         u.Username AS CustomerName, 
         u.Phone AS CustomerPhone, 
         u.GPS_Latitude AS CustomerLat, 
         u.GPS_Longitude AS CustomerLong,
         u.Image AS CustomerImage,
         sender.Image AS SenderImage,
         sender.Username AS SenderName,
         sender.Phone AS SenderPhone,
         sender.GPS_Latitude AS SenderLat, 
         sender.GPS_Longitude AS SenderLong
  FROM deliveryorders d
  JOIN users u ON d.ReceiverID = u.UserID
  JOIN users sender ON d.SenderID = sender.UserID
  WHERE d.SenderID = ?
`;

  
  // เรียกใช้การ query ไปที่ฐานข้อมูล โดยส่ง UserID ไปใน array แทน
  conn.query(sql, [userId], (err, result) => {
    if (err) {
      // ส่ง error 500 หากเกิดข้อผิดพลาดจากการ query
      return res.status(500).json({ error: err.message });
    }
  
    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (result.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
  
    // ส่งข้อมูลที่พบกลับไปให้ผู้เรียก API
    res.json(result);
  });
});

router.get("/showMe/:UserID", (req, res) => {
  const userId = req.params.UserID; // รับค่า UserID จาก URL parameter

  // SQL query เพื่อค้นหาข้อมูลจากตาราง deliveryorders พร้อมกับข้อมูลจาก users โดยใช้ JOIN
  const sql = `
    SELECT d.*, u.Username AS SenderName, u.Phone , u.GPS_Latitude AS SenderLat, u.GPS_Longitude AS SenderLong
    FROM deliveryorders d
    JOIN users u ON d.SenderID = u.UserID
    WHERE d.ReceiverID = ?
  `;
  
  // เรียกใช้การ query ไปที่ฐานข้อมูล โดยส่ง UserID ไปใน array แทน
  conn.query(sql, [userId], (err, result) => {
    if (err) {
      // ส่ง error 500 หากเกิดข้อผิดพลาดจากการ query
      return res.status(500).json({ error: err.message });
    }
  
    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (result.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
  
    // ส่งข้อมูลที่พบกลับไปให้ผู้เรียก API
    res.json(result);
  });
});



