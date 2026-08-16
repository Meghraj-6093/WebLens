import { 
  FullScanReport, 
  HistoricalScanItem, 
  ProjectRecord, 
  ProjectSummary, 
  MonitoredSite, 
  UserActivityItem,
  ScanRecord,
  AuditCategory
} from '@weblens/shared';

const DB_NAME = 'weblens_local_workspace';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openLocalDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Scans store
      if (!db.objectStoreNames.contains('scans')) {
        const scanStore = db.createObjectStore('scans', { keyPath: 'id' });
        scanStore.createIndex('domain', 'domain', { unique: false });
        scanStore.createIndex('createdAt', 'createdAt', { unique: false });
        scanStore.createIndex('overallScore', 'overallScore', { unique: false });
      }

      // 2. Full Reports store
      if (!db.objectStoreNames.contains('reports')) {
        db.createObjectStore('reports', { keyPath: 'scanId' });
      }

      // 3. Projects store
      if (!db.objectStoreNames.contains('projects')) {
        const projStore = db.createObjectStore('projects', { keyPath: 'id' });
        projStore.createIndex('domain', 'domain', { unique: false });
        projStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 4. Monitors store
      if (!db.objectStoreNames.contains('monitors')) {
        const monStore = db.createObjectStore('monitors', { keyPath: 'id' });
        monStore.createIndex('domain', 'domain', { unique: false });
        monStore.createIndex('nextScanAt', 'nextScanAt', { unique: false });
      }

      // 5. Competitors store
      if (!db.objectStoreNames.contains('competitors')) {
        db.createObjectStore('competitors', { keyPath: 'id' });
      }

      // 6. Agency & White-Label store
      if (!db.objectStoreNames.contains('agency')) {
        db.createObjectStore('agency', { keyPath: 'id' });
      }

      // 7. Activity store
      if (!db.objectStoreNames.contains('activity')) {
        const actStore = db.createObjectStore('activity', { keyPath: 'id' });
        actStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 8. Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open local IndexedDB.'));
    };
  });

  return dbPromise;
}

// Generic transaction helper
async function performTx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> {
  const db = await openLocalDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let req: IDBRequest<T> | void;

    try {
      req = callback(store);
    } catch (err) {
      reject(err);
      return;
    }

    tx.oncomplete = () => {
      resolve(req ? req.result : (undefined as unknown as T));
    };

    tx.onerror = () => {
      reject(tx.error || new Error(`Transaction error on ${storeName}`));
    };
  });
}

export class LocalWorkspaceDB {
  // --- Scans & Reports Persistence ---
  static async saveScanReport(report: FullScanReport): Promise<void> {
    const scanRecord: HistoricalScanItem = {
      id: report.scan.id,
      url: report.scan.url,
      normalizedUrl: report.scan.normalizedUrl,
      domain: report.scan.domain,
      status: report.scan.status,
      overallScore: report.overall.score,
      stage: report.scan.stage,
      progress: report.scan.progress,
      screenshotUrl: report.screenshotUrl,
      mobileScreenshotUrl: report.mobileScreenshotUrl,
      startedAt: report.scan.startedAt,
      completedAt: report.scan.completedAt || new Date().toISOString(),
      createdAt: report.scan.createdAt || new Date().toISOString(),
      scoreChange: null
    };

    // Save summary to scans store
    await performTx('scans', 'readwrite', (store) => store.put(scanRecord));

    // Save full report payload to reports store
    await performTx('reports', 'readwrite', (store) => store.put({
      scanId: report.scan.id,
      report,
      savedAt: new Date().toISOString()
    }));

    // Add activity entry
    await this.logActivity({
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'scan',
      title: `Audited ${report.scan.domain}`,
      detail: `Health Score: ${report.overall.score}/100 (${report.overall.rating})`,
      timestamp: new Date().toISOString(),
      link: `/report/${report.scan.id}`
    });

    // Update project latest score if domain matches a project
    const projects = await this.getProjects();
    const matchedProject = projects.find(p => p.domain.toLowerCase() === report.scan.domain.toLowerCase());
    if (matchedProject) {
      await this.updateProjectScore(matchedProject.id, report.overall.score, report.scan.id);
    }

    // Update monitor last score if domain matches
    const monitors = await this.getMonitors();
    const matchedMonitor = monitors.find(m => m.domain.toLowerCase() === report.scan.domain.toLowerCase());
    if (matchedMonitor) {
      await this.updateMonitorLastScan(matchedMonitor.id, report.overall.score, report.scan.id);
    }
  }

