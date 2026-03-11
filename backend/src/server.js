import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import connectDB from './db.js';
import userRoutes from './routes/userRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import collabRoutes from './routes/collabRoutes.js';
import { apiLimiter } from './middleware/rateLimiters.js';

dotenv.config();


connectDB();

const app = express();

app.set('trust proxy', 1);

const normalizeOrigin = (value = '') => value.trim().replace(/\/+$/, '').toLowerCase();
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(o => normalizeOrigin(o.trim()))
  : ['http://localhost:5173', 'https://book-heaven-taw6.vercel.app'];

console.log('Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    const normalizedOrigin = normalizeOrigin(origin || '');
    console.log(`CORS Request from: ${origin} (Normalized: ${normalizedOrigin})`);
    
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
      return;
    }
    
    console.warn(`CORS blocked for: ${origin}`);
    callback(null, false);
  },
  credentials: true,
};


app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use('/api', apiLimiter);


app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/collab', collabRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'API is running...',
    dbState: mongoose.connection.readyState, 
    dbName: mongoose.connection?.name || 'none',
  });
});


app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

export default app;
