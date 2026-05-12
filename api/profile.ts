import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn'; 
import bcrypt from 'bcryptjs';

export const router = express.Router();
router.get("/user/:SenderID", (req, res) => {
  const SenderID = req.params.SenderID; 
  
  
    if (!SenderID) {
      return res.status(400).json({ error: "SenderID is required" });
    }
  
    const sql = "SELECT * FROM users WHERE UserID = ?";
  
    conn.query(sql, [SenderID], (err, result) => {
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
    const { RiderID } = req.body;
  
    if (!RiderID) {
      return res.status(400).json({ error: "RiderID is required" });
    }
  
    const sql = "SELECT * FROM riders WHERE RiderID = ?";
  
    conn.query(sql, [RiderID], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      if (result.length === 0) {
        return res.status(404).json({ message: "No rider found" });
      }
  
      res.json(result);
    });
  });
  
  router.put("/editUser", (req, res) => {
    const { UserID, Name, PhoneNumber, Email, Address } = req.body;
  
    if (!UserID) {
      return res.status(400).json({ error: "UserID is required" });
    }
  
    const sql = "UPDATE users SET Name = ?, PhoneNumber = ?, Email = ?, Address = ? WHERE UserID = ?";
  
    conn.query(sql, [Name, PhoneNumber, Email, Address, UserID], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "No user found with the provided UserID" });
      }
  
      res.json({ message: "User updated successfully" });
    });
  });
  
  router.put("/editRider", (req, res) => {
    const { RiderID, Name, PhoneNumber, Email } = req.body;
  
    if (!RiderID) {
      return res.status(400).json({ error: "RiderID is required" });
    }
  
    const sql = "UPDATE riders SET Name = ?, PhoneNumber = ?, Email = ? WHERE RiderID = ?";
  
    conn.query(sql, [Name, PhoneNumber, Email, RiderID], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "No rider found with the provided RiderID" });
      }
  
      res.json({ message: "Rider updated successfully" });
    });
  });
  
  router.put("/update", async (req, res) => {
    const { UserID, Name, PhoneNumber, Email, Address } = req.body;
  
    try {
      if (!UserID ) {
        return res.status(400).json({ error: "UserID are required" });
      }
  
      const sql = "UPDATE users SET Name = ?, PhoneNumber = ?, Email = ?, Address = ? WHERE UserID = ?";
  
      conn.query(sql, [Name, PhoneNumber, Email, Address, UserID], (err, result) => {
        if (err) {
          return res.status(500).json({ error: (err as Error).message });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "No user found with the provided UserID and OrderID" });
        }
  
        res.json({ message: "User data updated successfully" });
      });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  