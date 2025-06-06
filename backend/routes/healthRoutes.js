import express from 'express';

const router = express.Router();

// Health check endpoint for deployment monitoring
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// CORS preflight endpoint
router.options('*', (req, res) => {
  res.status(200).end();
});

export default router;
