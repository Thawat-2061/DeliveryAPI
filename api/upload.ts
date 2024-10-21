import express from "express";
import multer from "multer";
import { Request, Response } from "express"; // Import Express types
import mysql from "mysql";
import bcrypt from 'bcryptjs';

// Firebase
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

// MySQL
import { conn } from "../dbconn"; // Import connection from your dbconn
import { UploadPostRequest } from "../model/UploadModel";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC0VTfNMh9G9KbOj7QAosHKSqtRbDDj1mg",
  authDomain: "delivery-67f06.firebaseapp.com",
  projectId: "delivery-67f06",
  storageBucket: "delivery-67f06.appspot.com",
  messagingSenderId: "20496632069",
  appId: "1:20496632069:android:6984f9bda2f114f5d1cf6c",
};



export const router = express.Router();


initializeApp(firebaseConfig);
const storage = getStorage();


class FileMiddleware {
    filename = "";
    public readonly diskLoader = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 67108864 
        }
    });
}
const fileupload = new FileMiddleware();


//add
router.post("/", fileupload.diskLoader.single("file"), async (req, res) => {
    const filename = Math.round(Math.random() * 100000) + '.png';
    const storageRef = ref(storage, "/images/" + filename);
    const metadata = { contentType: req.file!.mimetype };
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
    const url = await getDownloadURL(snapshot.ref);
    res.status(200).json({
        filename: filename,
        url :url
    });
});

//-------------------------------------------------------------------------------------------------


const saltRounds = 10;

router.post("/update", async (req, res) => {
    // รับข้อมูลจาก body
    let add: UploadPostRequest = req.body;
  
    // SQL คำสั่งอัปเดตข้อมูล
    let sql = "UPDATE `users` SET `Image` = ? WHERE `UserID` = ?";
    sql = mysql.format(sql, [add.Image, add.UserID]);
  
    // เรียกใช้คำสั่ง SQL
    conn.query(sql, (err, result) => {
      if (err) {
        console.error("Error updating data:", err);
        return res.status(500).json({ error: "Failed to update data" });
      }
      // ส่งผลลัพธ์กลับไปยังผู้ใช้
      res.status(200).json({ affected_rows: result.affectedRows });
    });
  });


// Route to upload and update file & database
// router.post("/upload/:id", upload.single("file"), async (req: Request, res: Response) => {
//   const fileId = req.params.id; // ID of the file to update in the database
//   const newFile = req.file; // New file to be uploaded

//   try {
//     // Check if a file was uploaded
//     if (!newFile) {
//       return res.status(400).send("No file uploaded.");
//     }

//     // Check for an existing record in the database
//     const query = `SELECT file_url FROM files WHERE id = ?`;
//     conn.query(query, [fileId], async (error, results) => {
//       if (error) {
//         console.error("Database error:", error);
//         return res.status(500).send("Failed to check existing record.");
//       }

//       if (results.length === 0) {
//         return res.status(404).send("Record not found.");
//       }

//       const oldFileUrl = results[0].file_url;

//       // If an old file exists, delete it from Firebase
//       if (oldFileUrl) {
//         const oldFileRef = ref(storage, oldFileUrl);
//         await deleteObject(oldFileRef);
//       }

//       // Upload the new file to Firebase Storage
//       const storageRef = ref(storage, `uploads/${newFile.originalname}`);
//       const uploadTask = uploadBytesResumable(storageRef, newFile.buffer, {
//         contentType: newFile.mimetype, // Specify the MIME type of the file
//       });

//       uploadTask.on(
//         "state_changed",
//         (snapshot) => {
//           // Optional: Track upload progress
//         },
//         (error) => {
//           console.error("Upload failed:", error);
//           return res.status(500).send("Failed to upload file.");
//         },
//         async () => {
//           // File uploaded successfully, get the download URL
//           const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

//           // Update the file URL in the database
//           const updateQuery = `UPDATE files SET file_url = ? WHERE id = ?`;
//           conn.query(updateQuery, [downloadURL, fileId], (error) => {
//             if (error) {
//               console.error("Failed to update database:", error);
//               return res.status(500).send("Failed to update record.");
//             }

//             res.status(200).send({
//               message: "File updated successfully",
//               downloadURL,
//             });
//           });
//         }
//       );
//     });
//   } catch (error) {
//     const err = error as Error;
//     console.error("Error during file update:", err.message);
//     res.status(500).send(`Error updating file: ${err.message}`);
//   }
// });
