/**
 * Client-side encryption utilities using Web Crypto API
 * Provides AES-GCM encryption for sensitive data
 */

export class EncryptionService {
  private static instance: EncryptionService;
  private readonly algorithm = 'AES-GCM';
  private readonly keyDerivationIterations = 100000;
  
  private constructor() {}
  
  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }
  
  /**
   * Derives an encryption key from a password using PBKDF2
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const importedKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.keyDerivationIterations,
        hash: 'SHA-256'
      },
      importedKey,
      { name: this.algorithm, length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * Generates a random salt for key derivation
   */
  private generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
  }
  
  /**
   * Generates a random initialization vector
   */
  private generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(12));
  }
  
  /**
   * Encrypts data using AES-GCM
   */
  async encrypt(data: string, password: string): Promise<{
    encrypted: string;
    salt: string;
    iv: string;
  }> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      const salt = this.generateSalt();
      const iv = this.generateIV();
      const key = await this.deriveKey(password, salt);
      
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv
        },
        key,
        dataBuffer
      );
      
      return {
        encrypted: this.bufferToBase64(encryptedBuffer),
        salt: this.bufferToBase64(salt.buffer),
        iv: this.bufferToBase64(iv.buffer)
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }
  
  /**
   * Decrypts data using AES-GCM
   */
  async decrypt(
    encryptedData: string,
    password: string,
    salt: string,
    iv: string
  ): Promise<string> {
    try {
      const encryptedBuffer = this.base64ToBuffer(encryptedData);
      const saltBuffer = this.base64ToBuffer(salt);
      const ivBuffer = this.base64ToBuffer(iv);
      
      const key = await this.deriveKey(password, new Uint8Array(saltBuffer));
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: new Uint8Array(ivBuffer)
        },
        key,
        encryptedBuffer
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data - invalid password or corrupted data');
    }
  }
  
  /**
   * Converts ArrayBuffer to base64 string
   */
  private bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  /**
   * Converts base64 string to ArrayBuffer
   */
  private base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  /**
   * Generates a secure random password
   */
  generateSecurePassword(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values, byte => charset[byte % charset.length]).join('');
  }
  
  /**
   * Hashes a password using SHA-256 (for verification, not storage)
   */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToBase64(hashBuffer);
  }
}

export const encryption = EncryptionService.getInstance();