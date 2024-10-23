import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn'; // ตรวจสอบให้แน่ใจว่าไฟล์นี้มีการเชื่อมต่อฐานข้อมูลอย่างถูกต้อง
import bcrypt from 'bcryptjs';

export const router = express.Router();


router.put("/update", async (req, res) => {
    const { OrderID,RiderID ,Status } = req.body;
  
    try {
      // ตรวจสอบว่ามีการส่ง UserID มาหรือไม่
      if (!OrderID || !Status) {
        return res.status(400).json({ error: "UserID and Password are required" });
      }
  
      // แฮชรหัสผ่านก่อนที่จะอัปเดต
    //   const hashedPassword = await bcrypt.hash(Password, saltRounds);
  
      // SQL query สำหรับอัปเดตข้อมูลผู้ใช้
      const sql = "UPDATE deliveryorders SET Status = ?, RiderID = WHERE OrderID = ?";
  
      // เรียกใช้การ query ไปที่ฐานข้อมูล โดยส่งข้อมูลที่จะอัปเดตไปใน array
      conn.query(sql, [ Status ,RiderID,OrderID], (err, result) => {
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