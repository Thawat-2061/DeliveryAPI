import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn'; // ตรวจสอบให้แน่ใจว่าไฟล์นี้มีการเชื่อมต่อฐานข้อมูลอย่างถูกต้อง
import bcrypt from 'bcryptjs';

export const router = express.Router();

router.post("/user", (req, res) => {
    // const input = req.params.input; // พารามิเตอร์ input จะเป็นได้ทั้ง email หรือ username
    const {input } = req.body; 
    // ปรับ SQL ให้รองรับทั้ง email และ username
    let sql = "SELECT UserId ,Username ,Email ,Phone ,Image ,Address ,GPS_Latitude ,GPS_Longitude FROM users WHERE email = ? OR username = ?";
  
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
    let sql = "SELECT RiderId, Username, Email, Phone, Image, VehicleRegistration FROM riders WHERE email = ? OR username = ?";
  
    conn.query(sql, [input, input], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(result);
      }
    });
  });