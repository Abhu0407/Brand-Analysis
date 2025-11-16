require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const routes = require('./routes');
const collectors = require('./collectors/collector-manager');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.set('io', io);
app.use('/api', routes);

const PORT = process.env.PORT || 4000;
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/brand_monitor';

let mongoConnected = false;
let retryInterval = null;

// -------------------------------
// MongoDB Connection Function
// -------------------------------
async function connectMongo() {
  try {
    await mongoose.connect(MONGO, {
      serverSelectionTimeoutMS: 5000, // 5s timeout
    });

    mongoConnected = true;
    console.log('✓ MongoDB connected');

    return true;
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    console.log('⚠ Collectors will not save data until MongoDB connects.');
    mongoConnected = false;

    return false;
  }
}

// -------------------------------
// Start Server
// -------------------------------
async function startServer() {
  // Try first connection
  await connectMongo();

  // Start Express Server Always
  server.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);

    if (!mongoConnected) {
      console.log('⚠ MongoDB not connected — running in no-database mode.');
    }
  });

  // Start collectors (they handle DB errors internally)
  collectors.start(io);

  // Retry Logic (only one interval)
  if (!mongoConnected) {
    retryInterval = setInterval(async () => {
      console.log('Retrying MongoDB connection...');
      const connected = await connectMongo();

      if (connected) {
        console.log('✓ MongoDB reconnected successfully');
        clearInterval(retryInterval);
      }
    }, 30000); // 30 seconds
  }
}

startServer();
