// IndexedDB wrapper for offline storage
export class IndexedDBManager {
  private dbName: string;
  private dbVersion: number;
  private db: IDBDatabase | null = null;

  constructor(dbName = 'CAGOfflineDB', dbVersion = 1) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('jobs')) {
          const jobsStore = db.createObjectStore('jobs', { keyPath: 'id' });
          jobsStore.createIndex('title', 'title', { unique: false });
          jobsStore.createIndex('company', 'company', { unique: false });
          jobsStore.createIndex('clearanceLevel', 'clearanceLevel', { unique: false });
          jobsStore.createIndex('datePosted', 'datePosted', { unique: false });
        }

        if (!db.objectStoreNames.contains('searchHistory')) {
          db.createObjectStore('searchHistory', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('offlineActions')) {
          db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('resumeData')) {
          db.createObjectStore('resumeData', { keyPath: 'userId' });
        }

        if (!db.objectStoreNames.contains('mockInterviewSessions')) {
          db.createObjectStore('mockInterviewSessions', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async saveJobs(jobs: any[]): Promise<void> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['jobs'], 'readwrite');
    const store = transaction.objectStore('jobs');
    
    for (const job of jobs) {
      await new Promise<void>((resolve, reject) => {
        const request = store.put({
          ...job,
          cachedAt: Date.now(),
          expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async getJobs(filters?: { clearanceLevel?: string; location?: string }): Promise<any[]> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['jobs'], 'readonly');
      const store = transaction.objectStore('jobs');
      const request = store.getAll();
      
      request.onsuccess = () => {
        let jobs = request.result.filter(job => job.expires > Date.now());
        
        if (filters) {
          if (filters.clearanceLevel) {
            jobs = jobs.filter(job => job.clearanceLevel === filters.clearanceLevel);
          }
          if (filters.location) {
            jobs = jobs.filter(job => job.location?.includes(filters.location));
          }
        }
        
        resolve(jobs);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveSearchHistory(searchTerm: string, filters: any): Promise<void> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['searchHistory'], 'readwrite');
    const store = transaction.objectStore('searchHistory');
    
    return new Promise<void>((resolve, reject) => {
      const request = store.add({
        searchTerm,
        filters,
        timestamp: Date.now()
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSearchHistory(limit = 10): Promise<any[]> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['searchHistory'], 'readonly');
      const store = transaction.objectStore('searchHistory');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const history = request.result
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
        resolve(history);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveUserPreference(key: string, value: any): Promise<void> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['userPreferences'], 'readwrite');
    const store = transaction.objectStore('userPreferences');
    
    return new Promise<void>((resolve, reject) => {
      const request = store.put({ key, value, updatedAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUserPreference(key: string): Promise<any> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userPreferences'], 'readonly');
      const store = transaction.objectStore('userPreferences');
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  async saveOfflineAction(action: { type: string; data: any; url: string }): Promise<void> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    
    return new Promise<void>((resolve, reject) => {
      const request = store.add({
        ...action,
        timestamp: Date.now(),
        synced: false
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingOfflineActions(): Promise<any[]> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const actions = request.result.filter(action => !action.synced);
        resolve(actions);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async markActionAsSynced(id: number): Promise<void> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    
    return new Promise<void>((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.synced = true;
          action.syncedAt = Date.now();
          const putRequest = store.put(action);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async saveResumeData(userId: string, resumeData: any): Promise<void> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['resumeData'], 'readwrite');
    const store = transaction.objectStore('resumeData');
    
    return new Promise<void>((resolve, reject) => {
      const request = store.put({
        userId,
        data: resumeData,
        savedAt: Date.now()
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getResumeData(userId: string): Promise<any> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['resumeData'], 'readonly');
      const store = transaction.objectStore('resumeData');
      const request = store.get(userId);
      
      request.onsuccess = () => resolve(request.result?.data);
      request.onerror = () => reject(request.error);
    });
  }

  async saveMockInterviewSession(sessionData: any): Promise<void> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['mockInterviewSessions'], 'readwrite');
    const store = transaction.objectStore('mockInterviewSessions');
    
    return new Promise<void>((resolve, reject) => {
      const request = store.add({
        ...sessionData,
        savedAt: Date.now()
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMockInterviewSessions(userId: string): Promise<any[]> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mockInterviewSessions'], 'readonly');
      const store = transaction.objectStore('mockInterviewSessions');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const sessions = request.result.filter(session => session.userId === userId);
        resolve(sessions);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearExpiredData(): Promise<void> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['jobs'], 'readwrite');
    const store = transaction.objectStore('jobs');
    const request = store.getAll();
    
    request.onsuccess = () => {
      const now = Date.now();
      request.result.forEach(job => {
        if (job.expires < now) {
          store.delete(job.id);
        }
      });
    };
  }

  async getStorageUsage(): Promise<{ used: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0
      };
    }
    return { used: 0, available: 0 };
  }
}

// Export singleton instance
export const indexedDBManager = new IndexedDBManager();