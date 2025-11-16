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

// make io available to routes/controllers
app.set('io', io);

app.use('/api', routes);

const PORT = process.env.PORT || 4000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/brand_monitor';

// Improved MongoDB connection with retry logic
let mongoConnected = false;

async function connectMongo() {
  try {
    await mongoose.connect(MONGO, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    });
    mongoConnected = true;
    console.log('✓ Mongo connected');
    return true;
  } catch (err) {
    console.error('✗ Mongo connection error:', err.message);
    console.log('⚠ Server will start but collectors cannot save data without MongoDB');
    console.log('  Make sure MongoDB is running or set MONGO_URI in .env file');
    mongoConnected = false;
    return false;
  }
}

// Start server regardless of MongoDB connection status
async function startServer() {
  await connectMongo();
  
  server.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    if (!mongoConnected) {
      console.log('⚠ Warning: MongoDB not connected - data will not be saved');
    }
  });
  
  // Start collectors manager (will handle MongoDB errors internally)
  collectors.start(io);
  
  // Retry MongoDB connection every 30 seconds if not connected
  if (!mongoConnected) {
    const retryInterval = setInterval(async () => {
      if (!mongoConnected) {
        console.log('Retrying MongoDB connection...');
        const connected = await connectMongo();
        if (connected) {
          clearInterval(retryInterval);
          console.log('✓ MongoDB reconnected successfully');
        }
      } else {
        clearInterval(retryInterval);
      }
    }, 30000);
  }
}

startServer();
