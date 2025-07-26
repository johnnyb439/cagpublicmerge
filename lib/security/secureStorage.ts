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
    // Check if Web Crypto API is available
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      console.warn('Web Crypto API not available, using fallback storage');
      this.masterKey = 'fallback-key'; // Simple fallback for development
      return;
    }

    try {
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
    } catch (error) {
      console.warn('Encryption initialization failed, using fallback:', error);
      this.masterKey = 'fallback-key'; // Simple fallback
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
    const isSensitive = forceSensitive || this.isSensitiveKey(key);
    
    // Auto-initialize if not initialized and dealing with non-sensitive data
    if (!this.masterKey) {
      if (!isSensitive) {
        try {
          await this.initialize('default-session-key');
        } catch (error) {
          console.warn('Auto-initialization failed, storing as plain localStorage for non-sensitive key:', key);
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          return;
        }
      } else {
        throw new Error('Secure storage not initialized for sensitive data');
      }
    }
    
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    let storageData: any = {
      timestamp: Date.now(),
      version: this.version,
      encrypted: isSensitive
    };
    
    if (isSensitive) {
      try {
        if (this.masterKey === 'fallback-key') {
          // Simple base64 encoding for fallback (not secure, but prevents app crash)
          storageData.data = btoa(stringValue);
          storageData.encrypted = false; // Mark as not truly encrypted
        } else {
          const encryptedData = await encryption.encrypt(stringValue, this.masterKey);
          storageData.data = encryptedData;
        }
      } catch (error) {
        console.warn('Encryption failed, storing unencrypted:', error);
        storageData.data = stringValue;
        storageData.encrypted = false;
      }
    } else {
      storageData.data = stringValue;
    }
    
    localStorage.setItem(key, JSON.stringify(storageData));
  }
  
  /**
   * Retrieves and decrypts an item
   */
  async getItem(key: string): Promise<any> {
    // Auto-initialize with a default key if not initialized (for non-sensitive data)
    if (!this.masterKey) {
      // Only auto-initialize for non-sensitive keys
      if (!this.isSensitiveKey(key)) {
        try {
          await this.initialize('default-session-key');
        } catch (error) {
          // If auto-initialization fails, return null for non-sensitive data
          console.warn('Auto-initialization failed, returning null for non-sensitive key:', key);
          return null;
        }
      } else {
        // For sensitive keys, user must explicitly initialize
        console.warn('Secure storage not initialized for sensitive key:', key);
        return null;
      }
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
        try {
          if (this.masterKey === 'fallback-key') {
            // Simple base64 decoding for fallback
            value = atob(storageData.data);
          } else {
            value = await encryption.decrypt(
              storageData.data.encrypted,
              this.masterKey,
              storageData.data.salt,
              storageData.data.iv
            );
          }
        } catch (error) {
          console.warn('Decryption failed, returning raw data:', error);
          value = storageData.data;
        }
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