import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ScanRepository } from '@weblens/database';
import { ScanService } from './services/scanService.js';
import { createScanRouter } from './routes/scans.js';
import { createReportRouter } from './routes/reports.js';
import { createDemoRouter } from './routes/demo.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Repository and Services
const repository = new ScanRepository();
const scanService = new ScanService(repository);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Routes
app.use('/api/scans', createScanRouter(scanService));
app.use('/api/reports', createReportRouter(scanService, repository));
app.use('/api/demo', createDemoRouter());

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[WebLens Server Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 WebLens API Server is running on http://localhost:${PORT}`);
});

export { app, scanService, repository };
