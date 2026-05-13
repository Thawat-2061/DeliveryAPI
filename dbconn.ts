import { Pool } from "pg";

// ✅ Singleton — ไม่สร้าง Pool ใหม่ทุก request
declare global {
    var _pgPool: Pool | undefined;
}

export const conn = global._pgPool ?? (global._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,                    // จำกัด connection ต่อ 1 instance
    idleTimeoutMillis: 10000,  // ปิด connection ที่ไม่ได้ใช้หลัง 10 วิ
    connectionTimeoutMillis: 5000,
}));