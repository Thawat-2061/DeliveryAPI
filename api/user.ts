import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn'; // ตรวจสอบให้แน่ใจว่าไฟล์นี้มีการเชื่อมต่อฐานข้อมูลอย่างถูกต้อง
import bcrypt from 'bcryptjs';

export const router = express.Router();

router.get("/", (req, res) => {
 

    // SQL query สำหรับค้นหาจาก UserID
    const sql = "SELECT * FROM users";
  
    // เรียกใช้การ query ไปที่ฐานข้อมูล โดยส่ง UserID ไปใน array แทน
    conn.query(sql, (err, result) => {
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