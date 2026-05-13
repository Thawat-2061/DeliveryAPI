import express from 'express';
import { conn } from '../dbconn';

export const router = express.Router();

// Get User by ID
router.get("/user/:SenderID", async (req, res) => {
    const { SenderID } = req.params;

    try {
        const result = await conn.query(
            `SELECT * FROM users WHERE "UserID" = $1`,
            [SenderID]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No user found" });
        }

        res.json(result.rows);

    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// Get Rider by ID
router.post("/rider", async (req, res) => {
    const { RiderID } = req.body;

    if (!RiderID) {
        return res.status(400).json({ error: "RiderID is required" });
    }

    try {
        const result = await conn.query(
            `SELECT * FROM riders WHERE "RiderID" = $1`,
            [RiderID]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No rider found" });
        }

        res.json(result.rows);

    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// Edit User
router.put("/editUser", async (req, res) => {
    const { UserID, Name, PhoneNumber, Email, Address } = req.body;

    if (!UserID) {
        return res.status(400).json({ error: "UserID is required" });
    }

    try {
        const result = await conn.query(
            `UPDATE users SET "Name" = $1, "PhoneNumber" = $2, "Email" = $3, "Address" = $4 WHERE "UserID" = $5`,
            [Name, PhoneNumber, Email, Address, UserID]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No user found with the provided UserID" });
        }

        res.json({ message: "User updated successfully" });

    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// Edit Rider
router.put("/editRider", async (req, res) => {
    const { RiderID, Name, PhoneNumber, Email } = req.body;

    if (!RiderID) {
        return res.status(400).json({ error: "RiderID is required" });
    }

    try {
        const result = await conn.query(
            `UPDATE riders SET "Name" = $1, "PhoneNumber" = $2, "Email" = $3 WHERE "RiderID" = $4`,
            [Name, PhoneNumber, Email, RiderID]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No rider found with the provided RiderID" });
        }

        res.json({ message: "Rider updated successfully" });

    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// Update User
router.put("/update", async (req, res) => {
    const { UserID, Name, PhoneNumber, Email, Address } = req.body;

    if (!UserID) {
        return res.status(400).json({ error: "UserID is required" });
    }

    try {
        const result = await conn.query(
            `UPDATE users SET "Name" = $1, "PhoneNumber" = $2, "Email" = $3, "Address" = $4 WHERE "UserID" = $5`,
            [Name, PhoneNumber, Email, Address, UserID]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No user found with the provided UserID" });
        }

        res.json({ message: "User data updated successfully" });

    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});