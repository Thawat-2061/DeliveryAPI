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

const saltRounds = 10;

router.put("/passUser", async (req, res) => {
  const { UserID, Password } = req.body;

  try {
    // ตรวจสอบว่ามีการส่ง UserID มาหรือไม่
    if (!UserID || !Password) {
      return res.status(400).json({ error: "UserID and Password are required" });
    }

    // แฮชรหัสผ่านก่อนที่จะอัปเดต
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    // SQL query สำหรับอัปเดตข้อมูลผู้ใช้
    const sql = "UPDATE users SET Password = ? WHERE UserID = ?";

    // เรียกใช้การ query ไปที่ฐานข้อมูล โดยส่งข้อมูลที่จะอัปเดตไปใน array
    conn.query(sql, [hashedPassword, UserID], (err, result) => {
      if (err) {
        // ส่ง error 500 หากเกิดข้อผิดพลาดจากการ query
        return res.status(500).json({ error: (err as Error).message });
      }

      // ตรวจสอบว่ามีแถวที่ถูกอัปเดตหรือไม่
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "No user found with the provided UserID" });
      }

      // ส่งข้อความยืนยันการอัปเดตสำเร็จ
      res.json({ message: "Password updated successfully" });
    });
  } catch (err) {
    // จัดการข้อผิดพลาดในขั้นตอนการแฮช
    res.status(500).json({ error: (err as Error).message });
  }
});



