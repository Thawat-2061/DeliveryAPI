import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn';
import bcrypt from 'bcryptjs';

export const router = express.Router();

const saltRounds = 10;

router.post('/user', async (req, res) => {
    const { username, email, password, phone, image, address, latitude, longitude } = req.body;

    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!username || !email || !password || !phone || !address || !latitude || !longitude) {
        return res.status(400).send({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // ตรวจสอบว่า latitude และ longitude เป็นตัวเลข
    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).send({ message: 'พิกัด GPS ไม่ถูกต้อง' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // ตรวจสอบว่าชื่อผู้ใช้หรืออีเมลมีอยู่แล้วในฐานข้อมูลหรือไม่
        const checkQuery = `SELECT * FROM users WHERE Username = ? OR Email = ?`;
        conn.query(checkQuery, [username, email], (err, rows) => {
            if (err) {
                console.error('Error checking for existing user:', err);
                return res.status(500).send({ message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล', error: err });
            }
            if (rows.length > 0) {
                return res.status(409).send({ message: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว' });
            }

            // ถ้าไม่มีข้อมูลซ้ำ เพิ่มผู้ใช้ใหม่
            const query = `
                INSERT INTO users (Username, Email, Password, Phone, Image, Address, GPS_Latitude, GPS_Longitude)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            conn.query(query, [username, email, hashedPassword, phone, image, address, latitude, longitude], (err, result) => {
                if (err) {
                    console.error('Database insertion error:', err);
                    return res.status(500).send({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ใช้', error: err });
                }
                res.status(201).send({ message: 'สมัครสมาชิกสำเร็จ' });
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send({ message: 'เกิดข้อผิดพลาด', error });
    }
});


router.post('/rider', async (req, res) => {
    const { username, email, password, phone, image, vehicleRegistration } = req.body;

    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!username || !email || !password || !phone || !vehicleRegistration) {
        return res.status(400).send({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    try {
        // ทำการ hash รหัสผ่านก่อนบันทึกลงในฐานข้อมูล
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // สร้าง query เพื่อเพิ่มข้อมูล Rider ลงในตาราง riders
        const query = `
            INSERT INTO riders (Username, Email, Password, Phone, Image, VehicleRegistration)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        // ใช้การเชื่อมต่อฐานข้อมูล MySQL เพื่อบันทึกข้อมูล
        conn.query(query, [username, email, hashedPassword, phone, image, vehicleRegistration], (err, result) => {
            if (err) {
                return res.status(500).send({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล Rider', error: err });
            }
            res.status(201).send({ message: 'สมัคร Rider สำเร็จ' });
        });
    } catch (error) {
        res.status(500).send({ message: 'เกิดข้อผิดพลาด', error });
    }
});

