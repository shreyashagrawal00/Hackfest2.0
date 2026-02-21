/**
 * Simple mock authentication utility using localStorage for persistence.
 */

export interface UserAccount {
  email: string;
  password?: string;
  name: string;
}

const STORAGE_KEY = 'brd_agent_accounts';
const SESSION_KEY = 'brd_agent_session';

export const auth = {
  /**
   * Get all registered accounts
   */
  getAccounts(): UserAccount[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Find an account by email
   */
  findAccount(email: string): UserAccount | undefined {
    return this.getAccounts().find(a => a.email.toLowerCase() === email.toLowerCase());
  },

  /**
   * Register a new account
   */
  register(email: string, password?: string): UserAccount {
    const accounts = this.getAccounts();
    const name = email.split('@')[0]
      .replace(/[^a-zA-Z]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    
    const newUser: UserAccount = { email, password, name };
    accounts.push(newUser);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    return newUser;
  },

  /**
   * Verify credentials and return user or throw error
   */
  login(email: string, password?: string): { user: UserAccount; isNew: boolean } {
    const existing = this.findAccount(email);
    
    if (existing) {
      if (existing.password && existing.password !== password) {
        throw new Error('Invalid password');
      }
      return { user: existing, isNew: false };
    } else {
      // Auto-create account
      const newUser = this.register(email, password);
      return { user: newUser, isNew: true };
    }
  },

  /**
   * Save current session
   */
  setSession(user: UserAccount | null) {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  },

  /**
   * Get current session
   */
  getSession(): UserAccount | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }
};
