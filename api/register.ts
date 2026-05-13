import express from 'express';
import { conn } from '../dbconn';
import bcrypt from 'bcryptjs';

export const router = express.Router();

const saltRounds = 10;

// Register User
router.post('/user', async (req, res) => {
    const User = req.body;

    if (!User.Username || !User.Email || !User.Password || !User.Phone || !User.Address || !User.GPS_Latitude || !User.GPS_Longitude) {
        return res.status(400).json({ error: "All fields are required." });
    }

    if (isNaN(User.GPS_Latitude) || isNaN(User.GPS_Longitude)) {
        return res.status(400).json({ message: 'พิกัด GPS ไม่ถูกต้อง' });
    }

    try {
        const hashedPassword = await bcrypt.hash(User.Password, saltRounds);

        // เช็คซ้ำ
        const checkResult = await conn.query(
            `SELECT * FROM users WHERE "Name" = $1 OR "Email" = $2 OR "PhoneNumber" = $3`,
            [User.Username, User.Email, User.Phone]
        );

        if (checkResult.rows.length > 0) {
            return res.status(409).json({ message: 'ข้อมูลซ้ำ' });
        }

        // Insert
        const result = await conn.query(
            `INSERT INTO users ("PhoneNumber", "Password", "Name", "Email", "ProfilePicture", "Address", "GPSLocation")
             VALUES ($1, $2, $3, $4, $5, $6, POINT($7, $8))
             RETURNING "UserID"`,
            [User.Phone, hashedPassword, User.Username, User.Email, User.Image, User.Address, User.GPS_Latitude, User.GPS_Longitude]
        );

        res.status(201).json({
            message: 'สมัครสำเร็จ',
            userId: result.rows[0].UserID
        });

    } catch (error) {
        console.error('Register user error:', error);
        res.status(500).json({ message: 'error', error });
    }
});

// Register Rider
router.post('/rider', async (req, res) => {
    const Rider = req.body;

    if (!Rider.Username || !Rider.Email || !Rider.Password || !Rider.Phone || !Rider.VehicleRegistration) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    try {
        const hashedPassword = await bcrypt.hash(Rider.Password, saltRounds);

        // เช็คซ้ำ
        const checkResult = await conn.query(
            `SELECT * FROM riders WHERE "Name" = $1 OR "Email" = $2 OR "PhoneNumber" = $3 OR "VehicleRegistration" = $4`,
            [Rider.Username, Rider.Email, Rider.Phone, Rider.VehicleRegistration]
        );

        if (checkResult.rows.length > 0) {
            return res.status(409).json({ message: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว' });
        }

        // Insert
        await conn.query(
            `INSERT INTO riders ("PhoneNumber", "Password", "Name", "Email", "ProfilePicture", "VehicleRegistration")
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [Rider.Phone, hashedPassword, Rider.Username, Rider.Email, Rider.Image, Rider.VehicleRegistration]
        );

        res.status(201).json({ message: 'สมัคร Rider สำเร็จ' });

    } catch (error) {
        console.error('Register rider error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', error });
    }
});

// Delete User
router.delete('/userDE', async (req, res) => {
    const { userId } = req.body;

    try {
        const result = await conn.query(
            `DELETE FROM users WHERE "UserID" = $1`,
            [userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// Delete Rider
router.delete('/riderDE', async (req, res) => {
    const { riderId } = req.body;

    try {
        const result = await conn.query(
            `DELETE FROM riders WHERE "RiderID" = $1`,
            [riderId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Rider not found' });
        }

        res.status(200).json({ message: 'Rider deleted successfully' });

    } catch (error) {
        console.error('Delete rider error:', error);
        res.status(500).json({ message: 'Failed to delete rider' });
    }
});