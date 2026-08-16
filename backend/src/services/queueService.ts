import { EventEmitter } from 'events';

export interface QueuedJob<T> {
  id: string;
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
  timeoutMs: number;
  enqueuedAt: number;
}

export class ConcurrencyQueue extends EventEmitter {
  private maxConcurrency: number;
  private runningCount: number = 0;
  private queue: Array<QueuedJob<any>> = [];

  constructor(maxConcurrency: number = 4) {
    super();
    this.maxConcurrency = maxConcurrency;
  }

  get stats() {
    return {
      running: this.runningCount,
      queued: this.queue.length,
      maxConcurrency: this.maxConcurrency,
    };
  }

  async run<T>(id: string, fn: () => Promise<T>, timeoutMs: number = 45000): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const job: QueuedJob<T> = {
        id,
        fn,
        resolve,
        reject,
        timeoutMs,
        enqueuedAt: Date.now(),
      };

      this.queue.push(job);
      this.processNext();
    });
  }

  private async processNext() {
    if (this.runningCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.runningCount++;

    let isCompleted = false;
    const timeoutHandle = setTimeout(() => {
      if (!isCompleted) {
        isCompleted = true;
        this.runningCount--;
        job.reject(new Error(`Scan execution timed out after ${job.timeoutMs / 1000}s in worker queue.`));
        this.processNext();
      }
    }, job.timeoutMs);

    try {
      const result = await job.fn();
      if (!isCompleted) {
        isCompleted = true;
        clearTimeout(timeoutHandle);
        this.runningCount--;
        job.resolve(result);
        this.processNext();
      }
    } catch (err) {
      if (!isCompleted) {
        isCompleted = true;
        clearTimeout(timeoutHandle);
        this.runningCount--;
        job.reject(err);
        this.processNext();
      }
    }
  }
}
