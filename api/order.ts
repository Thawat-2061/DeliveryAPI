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
  
  router.get("/detail/:OrderID", (req, res) => {
    const OrderID = req.params.OrderID; // รับค่า UserID จาก URL parameter
  
    // SQL query เพื่อค้นหาข้อมูลจากตาราง deliveryorders พร้อมกับข้อมูลจาก users โดยใช้ JOIN
    const sql = `
    SELECT d.*, 
           u.Username AS CustomerName, 
           u.Phone AS CustomerPhone, 
           u.GPS_Latitude AS CustomerLat, 
           u.GPS_Longitude AS CustomerLong,
           sender.Username AS SenderName,
           sender.Phone AS SenderPhone,
           sender.GPS_Latitude AS SenderLat, 
           sender.GPS_Longitude AS SenderLong
    FROM deliveryorders d
    JOIN users u ON d.ReceiverID = u.UserID
    JOIN users sender ON d.SenderID = sender.UserID
    WHERE d.OrderID = ?
  `;
    
    // เรียกใช้การ query ไปที่ฐานข้อมูล โดยส่ง UserID ไปใน array แทน
    conn.query(sql, [OrderID], (err, result) => {
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