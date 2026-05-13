import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { conn } from '../dbconn';
import { UploadPostRequest } from '../model/UploadModel';

export const router = express.Router();

const makeDir = (dir: string) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
makeDir('uploads/images');
makeDir('uploads/order');
makeDir('uploads/statusOrder');

const makeStorage = (folder: string) =>
    multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, `uploads/${folder}`),
        filename: (_req, file, cb) => {
            const unique = Math.round(Math.random() * 100000);
            cb(null, unique + path.extname(file.originalname || '.png'));
        },
    });

const uploaders = {
    images:      multer({ storage: makeStorage('images'),      limits: { fileSize: 67108864 } }),
    order:       multer({ storage: makeStorage('order'),       limits: { fileSize: 67108864 } }),
    statusOrder: multer({ storage: makeStorage('statusOrder'), limits: { fileSize: 67108864 } }),
};

// POST /upload/
router.post('/', uploaders.images.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.status(200).json({ filename: req.file.filename, url: `uploads/images/${req.file.filename}` });
});

// POST /upload/order
router.post('/order', uploaders.order.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.status(200).json({ filename: req.file.filename, url: `uploads/order/${req.file.filename}` });
});

// POST /upload/upstatus
router.post('/upstatus', uploaders.statusOrder.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.status(200).json({ filename: req.file.filename, url: `uploads/statusOrder/${req.file.filename}` });
});

// Update User Image
router.post('/update', async (req, res) => {
    const { Image, UserID }: UploadPostRequest = req.body;

    try {
        const result = await conn.query(
            `UPDATE users SET "ProfilePicture" = $1 WHERE "UserID" = $2`,
            [Image, UserID]
        );
        res.status(200).json({ affected_rows: result.rowCount });

    } catch (err) {
        res.status(500).json({ error: 'Failed to update data' });
    }
});

// Update Rider Image
router.post('/updateRider', async (req, res) => {
    const { RiderID, Image } = req.body;

    try {
        const result = await conn.query(
            `UPDATE riders SET "ProfilePicture" = $1 WHERE "RiderID" = $2`,
            [Image, RiderID]
        );
        res.status(200).json({ affected_rows: result.rowCount });

    } catch (err) {
        res.status(500).json({ error: 'Failed to update data' });
    }
});

// Update Order Image & Status
router.post('/imageUP', async (req, res) => {
    const { OrderID, Image, Status } = req.body;

    try {
        const result = await conn.query(
            `UPDATE deliveryorders SET "Image" = $1, "Status" = $2 WHERE "OrderID" = $3`,
            [Image, Status, OrderID]
        );
        res.status(200).json({ affected_rows: result.rowCount });

    } catch (err) {
        res.status(500).json({ error: 'Failed to update data' });
    }
});