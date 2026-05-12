import express from 'express';
import { conn } from '../dbconn';

export const router = express.Router();

router.get('/search', (req, res) => {
  const q = `%${(req.query.q as string) ?? ''}%`;
  console.log('[user] search →', q);

  const sql = `
    SELECT
      UserID,
      Name,
      PhoneNumber,
      ST_X(GPSLocation) AS gpsLatitude,
      ST_Y(GPSLocation) AS gpsLongitude,
      ProfilePicture,
      Address,
      Email
    FROM users
    WHERE PhoneNumber LIKE ?
       OR Name LIKE ?
    LIMIT 30
  `;

  conn.query(sql, [q, q], (err, result: any) => {
    if (err) {
      console.error('[search error]', err.message);
      return res.status(500).json({ error: err.message });
    }

    const users = (result as any[]).map((u: any) => ({
      userId: u.UserID,
      name: u.Name ?? '',
      phoneNumber: u.PhoneNumber ?? '',
      gpsLatitude: Number(u.gpsLatitude) || 0.0,
      gpsLongitude: Number(u.gpsLongitude) || 0.0,
      profilePicture: u.ProfilePicture ?? '',
      address: u.Address ?? '',
      email: u.Email ?? '',
    }));

    console.log('[search] ✅ Found:', users.length, 'users');
    return res.status(200).json(users);
  });
});

