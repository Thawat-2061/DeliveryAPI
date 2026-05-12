import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn';
import bcrypt from 'bcryptjs';

export const router = express.Router();

const saltRounds = 10;

router.post('/user', async (req, res) => {
    console.log(' HIT REGISTER USER');
console.log('BODY:', req.body);
    const User = req.body;

    if (!User.Username || !User.Email || !User.Password || !User.Phone || !User.Address || !User.GPS_Latitude || !User.GPS_Longitude) {
        return res.status(400).json({ error: "All fields are required." });
    }

    if (isNaN(User.GPS_Latitude) || isNaN(User.GPS_Longitude)) {
        return res.status(400).send({ message: 'พิกัด GPS ไม่ถูกต้อง' });
    }

    try {
        const hashedPassword = await bcrypt.hash(User.Password, saltRounds);

        const gpsLocation = `${User.GPS_Latitude},${User.GPS_Longitude}`;

        const checkQuery = `
            SELECT * FROM users 
            WHERE Name = ? OR Email = ? OR PhoneNumber = ?
        `;

        conn.query(checkQuery, [User.Username, User.Email, User.Phone], (err, rows) => {
            if (err) {
                return res.status(500).send({ message: 'เกิดข้อผิดพลาด', error: err });
            }

            if (rows.length > 0) {
                return res.status(409).send({ message: 'ข้อมูลซ้ำ' });
            }

            const query = `
            INSERT INTO users 
            (PhoneNumber, Password, Name, Email, ProfilePicture, Address, GPSLocation)
            VALUES (?, ?, ?, ?, ?, ?, POINT(?, ?))
            `;

            conn.query(query, [
                User.Phone,         
                hashedPassword,     
                User.Username,       
                User.Email,         
                User.Image,          
                User.Address,        
                User.GPS_Latitude,   
                User.GPS_Longitude    
            ], (err, result) => {
            if (err) {
                console.error(' INSERT ERROR:', err);
                return res.status(500).send(err);
            }

            res.status(201).send({
                message: 'สมัครสำเร็จ',
                userId: result.insertId
            });
            });
        });

    } catch (error) {
        res.status(500).send({ message: 'error', error });
    }
});


router.post('/rider', async (req, res) => {
    let Rider = req.body;

    if (!Rider.Username || !Rider.Email || !Rider.Password || !Rider.Phone || !Rider.VehicleRegistration) {
        return res.status(400).send({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    try {
        const hashedPassword = await bcrypt.hash(Rider.Password, saltRounds);
        const checkQuery = `SELECT * FROM riders WHERE Name = ? OR Email = ? OR PhoneNumber = ? OR VehicleRegistration = ?`;
        conn.query(checkQuery, [Rider.Username, Rider.Email,Rider.Phone,Rider.VehicleRegistration], (err, rows) => {
            if (err) {
                console.error('Error checking for existing user:', err);
                return res.status(500).send({ message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล', error: err });
            }
            if (rows.length > 0) {
                return res.status(409).send({ message: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว' });
            }

        const query = `
            INSERT INTO riders (PhoneNumber, Password, Name, Email, ProfilePicture, VehicleRegistration)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        conn.query(query, [Rider.Phone, hashedPassword, Rider.Username, Rider.Email, Rider.Image, Rider.VehicleRegistration], (err, result) => {
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