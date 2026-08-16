import { create } from 'zustand';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: 'Admin' | 'Advocate' | 'Client' | 'User';
  phone: string;
  profilePhoto?: string;
  enrollmentNumber?: string;
  enrollmentYear?: string;
  hasCompletedProfile?: boolean;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  darkMode: boolean;
  csrfToken: string | null;
  sessionTimeout: number; // in milliseconds (e.g. 15 minutes)
  lastActivity: number;
  notifications: Array<{ id: string; title: string; message: string; type: string; isRead: boolean }>;
  
  // Actions
  login: (user: UserProfile, token: string, refreshToken: string) => void;
  logout: () => void;
  setDarkMode: (val: boolean) => void;
  setCsrfToken: (token: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateActivity: () => void;
  addNotification: (title: string, message: string, type?: string) => void;
  markNotificationsAsRead: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('legal_token'),
  refreshToken: localStorage.getItem('legal_refresh_token'),
  user: (() => {
    try {
      const u = localStorage.getItem('legal_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })(),
  darkMode: localStorage.getItem('legal_dark_mode') === 'true',
  csrfToken: 'legal-platform-csrf-token-secret',
  sessionTimeout: 15 * 60 * 1000, // 15 mins
  lastActivity: Date.now(),
  notifications: [
    { id: '1', title: 'System Security', message: 'Encryption session successfully established.', type: 'success', isRead: false },
    { id: '2', title: 'Verification Center', message: 'Welcome to the platform! Complete advocate verification if applicable.', type: 'info', isRead: false }
  ],

  login: (user, token, refreshToken) => {
    localStorage.setItem('legal_token', token);
    localStorage.setItem('legal_refresh_token', refreshToken);
    localStorage.setItem('legal_user', JSON.stringify(user));
    set({ user, token, refreshToken, lastActivity: Date.now() });
  },

  logout: () => {
    localStorage.removeItem('legal_token');
    localStorage.removeItem('legal_refresh_token');
    localStorage.removeItem('legal_user');
    set({ user: null, token: null, refreshToken: null });
  },

  setDarkMode: (darkMode) => {
    localStorage.setItem('legal_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ darkMode });
  },

  setCsrfToken: (csrfToken) => set({ csrfToken }),

  updateUserProfile: (updates) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem('legal_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },

  updateActivity: () => {
    const now = Date.now();
    const { token, lastActivity, sessionTimeout, logout } = get();
    if (token && now - lastActivity > sessionTimeout) {
      console.log('⏰ Session timed out due to inactivity.');
      logout();
    } else {
      set({ lastActivity: now });
    }
  },

  addNotification: (title, message, type = 'info') => {
    const newNotif = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      isRead: false
    };
    set(state => ({ notifications: [newNotif, ...state.notifications] }));
  },

  markNotificationsAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true }))
    }));
  }
}));
