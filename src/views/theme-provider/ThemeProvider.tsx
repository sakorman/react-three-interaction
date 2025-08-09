import { useEffect, type FC, type ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigProvider } from 'antd';
import { themeStore } from '../../stores/ThemeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: FC<ThemeProviderProps> = observer(({ children }) => {
  const theme = themeStore.currentTheme;

  // 应用全局CSS变量
  useEffect(() => {
    const root = document.documentElement;
    
    // 设置CSS变量
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-surface-variant', theme.colors.surfaceVariant);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-text-tertiary', theme.colors.textTertiary);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-border-light', theme.colors.borderLight);
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-primary-hover', theme.colors.primaryHover);
    root.style.setProperty('--shadow-sm', theme.shadows.sm);
    root.style.setProperty('--shadow-md', theme.shadows.md);
    root.style.setProperty('--shadow-lg', theme.shadows.lg);
    root.style.setProperty('--shadow-xl', theme.shadows.xl);
    
    // 设置body背景色
    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.color = theme.colors.text;
  }, [theme]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: theme.colors.primary,
          colorBgContainer: theme.colors.background,
          colorBgElevated: theme.colors.surface,
          colorText: theme.colors.text,
          colorTextSecondary: theme.colors.textSecondary,
          colorBorder: theme.colors.border,
          borderRadius: 8,
          boxShadow: theme.shadows.md,
          boxShadowSecondary: theme.shadows.sm,
          colorBgLayout: theme.colors.background,
          colorBgSpotlight: theme.colors.surface,
        },
        algorithm: undefined, // 我们使用自定义主题而不是antd的算法
      }}
    >
      {children}
    </ConfigProvider>
  );
}); 