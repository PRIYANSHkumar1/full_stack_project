import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import 'dotenv/config';

import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://full-stack-project-frontend-6cyo.onrender.com',
      // Add any other frontend URLs if needed
    ];
    
    if (process.env.NODE_ENV === 'development') {
      // In development, allow any localhost origin
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For production debugging, log rejected origins
    if (process.env.NODE_ENV === 'production') {
      console.log('CORS rejected origin:', origin);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // Support legacy browsers
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __dirname = path.resolve(); // Set {__dirname} to current working directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1', healthRoutes);
//-------------------------------------


if (process.env.NODE_ENV === 'development') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '/frontend/build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}


//-------------------------------------
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
