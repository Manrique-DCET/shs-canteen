require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allows all origins. For production, specify your frontend URLs.
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;

// Attach Socket.IO to the app so routes can use it
app.set('io', io);

// WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // You can use rooms to segment notifications (e.g., a room for each stall, or room for specific students)
  socket.on('joinStall', (stallName) => {
    socket.join(`stall_${stallName}`);
    console.log(`Socket ${socket.id} joined room stall_${stallName}`);
  });

  socket.on('joinStudent', (studentId) => {
    socket.join(`student_${studentId}`);
    console.log(`Socket ${socket.id} joined room student_${studentId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/', (req, res) => {
  res.send('SHS Canteen API is running...');
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
