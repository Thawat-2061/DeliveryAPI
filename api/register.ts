import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn';
import bcrypt from 'bcryptjs';

export const router = express.Router();


const saltRounds = 10;