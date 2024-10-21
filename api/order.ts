import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn';
import bcrypt from 'bcryptjs';

export const router = express.Router();

router.post("/", (req, res) => {
    const { SenderID, ReceiverID	, Name , Detail, Status, Image} = req.body; // รับข้อมูลจาก body
  
    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!SenderID || !Name	 || !Detail || !Status|| !ReceiverID|| !Image) {
      return res.status(400).json({ message: "Missing required fields" });
    }
  
    // SQL query สำหรับการสร้างคำสั่งซื้อใหม่ในตาราง deliveryorders
    const sql = "INSERT INTO deliveryorders (SenderID, ReceiverID, Name , Detail, Status, Image) VALUES (?, ?, ?, ?, ?, ?)";
  
    // เรียกใช้การ query เพื่อเพิ่มข้อมูลในตาราง
    conn.query(sql, [SenderID, ReceiverID, Name , Detail, Status, Image], (err, result) => {
      if (err) {
        // ส่ง error 500 หากเกิดข้อผิดพลาดจากการ query
        return res.status(500).json({ error: err.message });
      }
  
      // ส่งผลลัพธ์การสร้างคำสั่งซื้อกลับไปให้ผู้เรียก API
      res.status(201).json({ message: "Order created successfully", orderId: result.insertId });
    });
  });
  