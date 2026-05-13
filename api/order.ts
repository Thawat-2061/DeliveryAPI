import express from 'express';
import { conn } from '../dbconn';

export const router = express.Router();

const statusMap: Record<string, string> = {
    'รอไรเดอร์':    'AwaitingPickup',
    'ไรเดอร์รับงาน': 'RiderAssigned',
    'กำลังจัดส่ง':  'InTransit',
    'จัดส่งสำเร็จ': 'Delivered',
    'AwaitingPickup': 'AwaitingPickup',
    'RiderAssigned':  'RiderAssigned',
    'InTransit':      'InTransit',
    'Delivered':      'Delivered',
};

// Create Order
router.post('/', async (req, res) => {
    const { SenderID, ReceiverID, Name, Detail, Status, Image } = req.body;

    if (!SenderID || !ReceiverID || !Name || !Status) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const finalStatus = statusMap[Status] || 'AwaitingPickup';
    const client = await conn.connect();

    try {
        await client.query('BEGIN');

        const orderResult = await client.query(
            `INSERT INTO deliveryorders ("SenderID", "ReceiverID", "RiderID", "Status")
             VALUES ($1, $2, NULL, $3)
             RETURNING "OrderID"`,
            [SenderID, ReceiverID, finalStatus]
        );

        const orderId = orderResult.rows[0].OrderID;

        await client.query(
            `INSERT INTO orderitems ("OrderID", "Description", "ItemPicture")
             VALUES ($1, $2, $3)`,
            [orderId, Detail || Name, Image || '']
        );

        await client.query('COMMIT');

        res.status(201).json({ message: 'Order created successfully', orderId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[order] error:', err);
        res.status(500).json({ error: (err as Error).message });

    } finally {
        client.release();
    }
});

// Get Order Detail
router.get('/detail/:OrderID', async (req, res) => {
    const { OrderID } = req.params;

    try {
        const result = await conn.query(
            `SELECT
                d.*,
                u."Name"        AS "CustomerName",
                u."PhoneNumber" AS "CustomerPhone",
                ST_X(u."GPSLocation") AS "CustomerLat",
                ST_Y(u."GPSLocation") AS "CustomerLong",
                sender."Name"        AS "SenderName",
                sender."PhoneNumber" AS "SenderPhone",
                ST_X(sender."GPSLocation") AS "SenderLat",
                ST_Y(sender."GPSLocation") AS "SenderLong"
             FROM deliveryorders d
             JOIN users u      ON d."ReceiverID" = u."UserID"
             JOIN users sender ON d."SenderID"   = sender."UserID"
             WHERE d."OrderID" = $1`,
            [OrderID]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No data found' });
        }

        res.json(result.rows);

    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});