import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn';
import bcrypt from 'bcryptjs';

export const router = express.Router();

const saltRounds = 10;

router.post('/user', async (req, res) => {
    let User = req.body;

    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!User.Username || !User.Email || !User.Password || !User.Phone || !User.Image || !User.Address || !User.GPS_Latitude || !User.GPS_Longitude) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // ตรวจสอบว่า latitude และ longitude เป็นตัวเลข
    if (isNaN(User.GPS_Latitude) || isNaN(User.GPS_Longitude)) {
        return res.status(400).send({ message: 'พิกัด GPS ไม่ถูกต้อง' });
    }

    try {
        const hashedPassword = await bcrypt.hash(User.Password, saltRounds);

        // ตรวจสอบว่าชื่อผู้ใช้หรืออีเมลมีอยู่แล้วในฐานข้อมูลหรือไม่
        const checkQuery = `SELECT * FROM users WHERE Username = ? OR Email = ? OR Phone = ?`;
        conn.query(checkQuery, [User.Username, User.Email,User.Phone], (err, rows) => {
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

            conn.query(query, [User.Username, User.Email, hashedPassword, User.Phone, User.Image, User.Address, User.GPS_Latitude, User.GPS_Longitude], (err, result) => {
                if (err) {
                    console.error('Database insertion error:', err);
                    return res.status(500).send({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ใช้', error: err });
                }
                // การเพิ่มผู้ใช้สำเร็จ
                res.status(201).send({ message: 'สมัครสมาชิกสำเร็จ', userId: result.insertId }); // ส่ง UserId ที่ถูกสร้าง
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send({ message: 'เกิดข้อผิดพลาด', error });
    }
});


router.post('/rider', async (req, res) => {
    let Rider = req.body;
    // const { username, email, password, phone, image, vehicleRegistration } = req.body;

    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!Rider.Username || !Rider.Email || !Rider.Password || !Rider.Phone || !Rider.VehicleRegistration) {
        return res.status(400).send({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    try {
        // ทำการ hash รหัสผ่านก่อนบันทึกลงในฐานข้อมูล
        const hashedPassword = await bcrypt.hash(Rider.Password, saltRounds);
        const checkQuery = `SELECT * FROM riders WHERE Username = ? OR Email = ? OR Phone = ? OR VehicleRegistration = ?`;
        conn.query(checkQuery, [Rider.Username, Rider.Email,Rider.Phone,Rider.VehicleRegistration], (err, rows) => {
            if (err) {
                console.error('Error checking for existing user:', err);
                return res.status(500).send({ message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล', error: err });
            }
            if (rows.length > 0) {
                return res.status(409).send({ message: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว' });
            }

        // สร้าง query เพื่อเพิ่มข้อมูล Rider ลงในตาราง riders
        const query = `
            INSERT INTO riders (Username, Email, Password, Phone, Image, VehicleRegistration)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        // ใช้การเชื่อมต่อฐานข้อมูล MySQL เพื่อบันทึกข้อมูล
        conn.query(query, [Rider.Username, Rider.Email, hashedPassword, Rider.Phone, Rider.Image, Rider.VehicleRegistration], (err, result) => {
            if (err) {
                return res.status(500).send({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล Rider', error: err });
            }
            res.status(201).send({ message: 'สมัคร Rider สำเร็จ' });
        });
    });
    } catch (error) {
        res.status(500).send({ message: 'เกิดข้อผิดพลาด', error });
    }
});

router.delete('/userDE', (req, res) => {
    const {userId} = req.body;

    const deleteUserQuery = 'DELETE FROM users WHERE UserID = ?';

    conn.query(deleteUserQuery, [userId], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ message: 'Failed to delete user' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    });
});

router.delete('/riderDE', (req, res) => {
    const {riderId} = req.body;

    const deleteUserQuery = 'DELETE FROM riders WHERE RiderID = ?';

    conn.query(deleteUserQuery, [riderId], (err, result) => {
        if (err) {
            console.error('Error deleting rider:', err);
            return res.status(500).json({ message: 'Failed to delete rider' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Rider not found' });
        }

        res.status(200).json({ message: 'Rider deleted successfully' });
    });
});