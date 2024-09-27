import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn'; // ตรวจสอบให้แน่ใจว่าไฟล์นี้มีการเชื่อมต่อฐานข้อมูลอย่างถูกต้อง
import bcrypt from 'bcryptjs';

export const router = express.Router();

router.post("/user", (req, res) => {
    // const input = req.params.input; // พารามิเตอร์ input จะเป็นได้ทั้ง email หรือ username
    const {input } = req.body; 
    // ปรับ SQL ให้รองรับทั้ง email และ username
    let sql = "SELECT * FROM users WHERE Email = ? OR Username = ?";
  
    conn.query(sql, [input, input], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(result);
      }
    });
  });

  router.post("/rider", (req, res) => {
    // const input = req.params.input; // พารามิเตอร์ input จะเป็นได้ทั้ง email หรือ username
    const {input } = req.body; 
    // ปรับ SQL ให้รองรับทั้ง email และ username
    let sql = "SELECT * FROM riders WHERE Email = ? OR Username = ?";
  
    conn.query(sql, [input, input], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(result);
      }
    });
  });