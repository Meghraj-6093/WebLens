import { Router, Request, Response } from 'express';
import { generateAIExplanation } from '@weblens/scanner';
import { AuditResult } from '@weblens/shared';

export function createAiRouter(): Router {
  const router = Router();

  // POST /api/ai/explain - Generate AI explanation for an issue
  router.post('/explain', (req: Request, res: Response) => {
    try {
      const issue = req.body as AuditResult;
      if (!issue || !issue.ruleId) {
        return res.status(400).json({ error: 'Valid issue payload with ruleId is required.' });
      }

      const explanation = generateAIExplanation(issue);
      return res.json(explanation);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'AI explanation synthesis failed.' });
    }
  });

  return router;
}
