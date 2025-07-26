/**
 * Secure storage service that encrypts sensitive data before storing
 */

import { encryption } from './encryption';

interface StorageMetadata {
  encrypted: boolean;
  timestamp: number;
  version: string;
}

export class SecureStorageService {
  private static instance: SecureStorageService;
  private masterKey: string | null = null;
  private readonly version = '1.0';
  private readonly sensitiveKeys = [
    'user',
    'profile',
    'currentResume',
    'resumes',
    'certifications',
    'jobApplications',
    'messages',
    'dreamJobs',
    'documents'
  ];
  
  private constructor() {}
  
  static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }
  
  /**
   * Initializes the secure storage with a master password
   */
  async initialize(password: string): Promise<void> {
    // Derive a master key from the password
    this.masterKey = await encryption.hashPassword(password + 'CAG_SECURE_2025');
    
    // Verify the password if there's existing encrypted data
    const testKey = 'secureStorageTest';
    const existing = localStorage.getItem(testKey);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (parsed.encrypted) {
          await encryption.decrypt(
            parsed.data.encrypted,
            this.masterKey,
            parsed.data.salt,
            parsed.data.iv
          );
        }
      } catch (error) {
        throw new Error('Invalid master password');
      }
    } else {
      // Set a test value to verify future logins
      await this.setItem(testKey, 'verified', true);
    }
  }
  
  /**
   * Checks if a key contains sensitive data
   */
  private isSensitiveKey(key: string): boolean {
    return this.sensitiveKeys.some(sensitiveKey => 
      key.toLowerCase().includes(sensitiveKey.toLowerCase())
    );
  }
  
  /**
   * Stores an item with optional encryption
   */
  async setItem(key: string, value: any, forceSensitive: boolean = false): Promise<void> {
    if (!this.masterKey) {
      throw new Error('Secure storage not initialized');
    }
    
    const isSensitive = forceSensitive || this.isSensitiveKey(key);
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    let storageData: any = {
      timestamp: Date.now(),
      version: this.version,
      encrypted: isSensitive
    };
    
    if (isSensitive) {
      const encryptedData = await encryption.encrypt(stringValue, this.masterKey);
      storageData.data = encryptedData;
    } else {
      storageData.data = stringValue;
    }
    
    localStorage.setItem(key, JSON.stringify(storageData));
  }
  
  /**
   * Retrieves and decrypts an item
   */
  async getItem(key: string): Promise<any> {
    if (!this.masterKey) {
      throw new Error('Secure storage not initialized');
    }
    
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    try {
      const storageData = JSON.parse(stored);
      
      // Handle legacy unencrypted data
      if (!storageData.version) {
        return stored;
      }
      
      let value: string;
      if (storageData.encrypted) {
        value = await encryption.decrypt(
          storageData.data.encrypted,
          this.masterKey,
          storageData.data.salt,
          storageData.data.iv
        );
      } else {
        value = storageData.data;
      }
      
      // Try to parse as JSON, return string if it fails
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      return null;
    }
  }
  
  /**
   * Removes an item from storage
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
  
  /**
   * Clears all secure storage
   */
  clear(): void {
    this.masterKey = null;
    localStorage.clear();
  }
  
  /**
   * Changes the master password
   */
  async changeMasterPassword(currentPassword: string, newPassword: string): Promise<void> {
    // Verify current password
    await this.initialize(currentPassword);
    
    // Get all sensitive items
    const itemsToReEncrypt: { key: string; value: any }[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && this.isSensitiveKey(key)) {
        const value = await this.getItem(key);
        if (value !== null) {
          itemsToReEncrypt.push({ key, value });
        }
      }
    }
    
    // Update master key
    const oldMasterKey = this.masterKey;
    this.masterKey = await encryption.hashPassword(newPassword + 'CAG_SECURE_2025');
    
    // Re-encrypt all sensitive items
    for (const item of itemsToReEncrypt) {
      await this.setItem(item.key, item.value, true);
    }
    
    // Update test value
    await this.setItem('secureStorageTest', 'verified', true);
  }
  
  /**
   * Exports all data (encrypted)
   */
  async exportData(): Promise<string> {
    const data: Record<string, any> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key);
      }
    }
    
    return JSON.stringify({
      version: this.version,
      timestamp: Date.now(),
      data
    });
  }
  
  /**
   * Imports data
   */
  async importData(exportedData: string, password: string): Promise<void> {
    const parsed = JSON.parse(exportedData);
    
    // Clear existing data
    this.clear();
    
    // Initialize with password
    await this.initialize(password);
    
    // Restore all data
    for (const [key, value] of Object.entries(parsed.data)) {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      }
    }
  }
}

export const secureStorage = SecureStorageService.getInstance();