import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn'; 
import bcrypt from 'bcryptjs';

export const router = express.Router();

router.post("/user", (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Input is required" });
  }

  const sql = "SELECT * FROM users WHERE Email = ? OR Name = ? OR PhoneNumber = ?";

  conn.query(sql, [input, input, input], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No user found" });
    }

    res.json(result);
  });
});

  router.post("/rider", (req, res) => {
    const { input } = req.body;
  
    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }
  
    const sql = "SELECT * FROM riders WHERE Email = ? OR Name = ? OR PhoneNumber = ?";
  
    conn.query(sql, [input, input , input], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      if (result.length === 0) {
        return res.status(404).json({ message: "No rider found" });
      }
  
      res.json(result);
    });
  });
  const saltRounds = 10;

router.put("/passUser", async (req, res) => {
  const { UserID, Password } = req.body;

  try {
    if (!UserID || !Password) {
      return res.status(400).json({ error: "UserID and Password are required" });
    }

    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    const sql = "UPDATE users SET Password = ? WHERE UserID = ?";

    conn.query(sql, [hashedPassword, UserID], (err, result) => {
      if (err) {
        return res.status(500).json({ error: (err as Error).message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "No user found with the provided UserID" });
      }

      res.json({ message: "Password updated successfully" });
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
router.put("/passRider", async (req, res) => {
  const { RiderID, Password } = req.body;

  try {
    if (!RiderID || !Password) {
      return res.status(400).json({ error: "UserID and Password are required" });
    }

    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    const sql = "UPDATE riders SET Password = ? WHERE RiderID = ?";

    conn.query(sql, [hashedPassword, RiderID], (err, result) => {
      if (err) {
        return res.status(500).json({ error: (err as Error).message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "No user found with the provided UserID" });
      }

      res.json({ message: "Password updated successfully" });
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
  