import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn';

export const router = express.Router();

router.put("/update", (req, res) => {
  const { OrderID, RiderID, Status } = req.body;

  if (!OrderID || !Status) {
    return res.status(400).json({ 
      error: "OrderID and Status are required",
      received: { OrderID, RiderID, Status }
    });
  }

  const validStatuses = ['AwaitingPickup', 'RiderAssigned', 'InTransit', 'Delivered'];
  if (!validStatuses.includes(Status)) {
    return res.status(400).json({ 
      error: `Invalid status value. Must be one of: ${validStatuses.join(', ')}`,
      received: Status 
    });
  }

  const sql = `
    UPDATE deliveryorders 
    SET Status = ?, RiderID = ?, UpdatedAt = NOW() 
    WHERE OrderID = ? AND RiderID IS NULL
  `;

  conn.query(sql, [Status, RiderID, OrderID], (err, result) => {
    if (err) {
      console.error(' Database update error:', err);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      const checkSql = 'SELECT RiderID, Status FROM deliveryorders WHERE OrderID = ?';
      conn.query(checkSql, [OrderID], (checkErr, checkResult) => {
        if (checkErr) {
          return res.status(500).json({ error: checkErr.message });
        }
        
        if (checkResult.length === 0) {
          return res.status(404).json({ 
            message: "Order not found", 
            OrderID: OrderID 
          });
        } else if (checkResult[0].RiderID !== null) {
          return res.status(409).json({ 
            message: "This order has already been accepted by another rider", 
            assignedRiderId: checkResult[0].RiderID,
            currentStatus: checkResult[0].Status
          });
        }
        return res.status(400).json({ message: "Cannot update this order" });
      });
      return;
    }

    const logSql = `
      INSERT INTO orderstatusupdates (OrderID, Status, UpdatedBy, StatusPicture)
      VALUES (?, ?, ?, NULL)
    `;
    conn.query(logSql, [OrderID, Status, RiderID], (logErr) => {
      if (logErr) {
        console.warn(' Failed to log status update:', logErr.message);
      }
    });

    res.json({ 
      success: true, 
      message: "Order status updated successfully",
      data: {
        OrderID: OrderID,
        RiderID: RiderID,
        Status: Status,
        StatusTH: _translateStatus(Status)
      }
    });
  });
});

function _translateStatus(statusEn: string) {
  const map: { [key: string]: string } = {
    'AwaitingPickup': 'รอไรเดอร์',
    'RiderAssigned': 'ไรเดอร์รับงาน',
    'InTransit': 'กำลังนำส่ง',
    'Delivered': 'ส่งสำเร็จ'
  };
  return map[statusEn] || statusEn;
}