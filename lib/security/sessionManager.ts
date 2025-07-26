/**
 * Session management with auto-logout and activity tracking
 */

import { secureStorage } from './secureStorage';

interface SessionData {
  userId: string;
  email: string;
  loginTime: number;
  lastActivity: number;
  expiresAt: number;
}

export class SessionManager {
  private static instance: SessionManager;
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private warningTime = 5 * 60 * 1000; // 5 minutes before timeout
  private activityTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private onTimeout: (() => void) | null = null;
  private onWarning: (() => void) | null = null;
  
  private constructor() {
    // Listen for user activity
    if (typeof window !== 'undefined') {
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, () => this.updateActivity(), true);
      });
      
      // Check for session on page visibility change
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.checkSession();
        }
      });
      
      // Listen for storage events (multi-tab logout)
      window.addEventListener('storage', (e) => {
        if (e.key === 'session' && !e.newValue) {
          this.handleLogout();
        }
      });
    }
  }
  
  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }
  
  /**
   * Initializes a new session
   */
  async createSession(userId: string, email: string, password: string): Promise<void> {
    // Initialize secure storage with password
    await secureStorage.initialize(password);
    
    const now = Date.now();
    const sessionData: SessionData = {
      userId,
      email,
      loginTime: now,
      lastActivity: now,
      expiresAt: now + this.sessionTimeout
    };
    
    await secureStorage.setItem('session', sessionData, true);
    this.startActivityTracking();
  }
  
  /**
   * Gets the current session
   */
  async getSession(): Promise<SessionData | null> {
    try {
      const session = await secureStorage.getItem('session');
      if (!session) return null;
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        await this.destroySession();
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }
  
  /**
   * Updates the last activity time
   */
  private async updateActivity(): Promise<void> {
    const session = await this.getSession();
    if (!session) return;
    
    const now = Date.now();
    session.lastActivity = now;
    session.expiresAt = now + this.sessionTimeout;
    
    await secureStorage.setItem('session', session, true);
    this.resetTimers();
  }
  
  /**
   * Starts activity tracking timers
   */
  private startActivityTracking(): void {
    this.resetTimers();
  }
  
  /**
   * Resets the timeout timers
   */
  private resetTimers(): void {
    // Clear existing timers
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }
    
    // Set warning timer
    this.warningTimer = setTimeout(() => {
      if (this.onWarning) {
        this.onWarning();
      }
    }, this.sessionTimeout - this.warningTime);
    
    // Set timeout timer
    this.activityTimer = setTimeout(() => {
      this.handleTimeout();
    }, this.sessionTimeout);
  }
  
  /**
   * Handles session timeout
   */
  private async handleTimeout(): Promise<void> {
    await this.destroySession();
    if (this.onTimeout) {
      this.onTimeout();
    }
  }
  
  /**
   * Handles logout from another tab
   */
  private handleLogout(): void {
    if (this.onTimeout) {
      this.onTimeout();
    }
  }
  
  /**
   * Checks if session is still valid
   */
  async checkSession(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }
  
  /**
   * Destroys the current session
   */
  async destroySession(): Promise<void> {
    // Clear timers
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    
    // Clear storage
    secureStorage.removeItem('session');
    secureStorage.clear();
  }
  
  /**
   * Sets the session timeout duration
   */
  setSessionTimeout(minutes: number): void {
    this.sessionTimeout = minutes * 60 * 1000;
    this.warningTime = Math.min(5 * 60 * 1000, this.sessionTimeout / 6);
  }
  
  /**
   * Sets the timeout callback
   */
  setOnTimeout(callback: () => void): void {
    this.onTimeout = callback;
  }
  
  /**
   * Sets the warning callback
   */
  setOnWarning(callback: () => void): void {
    this.onWarning = callback;
  }
  
  /**
   * Gets remaining session time in milliseconds
   */
  async getRemainingTime(): Promise<number> {
    const session = await this.getSession();
    if (!session) return 0;
    
    const remaining = session.expiresAt - Date.now();
    return Math.max(0, remaining);
  }
  
  /**
   * Extends the current session
   */
  async extendSession(): Promise<void> {
    await this.updateActivity();
  }
}

export const sessionManager = SessionManager.getInstance();