  static async getReport(scanId: string): Promise<FullScanReport | null> {
    try {
      const record = await performTx<{ scanId: string; report: FullScanReport } | undefined>(
        'reports',
        'readonly',
        (store) => store.get(scanId)
      );
      return record ? record.report : null;
    } catch {
      return null;
    }
  }

  static async getAllScans(): Promise<HistoricalScanItem[]> {
    try {
      const db = await openLocalDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction('scans', 'readonly');
        const store = tx.objectStore('scans');
        const req = store.getAll();

        req.onsuccess = () => {
          const scans: HistoricalScanItem[] = req.result || [];
          // Sort chronologically descending
          scans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          // Calculate score delta per domain
          const calculated = scans.map((s, i) => {
            const prev = scans.slice(i + 1).find(o => o.domain === s.domain && o.overallScore !== null);
            let scoreChange: number | null = null;
            if (prev && s.overallScore !== null && prev.overallScore !== null) {
              scoreChange = s.overallScore - prev.overallScore;
            }
            return { ...s, scoreChange };
          });

          resolve(calculated);
        };

        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  static async deleteScan(scanId: string): Promise<void> {
    await performTx('scans', 'readwrite', (store) => store.delete(scanId));
    await performTx('reports', 'readwrite', (store) => store.delete(scanId));
  }

  // --- Projects ---
  static async getProjects(): Promise<ProjectSummary[]> {
    try {
      const db = await openLocalDatabase();
      return new Promise(async (resolve) => {
        const tx = db.transaction('projects', 'readonly');
        const store = tx.objectStore('projects');
        const req = store.getAll();

        req.onsuccess = async () => {
          const projects: ProjectRecord[] = req.result || [];
          const scans = await LocalWorkspaceDB.getAllScans();

          const summaries: ProjectSummary[] = projects.map(p => {
            const projectScans = scans.filter(s => s.domain.toLowerCase() === p.domain.toLowerCase());
            const latestScan = projectScans[0] || null;
            let scoreChange: number | null = null;
            if (projectScans.length >= 2 && projectScans[0].overallScore !== null && projectScans[1].overallScore !== null) {
              scoreChange = projectScans[0].overallScore - projectScans[1].overallScore;
            }

            return {
              ...p,
              totalScans: projectScans.length,
              latestScore: latestScan ? latestScan.overallScore : null,
              scoreChange,
              latestScan: latestScan as any
            };
          });

          // Sort by updated descending
          summaries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          resolve(summaries);
        };

        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  static async saveProject(data: { name: string; domain: string; description?: string }): Promise<ProjectRecord> {
    const id = `proj_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const record: ProjectRecord = {
      id,
      userId: 'local_user',
      name: data.name.trim(),
      domain: data.domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
      description: data.description?.trim() || null,
      createdAt: now,
      updatedAt: now
    };

    await performTx('projects', 'readwrite', (store) => store.put(record));

    await this.logActivity({
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'project',
      title: `Created Project "${record.name}"`,
      detail: `Target domain: ${record.domain}`,
      timestamp: now,
      link: `/projects`
    });

    return record;
  }

  static async updateProjectScore(projectId: string, score: number, scanId: string): Promise<void> {
    const project = await performTx<ProjectRecord | undefined>('projects', 'readonly', (store) => store.get(projectId));
    if (project) {
      project.updatedAt = new Date().toISOString();
      await performTx('projects', 'readwrite', (store) => store.put(project));
    }
  }

  static async deleteProject(projectId: string): Promise<void> {
    await performTx('projects', 'readwrite', (store) => store.delete(projectId));
  }

  // --- Continuous Monitors ---
  static async getMonitors(): Promise<MonitoredSite[]> {
    try {
      const db = await openLocalDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction('monitors', 'readonly');
        const store = tx.objectStore('monitors');
        const req = store.getAll();
        req.onsuccess = () => {
          const list: MonitoredSite[] = req.result || [];
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          resolve(list);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  static async saveMonitor(data: { url: string; frequency: 'daily' | 'weekly' | 'monthly' }): Promise<MonitoredSite> {
    const id = `mon_${crypto.randomUUID()}`;
    const now = new Date();
    let domain = data.url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    const nextScan = new Date(now.getTime() + (data.frequency === 'monthly' ? 30 : data.frequency === 'weekly' ? 7 : 1) * 86400000);

    const record: MonitoredSite = {
      id,
      userId: 'local_user',
      url: data.url.startsWith('http') ? data.url : `https://${data.url}`,
      domain,
      frequency: data.frequency,
      lastScore: null,
      nextScanAt: nextScan.toISOString(),
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    await performTx('monitors', 'readwrite', (store) => store.put(record));

    await this.logActivity({
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'monitor',
      title: `Added Monitor for ${record.domain}`,
      detail: `Frequency: ${record.frequency}`,
      timestamp: now.toISOString(),
      link: `/monitoring`
    });

    return record;
  }

  static async updateMonitorLastScan(monitorId: string, score: number, scanId: string): Promise<void> {
    const mon = await performTx<MonitoredSite | undefined>('monitors', 'readonly', (store) => store.get(monitorId));
    if (mon) {
      const now = new Date();
      const nextScan = new Date(now.getTime() + (mon.frequency === 'monthly' ? 30 : mon.frequency === 'weekly' ? 7 : 1) * 86400000);
      mon.lastScore = score;
      mon.lastScanId = scanId;
      mon.lastScannedAt = now.toISOString();
      mon.nextScanAt = nextScan.toISOString();
      mon.updatedAt = now.toISOString();
      await performTx('monitors', 'readwrite', (store) => store.put(mon));
    }
  }

  static async deleteMonitor(monitorId: string): Promise<void> {
    await performTx('monitors', 'readwrite', (store) => store.delete(monitorId));
  }

  // --- Competitors Benchmarks ---
  static async getCompetitors(): Promise<any[]> {
    try {
      const db = await openLocalDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction('competitors', 'readonly');
        const store = tx.objectStore('competitors');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  static async saveCompetitor(benchmark: any): Promise<void> {
    const id = benchmark.id || `comp_${crypto.randomUUID()}`;
    await performTx('competitors', 'readwrite', (store) => store.put({ ...benchmark, id, createdAt: new Date().toISOString() }));
  }

  static async deleteCompetitor(id: string): Promise<void> {
    await performTx('competitors', 'readwrite', (store) => store.delete(id));
  }

  // --- Agency & White Label Workspace ---
  static async getAgencySettings(): Promise<any> {
    try {
      const settings = await performTx<any | undefined>('agency', 'readonly', (store) => store.get('settings'));
      return settings || {
        brandName: 'My Agency Studio',
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        footerText: 'Powered by Local WebLens Workspace',
        clients: []
      };
    } catch {
      return {
        brandName: 'My Agency Studio',
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        footerText: 'Powered by Local WebLens Workspace',
        clients: []
      };
    }
  }

  static async saveAgencySettings(data: any): Promise<void> {
    await performTx('agency', 'readwrite', (store) => store.put({ id: 'settings', ...data, updatedAt: new Date().toISOString() }));
  }

  // --- Activity Stream ---
  static async logActivity(act: UserActivityItem): Promise<void> {
    try {
      await performTx('activity', 'readwrite', (store) => store.put(act));
    } catch {
      // ignore
    }
  }

  static async getActivities(limit: number = 15): Promise<UserActivityItem[]> {
    try {
      const db = await openLocalDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction('activity', 'readonly');
        const store = tx.objectStore('activity');
        const req = store.getAll();
        req.onsuccess = () => {
          const list: UserActivityItem[] = req.result || [];
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          resolve(list.slice(0, limit));
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // --- Workspace Aggregated Statistics ---
  static async getWorkspaceStats(): Promise<{
    totalScans: number;
    scansToday: number;
    scansThisWeek: number;
    scansThisMonth: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    uniqueDomains: number;
    projectsCount: number;
    monitorsCount: number;
    competitorsCount: number;
  }> {
    const scans = await this.getAllScans();
    const projects = await this.getProjects();
    const monitors = await this.getMonitors();
    const competitors = await this.getCompetitors();

    const completed = scans.filter(s => s.status === 'completed' && s.overallScore !== null);
    const todayIso = new Date().toISOString().split('T')[0];
    const oneWeekAgo = Date.now() - 7 * 86400000;
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

    const scansToday = scans.filter(s => s.createdAt.startsWith(todayIso)).length;
    const scansThisWeek = scans.filter(s => new Date(s.createdAt).getTime() >= oneWeekAgo).length;
    const scansThisMonth = scans.filter(s => new Date(s.createdAt).getTime() >= startOfMonth).length;

    const avgScore = completed.length > 0
      ? Math.round(completed.reduce((acc, c) => acc + (c.overallScore || 0), 0) / completed.length)
      : 0;

    const highestScore = completed.length > 0
      ? Math.max(...completed.map(s => s.overallScore || 0))
      : 0;

    const lowestScore = completed.length > 0
      ? Math.min(...completed.map(s => s.overallScore || 0))
      : 0;

    const uniqueDomains = new Set(scans.map(s => s.domain.toLowerCase())).size;

    return {
      totalScans: scans.length,
      scansToday,
      scansThisWeek,
      scansThisMonth,
      averageScore: avgScore,
      highestScore: highestScore > 0 ? highestScore : 0,
      lowestScore: lowestScore > 0 ? lowestScore : 0,
      uniqueDomains,
      projectsCount: projects.length,
      monitorsCount: monitors.length,
      competitorsCount: competitors.length
    };
  }

  // --- Export, Import & Clear Data ---
  static async exportAllData(): Promise<string> {
    const scans = await this.getAllScans();
    const projects = await this.getProjects();
    const monitors = await this.getMonitors();
    const competitors = await this.getCompetitors();
    const agency = await this.getAgencySettings();
    const activities = await this.getActivities(100);

    const exportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      appName: 'WebLens Local Workspace',
      data: {
        scans,
        projects,
        monitors,
        competitors,
        agency,
        activities
      }
    };

    return JSON.stringify(exportPayload, null, 2);
  }

  static async importAllData(jsonString: string): Promise<{ importedCount: number }> {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object' || !parsed.data) {
      throw new Error('Invalid WebLens backup file format.');
    }

    const { scans = [], projects = [], monitors = [], competitors = [], activities = [] } = parsed.data;

    let count = 0;
    for (const s of scans) {
      await performTx('scans', 'readwrite', (store) => store.put(s));
      count++;
    }
    for (const p of projects) {
      await performTx('projects', 'readwrite', (store) => store.put(p));
      count++;
    }
    for (const m of monitors) {
      await performTx('monitors', 'readwrite', (store) => store.put(m));
      count++;
    }
    for (const c of competitors) {
      await performTx('competitors', 'readwrite', (store) => store.put(c));
      count++;
    }
    for (const a of activities) {
      await performTx('activity', 'readwrite', (store) => store.put(a));
      count++;
    }

    return { importedCount: count };
  }

  static async clearScans(): Promise<void> {
    await performTx('scans', 'readwrite', (store) => store.clear());
    await performTx('reports', 'readwrite', (store) => store.clear());
  }

  static async clearProjects(): Promise<void> {
    await performTx('projects', 'readwrite', (store) => store.clear());
  }

  static async clearAllData(): Promise<void> {
    await performTx('scans', 'readwrite', (store) => store.clear());
    await performTx('reports', 'readwrite', (store) => store.clear());
    await performTx('projects', 'readwrite', (store) => store.clear());
    await performTx('monitors', 'readwrite', (store) => store.clear());
    await performTx('competitors', 'readwrite', (store) => store.clear());
    await performTx('agency', 'readwrite', (store) => store.clear());
    await performTx('activity', 'readwrite', (store) => store.clear());
    await performTx('settings', 'readwrite', (store) => store.clear());
  }
}
