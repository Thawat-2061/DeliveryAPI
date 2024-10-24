import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn'; // ตรวจสอบให้แน่ใจว่าไฟล์นี้มีการเชื่อมต่อฐานข้อมูลอย่างถูกต้อง
import bcrypt from 'bcryptjs';

export const router = express.Router();

router.post("/user", (req, res) => {
  const { input } = req.body;

  // ตรวจสอบว่ามีการส่ง input มาหรือไม่
  if (!input) {
    return res.status(400).json({ error: "Input is required" });
  }

  // SQL query สำหรับค้นหาจาก email หรือ username
  const sql = "SELECT * FROM users WHERE Email = ? OR Username = ?";

  // เรียกใช้การ query ไปที่ฐานข้อมูล
  conn.query(sql, [input, input], (err, result) => {
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


  router.post("/rider", (req, res) => {
    const { input } = req.body;
  
    // ตรวจสอบว่ามีการส่ง input มาหรือไม่
    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }
  
    // SQL query ที่ใช้ในการค้นหาจาก email หรือ username
    const sql = "SELECT * FROM riders WHERE Email = ? OR Username = ?";
  
    // เรียกใช้การ query ไปที่ฐานข้อมูล
    conn.query(sql, [input, input], (err, result) => {
      if (err) {
        // ส่งสถานะ error 500 หากมีข้อผิดพลาดในการ query
        return res.status(500).json({ error: err.message });
      }
  
      // ตรวจสอบว่าพบข้อมูลหรือไม่
      if (result.length === 0) {
        return res.status(404).json({ message: "No rider found" });
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
router.put("/passRider", async (req, res) => {
  const { RiderID, Password } = req.body;

  try {
    // ตรวจสอบว่ามีการส่ง UserID มาหรือไม่
    if (!RiderID || !Password) {
      return res.status(400).json({ error: "UserID and Password are required" });
    }

    // แฮชรหัสผ่านก่อนที่จะอัปเดต
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    // SQL query สำหรับอัปเดตข้อมูลผู้ใช้
    const sql = "UPDATE users SET Password = ? WHERE UserID = ?";

    // เรียกใช้การ query ไปที่ฐานข้อมูล โดยส่งข้อมูลที่จะอัปเดตไปใน array
    conn.query(sql, [hashedPassword, RiderID], (err, result) => {
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
  