router.get('/show/:SenderID', (req, res) => {
  const senderID = req.params.SenderID;
  console.log('[user] GET /show/:SenderID →', senderID);
 
  const sql = `
    SELECT
      d.OrderID,
      d.SenderID,
      d.ReceiverID,
      d.RiderID,
      d.Status,
      d.CreatedAt,
      d.UpdatedAt,
      
      GROUP_CONCAT(oi.Description SEPARATOR ' | ') AS Detail,
      GROUP_CONCAT(oi.ItemPicture SEPARATOR ' | ') AS Image,
      
      receiver.Name           AS CustomerName,
      receiver.PhoneNumber    AS CustomerPhone,
      CONCAT(ST_Y(receiver.GPSLocation), ',', ST_X(receiver.GPSLocation)) AS CustomerGPS,
      receiver.ProfilePicture AS CustomerImage,
      
      sender.Name             AS SenderName,
      sender.PhoneNumber      AS SenderPhone,
      CONCAT(ST_Y(sender.GPSLocation), ',', ST_X(sender.GPSLocation)) AS SenderGPS,
      sender.ProfilePicture   AS SenderImage
      
    FROM deliveryorders d
    JOIN users receiver ON d.ReceiverID = receiver.UserID
    JOIN users sender   ON d.SenderID   = sender.UserID
    LEFT JOIN orderitems oi ON d.OrderID = oi.OrderID
    WHERE d.SenderID = ?
    GROUP BY d.OrderID
    ORDER BY d.OrderID DESC
  `;
 
  conn.query(sql, [senderID], (err, result) => {
    if (err) {
      console.error('[user] /show error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) return res.status(200).json([]);
 
    const orders = (result as any[]).map((d: any) => ({
      orderId: d.OrderID,
      senderId: d.SenderID,
      receiverId: d.ReceiverID,
      riderId: d.RiderID,
      
      name: d.Detail ?? '',             
      detail: d.Detail ?? '',           
      status: d.Status ?? '',
      customerName: d.CustomerName ?? '',
      customerPhone: d.CustomerPhone ?? '',
      
      customerLocation: d.CustomerGPS ?? '0.0,0.0',
      senderLocation: d.SenderGPS ?? '0.0,0.0',
      
      profilePicture: d.Image?.split('|')[0]?.trim() ?? '', 
      images: d.Image ? d.Image.split(' | ') : [],           
      customerProfilePicture: d.CustomerImage ?? '',
      senderProfilePicture: d.SenderImage ?? '',
      
      createdAt: d.CreatedAt ?? '',
      updatedAt: d.UpdatedAt ?? '',
    }));
    
    console.log('[show] ✅ Returning:', orders.length, 'orders');
    return res.status(200).json(orders);
  });
});

router.get('/showMe/:UserID', (req, res) => {
  const userID = req.params.UserID;
  console.log('[user] GET /showMe/:UserID →', userID);
 
  const sql = `
    SELECT
      d.OrderID,
      d.SenderID,
      d.ReceiverID,
      d.RiderID,
      d.Status,
      d.CreatedAt,
      d.UpdatedAt,
      
      GROUP_CONCAT(oi.Description SEPARATOR ' | ') AS Detail,
      GROUP_CONCAT(oi.ItemPicture SEPARATOR ' | ') AS Image,
      
      sender.Name             AS SenderName,
      sender.PhoneNumber      AS SenderPhone,
      CONCAT(ST_Y(sender.GPSLocation), ',', ST_X(sender.GPSLocation)) AS SenderGPS,
      sender.ProfilePicture   AS SenderImage,
      
      receiver.Name           AS ReceiverName,
      receiver.PhoneNumber    AS ReceiverPhone,
      CONCAT(ST_Y(receiver.GPSLocation), ',', ST_X(receiver.GPSLocation)) AS ReceiverGPS,
      receiver.ProfilePicture AS ReceiverImage
      
    FROM deliveryorders d
    JOIN users sender   ON d.SenderID   = sender.UserID
    JOIN users receiver ON d.ReceiverID = receiver.UserID
    LEFT JOIN orderitems oi ON d.OrderID = oi.OrderID
    WHERE d.ReceiverID = ?
    GROUP BY d.OrderID
    ORDER BY d.OrderID DESC
  `;
 
  conn.query(sql, [userID], (err, result) => {
    if (err) {
      console.error('[user] /showMe error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) return res.status(200).json([]);
    
    const orders = (result as any[]).map((d: any) => {
      const toNumber = (val: any): number => {
        if (val === null || val === undefined) return 0.0;
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const parsed = parseFloat(val);
          return isNaN(parsed) ? 0.0 : parsed;
        }
        const str = String(val);
        const parsed = parseFloat(str);
        return isNaN(parsed) ? 0.0 : parsed;
      };

      return {
        orderId: d.OrderID ? Number(d.OrderID) : 0,
        senderId: d.SenderID ? Number(d.SenderID) : 0,
        receiverId: d.ReceiverID ? Number(d.ReceiverID) : 0,
        riderId: d.RiderID ? Number(d.RiderID) : null,
        
        name: d.Detail?.toString() ?? '',
        detail: d.Detail?.toString() ?? '',
        status: d.Status?.toString() ?? '',
        
        senderName: d.SenderName?.toString() ?? '',
        senderPhone: d.SenderPhone?.toString() ?? '',
        senderLocation: d.SenderGPS?.toString() ?? '0.0,0.0', 
        senderProfilePicture: d.SenderImage?.toString() ?? '',
        
        receiverName: d.ReceiverName?.toString() ?? '',
        receiverPhone: d.ReceiverPhone?.toString() ?? '',
        receiverLocation: d.ReceiverGPS?.toString() ?? '0.0,0.0',  
        receiverProfilePicture: d.ReceiverImage?.toString() ?? '',
        
        profilePicture: d.Image ? (d.Image as string).split('|')[0]?.trim() ?? '' : '',
        images: d.Image ? (d.Image as string).split(' | ') : [],
        
        createdAt: d.CreatedAt?.toString() ?? '',
        updatedAt: d.UpdatedAt?.toString() ?? '',
      };
    });
    
    console.log('[showMe] ✅ Returning:', orders.length, 'orders');
    return res.status(200).json(orders);
  });
});
 
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  console.log('[user] GET /:userId →', userId);

  conn.query('SELECT * FROM users WHERE UserID != ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(200).json([]);

    const users = result.map((u: any) => ({
      UserID:         u.UserID,
      Name:           u.Name           ?? '',
      PhoneNumber:    u.PhoneNumber    ?? '',
      GPSLocation:    u.GPSLocation    ?? '0.0,0.0',
      ProfilePicture: u.ProfilePicture ?? '',
      Address:        u.Address        ?? '',
      Email:          u.Email          ?? '',
    }));
    return res.status(200).json(users);
  });
});
