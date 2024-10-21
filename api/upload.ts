import express from "express";
import path from "path";
import multer from "multer";
import { conn } from "../dbconn";
export const router = express.Router();
import mysql from "mysql";
// import {  UploadPostRequest } from '../model/upload_res';
import { Request, Response } from "express"; // Import Express types if not already imported

import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL,deleteObject } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyC0VTfNMh9G9KbOj7QAosHKSqtRbDDj1mg",
    authDomain: "delivery-67f06.firebaseapp.com",
    projectId: "delivery-67f06",
    storageBucket: "delivery-67f06.appspot.com",
    messagingSenderId: "271363591909",
    appId: "1:271363591909:web:69239a743f419f05b98e0c",
    measurementId: "G-KR83WCFFRS"
  };


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

