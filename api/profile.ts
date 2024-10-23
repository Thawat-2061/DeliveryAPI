import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn'; // ตรวจสอบให้แน่ใจว่าไฟล์นี้มีการเชื่อมต่อฐานข้อมูลอย่างถูกต้อง
import bcrypt from 'bcryptjs';

export const router = express.Router();
router.get("/user/:SenderID", (req, res) => {
  const SenderID = req.params.SenderID; 
  
  
    // ตรวจสอบว่ามีการส่ง UserID มาหรือไม่
    if (!SenderID) {
      return res.status(400).json({ error: "SenderID is required" });
    }
  
    // SQL query สำหรับค้นหาจาก UserID
    const sql = "SELECT * FROM users WHERE UserID = ?";
  
    // เรียกใช้การ query ไปที่ฐานข้อมูล โดยส่ง UserID ไปใน array แทน
    conn.query(sql, [SenderID], (err, result) => {
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
    const { RiderID } = req.body;
  
    // ตรวจสอบว่ามีการส่ง RiderID มาหรือไม่
    if (!RiderID) {
      return res.status(400).json({ error: "RiderID is required" });
    }
  
    // SQL query สำหรับค้นหาจาก RiderID
    const sql = "SELECT * FROM riders WHERE RiderID = ?";
  
    // เรียกใช้การ query ไปที่ฐานข้อมูล โดยส่ง RiderID ไปใน array แทน
    conn.query(sql, [RiderID], (err, result) => {
      if (err) {
        // ส่ง error 500 หากเกิดข้อผิดพลาดจากการ query
        return res.status(500).json({ error: err.message });
      }
  
      // ตรวจสอบว่าพบข้อมูลผู้ใช้หรือไม่
      if (result.length === 0) {
        return res.status(404).json({ message: "No rider found" });
      }
  
      // ส่งข้อมูลที่พบกลับไปให้ผู้เรียก API
      res.json(result);
    });
  });
  
  router.put("/editUser", (req, res) => {
    const { UserID, Username, Phone, Email, Address } = req.body;
  
    // ตรวจสอบว่ามีการส่ง UserID มาหรือไม่
    if (!UserID) {
      return res.status(400).json({ error: "UserID is required" });
    }
  
    // SQL query สำหรับอัปเดตข้อมูลผู้ใช้
    const sql = "UPDATE users SET Username = ?, Phone = ?, Email = ?, Address = ? WHERE UserID = ?";
  
    // เรียกใช้การ query ไปที่ฐานข้อมูล โดยส่งข้อมูลที่จะอัปเดตไปใน array
    conn.query(sql, [Username, Phone, Email, Address, UserID], (err, result) => {
      if (err) {
        // ส่ง error 500 หากเกิดข้อผิดพลาดจากการ query
        return res.status(500).json({ error: err.message });
      }
  
      // ตรวจสอบว่ามีแถวที่ถูกอัปเดตหรือไม่
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "No user found with the provided UserID" });
      }
  
      // ส่งข้อความยืนยันการอัปเดตสำเร็จ
      res.json({ message: "User updated successfully" });
    });
  });
  