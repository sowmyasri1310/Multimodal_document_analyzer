import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import documentRoutes from './routes/documentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for client
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.resolve('uploads')));

// Routes
app.use('/api/documents', documentRoutes);

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Database Connection and Server Startup
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB successfully connected.');
  })
  .catch((err) => {
    console.error('MongoDB database connection failure:', err);
  });

// Only listen locally, Vercel will wrap Express automatically in serverless functions without app.listen()
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running in development mode on port ${PORT}`);
  });
}

export default app;
