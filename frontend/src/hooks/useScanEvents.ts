import { useState, useEffect } from 'react';
import { ScanStage, ScanStatus } from '@weblens/shared';
import { getScanStatus } from '../lib/api.js';

export interface ScanEventState {
  stage: ScanStage;
  progress: number;
  message: string;
  isCompleted: boolean;
  isFailed: boolean;
  errorMessage?: string | null;
  overallScore?: number | null;
}

export function useScanEvents(scanId: string | undefined) {
  const [state, setState] = useState<ScanEventState>({
    stage: 'connecting',
    progress: 5,
    message: 'Initializing scan...',
    isCompleted: false,
    isFailed: false,
  });

  useEffect(() => {
    if (!scanId) return;

    let eventSource: EventSource | null = null;
    let pollInterval: any = null;
    let isFinished = false;

    const startPollingFallback = () => {
      if (pollInterval) return;
      pollInterval = setInterval(async () => {
        if (isFinished) {
          clearInterval(pollInterval);
          return;
        }
        try {
          const status = await getScanStatus(scanId);
          if (status.status === 'completed') {
            isFinished = true;
            clearInterval(pollInterval);
            setState({
              stage: 'completed',
              progress: 100,
              message: 'Scan completed!',
              isCompleted: true,
              isFailed: false,
              overallScore: status.overallScore
            });
          } else if (status.status === 'failed') {
            isFinished = true;
            clearInterval(pollInterval);
            setState({
              stage: 'completed',
              progress: 100,
              message: status.errorMessage || 'Scan failed.',
              isCompleted: false,
              isFailed: true,
              errorMessage: status.errorMessage
            });
          } else if (status.stage && status.progress !== undefined) {
            setState(prev => ({
              ...prev,
              stage: status.stage as ScanStage,
              progress: status.progress || prev.progress,
            }));
          }
        } catch {
          // ignore poll errors
        }
      }, 1500);
    };

    try {
      eventSource = new EventSource(`/api/scans/${scanId}/events`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.status === 'failed' || data.error) {
            isFinished = true;
            setState({
              stage: 'completed',
              progress: 100,
              message: data.error || 'Scan failed.',
              isCompleted: false,
              isFailed: true,
              errorMessage: data.error
            });
            eventSource?.close();
            return;
          }

          if (data.completed || data.stage === 'completed' || data.status === 'completed') {
            isFinished = true;
            setState({
              stage: 'completed',
              progress: 100,
              message: 'Audit completed successfully!',
              isCompleted: true,
              isFailed: false,
              overallScore: data.overallScore
            });
            eventSource?.close();
            return;
          }

          setState(prev => ({
            ...prev,
            stage: (data.stage as ScanStage) || prev.stage,
            progress: typeof data.progress === 'number' ? data.progress : prev.progress,
            message: data.message || prev.message
          }));
        } catch {
          // Ignore JSON parse error
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        startPollingFallback();
      };

      // Also start polling after 2s if no SSE events delivered
      setTimeout(() => {
        if (!isFinished) {
          startPollingFallback();
        }
      }, 2000);
    } catch {
      startPollingFallback();
    }

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [scanId]);

  return state;
}
