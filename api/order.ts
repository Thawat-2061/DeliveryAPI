import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn';
import bcrypt from 'bcryptjs';

export const router = express.Router();

router.post("/", (req, res) => {
  const { SenderID, ReceiverID, Name, Detail, Status, Image } = req.body;

  if (!SenderID || !ReceiverID || !Name || !Status) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const statusMap: Record<string, string> = {
    'รอไรเดอร์': 'AwaitingPickup',
    'ไรเดอร์รับงาน': 'RiderAssigned', 
    'กำลังจัดส่ง': 'InTransit',
    'จัดส่งสำเร็จ': 'Delivered',
    'AwaitingPickup': 'AwaitingPickup',
    'RiderAssigned': 'RiderAssigned',
    'InTransit': 'InTransit',
    'Delivered': 'Delivered',
  };
  const finalStatus = statusMap[Status] || 'AwaitingPickup';

  conn.getConnection((err, connection) => {
    if (err) {
      console.error('[order] getConnection error:', err.message);
      return res.status(500).json({ error: err.message });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release(); 
        console.error('[order] beginTransaction error:', err.message);
        return res.status(500).json({ error: err.message });
      }

      const orderSql = `
        INSERT INTO deliveryorders 
        (SenderID, ReceiverID, RiderID, Status) 
        VALUES (?, ?, NULL, ?)
      `;

      connection.query(orderSql, [SenderID, ReceiverID, finalStatus], (err, orderResult: any) => {
        if (err) {
          return connection.rollback(() => {
            connection.release(); 
            console.error('[order] insert deliveryorders error:', err.message);
            res.status(500).json({ error: err.message });
          });
        }

        const orderId = orderResult.insertId;

        const itemSql = `
          INSERT INTO orderitems (OrderID, Description, ItemPicture) 
          VALUES (?, ?, ?)
        `;

        connection.query(itemSql, [orderId, Detail || Name, Image || ''], (err) => {
          if (err) {
            return connection.rollback(() => {
              connection.release(); 
              console.error('[order] insert orderitems error:', err.message);
              res.status(500).json({ error: err.message });
            });
          }

          connection.commit((err) => {
            connection.release(); 
            
            if (err) {
              return connection.rollback(() => {
                console.error('[order] commit error:', err.message);
                res.status(500).json({ error: err.message });
              });
            }
            
            res.status(201).json({ 
              message: "Order created successfully", 
              orderId: orderId 
            });
          });
        });
      });
    });
  });
});
  
  router.get("/detail/:OrderID", (req, res) => {
    const OrderID = req.params.OrderID; 
  
    const sql = `
    SELECT d.*, 
           u.Username AS CustomerName, 
           u.Phone AS CustomerPhone, 
           u.GPS_Latitude AS CustomerLat, 
           u.GPS_Longitude AS CustomerLong,
           sender.Username AS SenderName,
           sender.Phone AS SenderPhone,
           sender.GPS_Latitude AS SenderLat, 
           sender.GPS_Longitude AS SenderLong
    FROM deliveryorders d
    JOIN users u ON d.ReceiverID = u.UserID
    JOIN users sender ON d.SenderID = sender.UserID
    WHERE d.OrderID = ?
  `;
    
    conn.query(sql, [OrderID], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
    
      if (result.length === 0) {
        return res.status(404).json({ message: "No data found" });
      }
    
      res.json(result);
    });
  });