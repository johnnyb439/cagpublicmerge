// Development mode utilities
export const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

// Auto-login for development
export const devUser = {
  id: '1',
  name: 'Dev User',
  email: 'dev@test.com',
  clearanceLevel: 'TS/SCI',
  role: 'admin'
};

// Initialize dev mode
export function initDevMode() {
  if (typeof window !== 'undefined' && isDevMode) {
    // Auto-login if not logged in
    if (!localStorage.getItem('user')) {
      localStorage.setItem('user', JSON.stringify(devUser));
      console.log('Dev mode: Auto-logged in as Dev User');
    }
  }
}