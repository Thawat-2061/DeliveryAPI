import http from 'http';
import express from 'express';
import { app } from './app';
import { conn } from './dbconn';

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

const port = Number(process.env.PORT) || 3000;
const server = http.createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

// ทดสอบ DB connection
conn.connect((err, client, release) => {
  if (err) {
    console.error('DB ERROR:', err);
  } else {
    console.log('DB CONNECTED');
    release();
  }
});