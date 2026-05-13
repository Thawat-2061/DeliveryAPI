import express from 'express';
import { conn } from '../dbconn';

export const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await conn.query(
            `SELECT
                d."OrderID"        AS "orderId",
                d."Status"         AS "status",
                d."CreatedAt",
                s."UserID"         AS "senderId",
                s."Name"           AS "senderName",
                s."PhoneNumber"    AS "senderPhone",
                s."ProfilePicture" AS "senderProfilePicture",
                ST_Y(s."GPSLocation"::geometry) || ',' || ST_X(s."GPSLocation"::geometry) AS "senderLocation",
                r."UserID"         AS "receiverId",
                r."Name"           AS "customerName",
                r."PhoneNumber"    AS "customerPhone",
                r."ProfilePicture" AS "customerProfilePicture",
                ST_Y(r."GPSLocation"::geometry) || ',' || ST_X(r."GPSLocation"::geometry) AS "customerLocation",
                oi."Description"   AS "itemName",
                oi."ItemPicture"   AS "itemPicture"
             FROM deliveryorders d
             JOIN users s  ON d."SenderID"   = s."UserID"
             JOIN users r  ON d."ReceiverID" = r."UserID"
             LEFT JOIN orderitems oi ON d."OrderID" = oi."OrderID"
             WHERE d."RiderID" IS NULL
               AND d."Status" = 'AwaitingPickup'
             ORDER BY d."CreatedAt" DESC`
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No data found" });
        }

        const orders = result.rows.map((d: any) => ({
            orderId:                d.orderId        ? Number(d.orderId)   : 0,
            status:                 d.status?.toString()                   ?? '',
            createdAt:              d.CreatedAt?.toString()                ?? '',
            senderId:               d.senderId       ? Number(d.senderId)  : 0,
            senderName:             d.senderName?.toString()               ?? '',
            senderPhone:            d.senderPhone?.toString()              ?? '',
            senderProfilePicture:   d.senderProfilePicture?.toString()    ?? '',
            senderLocation:         d.senderLocation?.toString()          ?? '0.0,0.0',
            receiverId:             d.receiverId     ? Number(d.receiverId): 0,
            customerName:           d.customerName?.toString()             ?? '',
            customerPhone:          d.customerPhone?.toString()            ?? '',
            customerProfilePicture: d.customerProfilePicture?.toString()  ?? '',
            customerLocation:       d.customerLocation?.toString()        ?? '0.0,0.0',
            itemName:               d.itemName?.toString()                 ?? '',
            itemPicture:            d.itemPicture?.toString()              ?? '',
        }));

        res.json(orders);

    } catch (err) {
        console.error('DB ERROR:', err);
        res.status(500).json({ error: (err as Error).message });
    }
});