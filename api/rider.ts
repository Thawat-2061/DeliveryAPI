import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn'; 
import bcrypt from 'bcryptjs';

export const router = express.Router();

router.get("/", (req, res) => {
    const sql = `
  SELECT 
    d.OrderID as orderId,
    d.Status as status,
    d.CreatedAt,
    s.UserID as senderId,
    s.Name as senderName,
    s.PhoneNumber as senderPhone,
    s.ProfilePicture as senderProfilePicture,
    s.GPSLocation as senderLocation,
    r.UserID as receiverId,
    r.Name as customerName,
    r.PhoneNumber as customerPhone,
    r.ProfilePicture as customerProfilePicture,
    r.GPSLocation as customerLocation,
    oi.Description as itemName,
    oi.ItemPicture as itemPicture
  FROM deliveryorders d
  JOIN users s ON d.SenderID = s.UserID
  JOIN users r ON d.ReceiverID = r.UserID
  LEFT JOIN orderitems oi ON d.OrderID = oi.OrderID
  WHERE d.RiderID IS NULL 
    AND d.Status = 'AwaitingPickup'  
  ORDER BY d.CreatedAt DESC
`;
  
    conn.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (result.length === 0) {
        return res.status(404).json({ message: "No data found" });
      }
      
      res.json(result);
    });
  });