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
                ST_Y(s."GPSLocation") || ',' || ST_X(s."GPSLocation") AS "senderLocation",
                r."UserID"         AS "receiverId",
                r."Name"           AS "customerName",
                r."PhoneNumber"    AS "customerPhone",
                r."ProfilePicture" AS "customerProfilePicture",
                ST_Y(r."GPSLocation") || ',' || ST_X(r."GPSLocation") AS "customerLocation",
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

        res.json(result.rows);

    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});