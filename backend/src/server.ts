import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ScanRepository } from '@weblens/database';
import { ScanService } from './services/scanService.js';
import { AuthService } from './services/authService.js';
import { MonitorService } from './services/monitorService.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { createScanRouter } from './routes/scans.js';
import { createReportRouter } from './routes/reports.js';
import { createDemoRouter } from './routes/demo.js';
import { createAuthRouter } from './routes/auth.js';
import { createProjectRouter } from './routes/projects.js';
import { createHistoryRouter } from './routes/history.js';
import { createAiRouter } from './routes/ai.js';
import { createMonitoringRouter } from './routes/monitoring.js';
import { createCompetitorRouter } from './routes/competitor.js';
import { createTeamRouter } from './routes/teams.js';
import { createWhiteLabelRouter } from './routes/whiteLabel.js';
import { createPublicApiRouter } from './routes/v1/api.js';
import { createAdminRouter } from './routes/admin.js';
import { createBillingRouter } from './routes/billing.js';
import { Logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Production Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// 2. CORS & JSON Body Parser
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key']
}));
app.use(express.json({ limit: '5mb' }));

// 3. Initialize Repositories and Services
const repository = new ScanRepository();
const scanService = new ScanService(repository);
const authService = new AuthService(repository);
const monitorService = new MonitorService(repository, scanService);

// 4. Start Monitoring Scheduler in background
if (process.env.NODE_ENV !== 'test') {
  monitorService.startScheduler(60000);
}

// 5. Auth Middleware (populates req.user from JWT if provided)
app.use(createAuthMiddleware(authService));

// 6. Deep Health & Observability Endpoint
app.get('/api/health', (_req, res) => {
  const memory = process.memoryUsage();
  res.json({
    status: 'healthy',
    version: '1.0.0',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    system: {
      nodeVersion: process.version,
      memoryRssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
      memoryHeapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
    },
    workers: scanService.queueStats,
    database: {
      status: 'connected',
      engine: 'node:sqlite',
    }
  });
});

// 7. Mount REST Routes (Phases 1-4)
app.use('/api/auth', createAuthRouter(authService));
app.use('/api/projects', createProjectRouter(repository));
app.use('/api/history', createHistoryRouter(repository, scanService));
app.use('/api/ai', createAiRouter());
app.use('/api/scans', createScanRouter(scanService, repository));
app.use('/api/reports', createReportRouter(scanService, repository));
app.use('/api/demo', createDemoRouter());
app.use('/api/monitoring', createMonitoringRouter(repository));
app.use('/api/competitor', createCompetitorRouter(scanService));
app.use('/api/teams', createTeamRouter(repository));
app.use('/api/white-label', createWhiteLabelRouter(repository));
app.use('/api/v1', createPublicApiRouter(scanService, repository));
app.use('/api/admin', createAdminRouter(repository, scanService));
app.use('/api/billing', createBillingRouter(repository));

// 8. Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  Logger.error('Unhandled Server Error', { path: _req.path, method: _req.method }, err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// 9. Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    Logger.info(`🚀 WebLens Commercial API Server is running on port ${PORT}`);
  });
}

export { app, scanService, repository, authService, monitorService };
