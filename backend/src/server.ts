import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ScanRepository } from '@weblens/database';
import { ScanService } from './services/scanService.js';
import { AuthService } from './services/authService.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { createScanRouter } from './routes/scans.js';
import { createReportRouter } from './routes/reports.js';
import { createDemoRouter } from './routes/demo.js';
import { createAuthRouter } from './routes/auth.js';
import { createProjectRouter } from './routes/projects.js';
import { createHistoryRouter } from './routes/history.js';
import { createAiRouter } from './routes/ai.js';

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

// Initialize Repositories and Services
const repository = new ScanRepository();
const scanService = new ScanService(repository);
const authService = new AuthService(repository);

// Auth Middleware (populates req.user)
app.use(createAuthMiddleware(authService));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Mount Routes
app.use('/api/auth', createAuthRouter(authService));
app.use('/api/projects', createProjectRouter(repository));
app.use('/api/history', createHistoryRouter(repository, scanService));
app.use('/api/ai', createAiRouter());
app.use('/api/scans', createScanRouter(scanService, repository));
app.use('/api/reports', createReportRouter(scanService, repository));
app.use('/api/demo', createDemoRouter());

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[WebLens Server Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 WebLens API Server is running on http://localhost:${PORT}`);
  });
}

export { app, scanService, repository, authService };
