// server/src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import telemetryRoutes from './routes/telemetry.js';
import dustbinRoutes from './routes/dustbins.js';
import foodWasteRoutes from './routes/foodWaste.js';
import waterRoutes from './routes/water.js';
import energyRoutes from './routes/energy.js';
import rewardsRoutes from './routes/rewards.js';
import rainwaterRoutes from './routes/rainwater.js';
import airQualityRoutes from './routes/airQuality.js';
import aiRoutes from './routes/ai.js';
import { isGeminiConfigured } from './config/gemini.js';
import { isSupabaseConfigured } from './config/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// System Health & Diagnostics
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'AI Campus Environmental & Sustainability Intelligence System',
    timestamp: new Date().toISOString(),
    services: {
      geminiAI: isGeminiConfigured ? 'READY (API Key Active)' : 'EMULATED (Deterministic Mathematical Engine)',
      database: isSupabaseConfigured ? 'CONNECTED (Supabase PostgreSQL)' : 'READY (In-Memory Reactive Store)',
    },
    version: '1.0.0',
  });
});

// Mount /api/v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/telemetry', telemetryRoutes);
app.use('/api/v1/dustbins', dustbinRoutes);
app.use('/api/v1/food-waste', foodWasteRoutes);
app.use('/api/v1/water', waterRoutes);
app.use('/api/v1/energy', energyRoutes);
app.use('/api/v1/rewards', rewardsRoutes);
app.use('/api/v1/rainwater', rainwaterRoutes);
app.use('/api/v1/air-quality', airQualityRoutes);
app.use('/api/v1/ai', aiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route Not Found',
    path: req.originalUrl,
    message: 'The requested API route does not exist.',
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error Catch]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected server error occurred.',
  });
});

app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🌿 CampusEco AI Sustainability Server running on port ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api/v1`);
  console.log(`🤖 Gemini AI status: ${isGeminiConfigured ? 'Enabled' : 'Heuristic Engine'}`);
  console.log(`🗄️  Supabase status: ${isSupabaseConfigured ? 'Connected' : 'In-Memory Store'}`);
  console.log('================================================================');
});

export default app;
