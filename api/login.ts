import express from 'express';
import { conn } from '../dbconn';
import bcrypt from 'bcryptjs';

export const router = express.Router();

const saltRounds = 10;

// Search User
router.post("/user", async (req, res) => {
    const { input } = req.body;

    if (!input) {
        return res.status(400).json({ error: "Input is required" });
    }

    try {
        const result = await conn.query(
            `SELECT * FROM users WHERE "Email" = $1 OR "Name" = $2 OR "PhoneNumber" = $3`,
            [input, input, input]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No user found" });
        }

        res.json(result.rows);

    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// Search Rider
router.post("/rider", async (req, res) => {
    const { input } = req.body;

    if (!input) {
        return res.status(400).json({ error: "Input is required" });
    }

    try {
        const result = await conn.query(
            `SELECT * FROM riders WHERE "Email" = $1 OR "Name" = $2 OR "PhoneNumber" = $3`,
            [input, input, input]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No rider found" });
        }

        res.json(result.rows);

    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// Update User Password
router.put("/passUser", async (req, res) => {
    const { UserID, Password } = req.body;

    if (!UserID || !Password) {
        return res.status(400).json({ error: "UserID and Password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(Password, saltRounds);

        const result = await conn.query(
            `UPDATE users SET "Password" = $1 WHERE "UserID" = $2`,
            [hashedPassword, UserID]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No user found with the provided UserID" });
        }

        res.json({ message: "Password updated successfully" });

    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// Update Rider Password
router.put("/passRider", async (req, res) => {
    const { RiderID, Password } = req.body;

    if (!RiderID || !Password) {
        return res.status(400).json({ error: "RiderID and Password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(Password, saltRounds);

        const result = await conn.query(
            `UPDATE riders SET "Password" = $1 WHERE "RiderID" = $2`,
            [hashedPassword, RiderID]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No rider found with the provided RiderID" });
        }

        res.json({ message: "Password updated successfully" });

    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});