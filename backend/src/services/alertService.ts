import { ScanRepository } from '@weblens/database';
import { Logger } from '../utils/logger.js';

export interface DispatchAlertParams {
  userId: string;
  siteId?: string | null;
  scanId: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  title: string;
  message: string;
  domain: string;
  score?: number;
  delta?: number | null;
}

export class AlertService {
  private repo: ScanRepository;

  constructor(repo?: ScanRepository) {
    this.repo = repo || new ScanRepository();
  }

  async dispatch(params: DispatchAlertParams): Promise<void> {
    const webhooks = this.repo.getWebhooksByUserId(params.userId);
    const activeDestinations = webhooks.filter(w => w.isActive);

    // If no external webhooks, record an in-app alert
    if (activeDestinations.length === 0) {
      this.repo.createAlert({
        userId: params.userId,
        siteId: params.siteId,
        scanId: params.scanId,
        severity: params.severity,
        title: params.title,
        message: params.message,
        channel: 'email'
      });
      return;
    }

    // Dispatch to all configured channels
    for (const dest of activeDestinations) {
      try {
        if (dest.type === 'slack') {
          await this.sendSlack(dest.url, params);
        } else if (dest.type === 'discord') {
          await this.sendDiscord(dest.url, params);
        } else {
          await this.sendGenericWebhook(dest.url, params);
        }

        this.repo.createAlert({
          userId: params.userId,
          siteId: params.siteId,
          scanId: params.scanId,
          severity: params.severity,
          title: params.title,
          message: params.message,
          channel: dest.type
        });
      } catch (err: any) {
        Logger.warn(`Failed to dispatch alert to ${dest.name} (${dest.type})`, { url: dest.url }, err);
      }
    }
  }

  private async sendSlack(webhookUrl: string, params: DispatchAlertParams): Promise<void> {
    const color = params.severity === 'critical' ? '#F43F5E' : params.severity === 'high' ? '#F97316' : '#3B82F6';
    const payload = {
      text: `🚨 *WebLens Alert:* ${params.title}`,
      attachments: [
        {
          color,
          title: params.title,
          text: params.message,
          fields: [
            { title: 'Domain', value: params.domain, short: true },
            { title: 'Score', value: params.score ? `${params.score}/100` : 'N/A', short: true },
            { title: 'Change', value: params.delta ? `${params.delta > 0 ? '+' : ''}${params.delta}` : 'None', short: true },
            { title: 'Severity', value: params.severity.toUpperCase(), short: true },
          ],
          footer: 'WebLens Continuous Monitoring',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  private async sendDiscord(webhookUrl: string, params: DispatchAlertParams): Promise<void> {
    const color = params.severity === 'critical' ? 16007006 : params.severity === 'high' ? 16347926 : 3899894;
    const payload = {
      content: `🚨 **WebLens Alert:** ${params.title}`,
      embeds: [
        {
          title: params.domain,
          description: params.message,
          color,
          fields: [
            { name: 'Score', value: params.score ? `${params.score}/100` : 'N/A', inline: true },
            { name: 'Change', value: params.delta ? `${params.delta > 0 ? '+' : ''}${params.delta}` : 'None', inline: true },
            { name: 'Severity', value: params.severity.toUpperCase(), inline: true },
          ],
          footer: { text: 'WebLens Automated Monitoring' },
          timestamp: new Date().toISOString()
        }
      ]
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  private async sendGenericWebhook(webhookUrl: string, params: DispatchAlertParams): Promise<void> {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'WebLens-Webhook/1.0' },
      body: JSON.stringify({
        event: 'weblens.alert',
        timestamp: new Date().toISOString(),
        data: params
      })
    });
  }
}
