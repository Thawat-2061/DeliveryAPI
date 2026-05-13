import express from 'express';
import { conn } from '../dbconn';

export const router = express.Router();

// Search Users
// Search Users
router.get('/search', async (req, res) => {
    const q = `%${(req.query.q as string) ?? ''}%`;

    try {
        const result = await conn.query(
            `SELECT
                "UserID",
                "Name",
                "PhoneNumber",
                ST_X("GPSLocation"::geometry) AS "gpsLatitude",
                ST_Y("GPSLocation"::geometry) AS "gpsLongitude",
                "ProfilePicture",
                "Address",
                "Email"
             FROM users
             WHERE "PhoneNumber" ILIKE $1 OR "Name" ILIKE $2
             LIMIT 30`,
            [q, q]
        );

        const users = result.rows.map((u: any) => ({
            userId:         u.UserID,
            name:           u.Name           ?? '',
            phoneNumber:    u.PhoneNumber    ?? '',
            gpsLatitude:    Number(u.gpsLatitude)  || 0.0,
            gpsLongitude:   Number(u.gpsLongitude) || 0.0,
            profilePicture: u.ProfilePicture ?? '',
            address:        u.Address        ?? '',
            email:          u.Email          ?? '',
        }));

        return res.status(200).json(users);

    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});
// Show Orders by SenderID
router.get('/show/:SenderID', async (req, res) => {
    const { SenderID } = req.params;
    try {
        const result = await conn.query(
            `SELECT
                d."OrderID",
                d."SenderID",
                d."ReceiverID",
                d."RiderID",
                d."Status",
                d."CreatedAt",
                d."UpdatedAt",
                STRING_AGG(oi."Description", ' | ') AS "Detail",
                STRING_AGG(oi."ItemPicture",  ' | ') AS "Image",
                receiver."Name"           AS "CustomerName",
                receiver."PhoneNumber"    AS "CustomerPhone",
                ST_Y(receiver."GPSLocation"::geometry) || ',' || ST_X(receiver."GPSLocation"::geometry) AS "CustomerGPS",
                receiver."ProfilePicture" AS "CustomerImage",
                sender."Name"             AS "SenderName",
                sender."PhoneNumber"      AS "SenderPhone",
                ST_Y(sender."GPSLocation"::geometry) || ',' || ST_X(sender."GPSLocation"::geometry) AS "SenderGPS",
                sender."ProfilePicture"   AS "SenderImage"
             FROM deliveryorders d
             JOIN users receiver ON d."ReceiverID" = receiver."UserID"
             JOIN users sender   ON d."SenderID"   = sender."UserID"
             LEFT JOIN orderitems oi ON d."OrderID" = oi."OrderID"
             WHERE d."SenderID" = $1
             GROUP BY d."OrderID", receiver."UserID", sender."UserID"
             ORDER BY d."OrderID" DESC`,
            [SenderID]
        );

        if (result.rows.length === 0) return res.status(200).json([]);

        const orders = result.rows.map((d: any) => ({
            orderId:                d.OrderID,
            senderId:               d.SenderID,
            receiverId:             d.ReceiverID,
            riderId:                d.RiderID,
            name:                   d.Detail ?? '',
            detail:                 d.Detail ?? '',
            status:                 d.Status ?? '',
            customerName:           d.CustomerName  ?? '',
            customerPhone:          d.CustomerPhone ?? '',
            customerLocation:       d.CustomerGPS   ?? '0.0,0.0',
            senderLocation:         d.SenderGPS     ?? '0.0,0.0',
            profilePicture:         d.Image?.split('|')[0]?.trim() ?? '',
            images:                 d.Image ? d.Image.split(' | ') : [],
            customerProfilePicture: d.CustomerImage ?? '',
            senderProfilePicture:   d.SenderImage   ?? '',
            createdAt:              d.CreatedAt ?? '',
            updatedAt:              d.UpdatedAt ?? '',
        }));

        return res.status(200).json(orders);
    } catch (err) {
        console.error('SHOW ERROR:', err);
        res.status(500).json({ error: (err as Error).message });
    }
});

// Show Orders by ReceiverID
router.get('/showMe/:UserID', async (req, res) => {
    const { UserID } = req.params;
    try {
        const result = await conn.query(
            `SELECT
                d."OrderID",
                d."SenderID",
                d."ReceiverID",
                d."RiderID",
                d."Status",
                d."CreatedAt",
                d."UpdatedAt",
                STRING_AGG(oi."Description", ' | ') AS "Detail",
                STRING_AGG(oi."ItemPicture",  ' | ') AS "Image",
                sender."Name"             AS "SenderName",
                sender."PhoneNumber"      AS "SenderPhone",
                ST_Y(sender."GPSLocation"::geometry) || ',' || ST_X(sender."GPSLocation"::geometry) AS "SenderGPS",
                sender."ProfilePicture"   AS "SenderImage",
                receiver."Name"           AS "ReceiverName",
                receiver."PhoneNumber"    AS "ReceiverPhone",
                ST_Y(receiver."GPSLocation"::geometry) || ',' || ST_X(receiver."GPSLocation"::geometry) AS "ReceiverGPS",
                receiver."ProfilePicture" AS "ReceiverImage"
             FROM deliveryorders d
             JOIN users sender   ON d."SenderID"   = sender."UserID"
             JOIN users receiver ON d."ReceiverID" = receiver."UserID"
             LEFT JOIN orderitems oi ON d."OrderID" = oi."OrderID"
             WHERE d."ReceiverID" = $1
             GROUP BY d."OrderID", sender."UserID", receiver."UserID"
             ORDER BY d."OrderID" DESC`,
            [UserID]
        );

        if (result.rows.length === 0) return res.status(200).json([]);

        const orders = result.rows.map((d: any) => ({
            orderId:                d.OrderID   ? Number(d.OrderID)    : 0,
            senderId:               d.SenderID  ? Number(d.SenderID)   : 0,
            receiverId:             d.ReceiverID ? Number(d.ReceiverID) : 0,
            riderId:                d.RiderID   ? Number(d.RiderID)    : null,
            name:                   d.Detail?.toString()       ?? '',
            detail:                 d.Detail?.toString()       ?? '',
            status:                 d.Status?.toString()       ?? '',
            senderName:             d.SenderName?.toString()   ?? '',
            senderPhone:            d.SenderPhone?.toString()  ?? '',
            senderLocation:         d.SenderGPS?.toString()    ?? '0.0,0.0',
            senderProfilePicture:   d.SenderImage?.toString()  ?? '',
            receiverName:           d.ReceiverName?.toString()  ?? '',
            receiverPhone:          d.ReceiverPhone?.toString() ?? '',
            receiverLocation:       d.ReceiverGPS?.toString()   ?? '0.0,0.0',
            receiverProfilePicture: d.ReceiverImage?.toString() ?? '',
            profilePicture:         d.Image ? (d.Image as string).split('|')[0]?.trim() ?? '' : '',
            images:                 d.Image ? (d.Image as string).split(' | ') : [],
            createdAt:              d.CreatedAt?.toString() ?? '',
            updatedAt:              d.UpdatedAt?.toString() ?? '',
        }));

        return res.status(200).json(orders);
    } catch (err) {
        console.error('SHOWME ERROR:', err);
        res.status(500).json({ error: (err as Error).message });
    }
});
// Get All Users except userId
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await conn.query(
            `SELECT * FROM users WHERE "UserID" != $1`,
            [userId]
        );

        if (result.rows.length === 0) return res.status(200).json([]);

        const users = result.rows.map((u: any) => ({
            UserID:         u.UserID,
            Name:           u.Name           ?? '',
            PhoneNumber:    u.PhoneNumber    ?? '',
            GPSLocation:    u.GPSLocation    ?? '0.0,0.0',
            ProfilePicture: u.ProfilePicture ?? '',
            Address:        u.Address        ?? '',
            Email:          u.Email          ?? '',
        }));

        return res.status(200).json(users);

    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});