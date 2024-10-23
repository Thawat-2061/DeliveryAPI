import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn'; // ตรวจสอบให้แน่ใจว่าไฟล์นี้มีการเชื่อมต่อฐานข้อมูลอย่างถูกต้อง
import bcrypt from 'bcryptjs';

export const router = express.Router();

router.get("/", (req, res) => {
    // SQL query เพื่อค้นหาข้อมูลจากตาราง deliveryorders
    const sql = `
    SELECT d.*, s.Phone AS SenderPhone, s.Username AS SenderName , r.Phone AS CustomerPhone, r.Username AS CustomerName, s.Image AS SenderImage, r.Image AS CustomerImage, s.GPS_Latitude AS SenderLAt, s.GPS_Longitude AS SenderLong, r.GPS_Latitude AS CustomerLAt, r.GPS_Longitude AS CustomerLong
    FROM deliveryorders d
    JOIN users s ON d.SenderID = u.UserID
    JOIN users r ON d.ReceiverID = u.UserID
    WHERE d.RiderID IS NULL 
    AND d.Status = 'รอไรเดอร์'
  `;
  
  
    // เรียกใช้การ query ไปที่ฐานข้อมูล
    conn.query(sql, (err, result) => {
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