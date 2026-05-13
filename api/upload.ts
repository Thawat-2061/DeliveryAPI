import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { conn } from '../dbconn';
import { UploadPostRequest } from '../model/UploadModel';

export const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

// ใช้ memoryStorage แทน diskStorage เพราะ Vercel ไม่มี disk
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 67108864 }
});

const uploadToSupabase = async (bucket: string, file: Express.Multer.File) => {
    const ext = file.originalname.match(/\.[^.]+$/)?.[0] || '.png';
    const filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;

    console.log('=== UPLOAD DEBUG ===');
    console.log('bucket:', bucket);
    console.log('filename:', filename);
    console.log('mimetype:', file.mimetype);
    console.log('buffer length:', file.buffer?.length);
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
    console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');
    console.log('SUPABASE_URL value:', process.env.SUPABASE_URL);
    console.log('SUPABASE_SERVICE_KEY value:', process.env.SUPABASE_SERVICE_KEY);

    const { error } = await supabase.storage
        .from(bucket)
        .upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) {
        console.log('Supabase error:', JSON.stringify(error, null, 2)); // ดู error เต็มๆ
        throw new Error(error.message);
    }

    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filename);

    return { filename, url: data.publicUrl };
};
// POST /upload/
router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    try {
        const result = await uploadToSupabase('images', req.file);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// POST /upload/order
router.post('/order', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    try {
        const result = await uploadToSupabase('order', req.file);
        res.status(200).json(result);
        } catch (err) {
        console.error('Upload order error:', err); // เพิ่ม log
        res.status(500).json({ error: (err as Error).message });
    }
});

// POST /upload/upstatus
router.post('/upstatus', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    try {
        const result = await uploadToSupabase('statusOrder', req.file);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
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