export interface RegisterPostRequest {
    // UserId: number; // ไม่ต้องส่ง UserId เนื่องจากจะถูกสร้างโดยอัตโนมัติ
    Username: string;
    Email: string;
    Password: string;
    Phone: number;
    Image: string;
    VehicleRegistration: string;
}