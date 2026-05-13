import express from 'express';
import { conn } from '../dbconn';

export const router = express.Router();

const validStatuses = ['AwaitingPickup', 'RiderAssigned', 'InTransit', 'Delivered'];

function translateStatus(statusEn: string): string {
    const map: Record<string, string> = {
        'AwaitingPickup': 'รอไรเดอร์',
        'RiderAssigned':  'ไรเดอร์รับงาน',
        'InTransit':      'กำลังนำส่ง',
        'Delivered':      'ส่งสำเร็จ',
    };
    return map[statusEn] || statusEn;
}

router.put('/update', async (req, res) => {
    const { OrderID, RiderID, Status } = req.body;

    if (!OrderID || !Status) {
        return res.status(400).json({
            error: 'OrderID and Status are required',
            received: { OrderID, RiderID, Status }
        });
    }

    if (!validStatuses.includes(Status)) {
        return res.status(400).json({
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            received: Status
        });
    }

    const client = await conn.connect();

    try {
        await client.query('BEGIN');

        // Update order
        const updateResult = await client.query(
            `UPDATE deliveryorders
             SET "Status" = $1, "RiderID" = $2, "UpdatedAt" = NOW()
             WHERE "OrderID" = $3 AND "RiderID" IS NULL`,
            [Status, RiderID, OrderID]
        );

        if (updateResult.rowCount === 0) {
            // เช็คว่า order มีอยู่หรือถูกรับไปแล้ว
            const checkResult = await client.query(
                `SELECT "RiderID", "Status" FROM deliveryorders WHERE "OrderID" = $1`,
                [OrderID]
            );

            await client.query('ROLLBACK');

            if (checkResult.rows.length === 0) {
                return res.status(404).json({ message: 'Order not found', OrderID });
            }

            if (checkResult.rows[0].RiderID !== null) {
                return res.status(409).json({
                    message: 'This order has already been accepted by another rider',
                    assignedRiderId: checkResult.rows[0].RiderID,
                    currentStatus:   checkResult.rows[0].Status,
                });
            }

            return res.status(400).json({ message: 'Cannot update this order' });
        }

        // Log status update
        await client.query(
            `INSERT INTO orderstatusupdates ("OrderID", "Status", "UpdatedBy", "StatusPicture")
             VALUES ($1, $2, $3, NULL)`,
            [OrderID, Status, RiderID]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: {
                OrderID,
                RiderID,
                Status,
                StatusTH: translateStatus(Status),
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Update order error:', err);
        res.status(500).json({ error: (err as Error).message });

    } finally {
        client.release();
    }
});