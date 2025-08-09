import { makeAutoObservable } from 'mobx';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: {
    // 主要背景色
    background: string;
    surface: string;
    surfaceVariant: string;
    
    // 文字颜色
    text: string;
    textSecondary: string;
    textTertiary: string;
    
    // 边框颜色
    border: string;
    borderLight: string;
    
    // 控件颜色
    primary: string;
    primaryHover: string;
    secondary: string;
    
    // 状态颜色
    success: string;
    warning: string;
    error: string;
    
    // 透明度
    backdrop: string;
    overlay: string;
  };
  
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#ffffff',
    surface: '#f8f9fa',
    surfaceVariant: '#e9ecef',
    
    text: '#212529',
    textSecondary: '#6c757d',
    textTertiary: '#adb5bd',
    
    border: '#dee2e6',
    borderLight: '#e9ecef',
    
    primary: '#0d6efd',
    primaryHover: '#0b5ed7',
    secondary: '#6c757d',
    
    success: '#198754',
    warning: '#fd7e14',
    error: '#dc3545',
    
    backdrop: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(255, 255, 255, 0.9)',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: 'rgba(45, 45, 55, 0.95)',
    surface: 'rgba(55, 55, 65, 0.9)',
    surfaceVariant: 'rgba(65, 65, 75, 0.8)',
    
    text: '#e0e0e0',
    textSecondary: '#b0b0b0',
    textTertiary: '#888888',
    
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    
    primary: '#4285f4',
    primaryHover: '#3367d6',
    secondary: '#b0b0b0',
    
    success: '#34a853',
    warning: '#fbbc04',
    error: '#ea4335',
    
    backdrop: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(45, 45, 55, 0.95)',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  },
};

export class ThemeStore {
  currentMode: ThemeMode = 'light';

  constructor() {
    makeAutoObservable(this);
    // 从本地存储加载主题设置
    this.loadThemeFromStorage();
  }

  get currentTheme(): Theme {
    return this.currentMode === 'light' ? lightTheme : darkTheme;
  }

  toggleTheme() {
    this.currentMode = this.currentMode === 'light' ? 'dark' : 'light';
    this.saveThemeToStorage();
  }

  setTheme(mode: ThemeMode) {
    this.currentMode = mode;
    this.saveThemeToStorage();
  }

  private loadThemeFromStorage() {
    try {
      const saved = localStorage.getItem('theme-mode');
      if (saved && (saved === 'light' || saved === 'dark')) {
        this.currentMode = saved;
      }
    } catch (error) {
      console.warn('无法从本地存储加载主题设置:', error);
    }
  }

  private saveThemeToStorage() {
    try {
      localStorage.setItem('theme-mode', this.currentMode);
    } catch (error) {
      console.warn('无法保存主题设置到本地存储:', error);
    }
  }
}

// 创建全局主题store实例
export const themeStore = new ThemeStore(); 