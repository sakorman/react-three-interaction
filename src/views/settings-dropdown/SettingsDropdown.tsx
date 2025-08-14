import { type FC, useCallback, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigProvider } from 'antd';
import { BulbOutlined, BorderOutlined } from '@ant-design/icons';
import { editorStore } from '../../stores/EditorStore';
import { themeStore } from '../../stores/ThemeStore';
import {
  DropdownContainer,
  DropdownItem,
  DropdownSeparator,
} from './SettingsDropdown.styles';

export const SettingsDropdown: FC = observer(() => {
  const { showSettingsDropdown } = editorStore;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLightingSettings = useCallback(() => {
    editorStore.toggleLightingSettings();
  }, []);

  const handleShadowSettings = useCallback(() => {
    editorStore.toggleShadowSettings();
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        editorStore.toggleSettingsDropdown();
      }
    };

    if (showSettingsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsDropdown]);

  if (!showSettingsDropdown) {
    return null;
  }

  const theme = themeStore.currentTheme;

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
        },
      }}
    >
      <DropdownContainer 
        ref={dropdownRef}
        style={{
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          boxShadow: theme.shadows.md,
        }}
      >
        <DropdownItem 
          onClick={handleLightingSettings}
          style={{ color: theme.colors.text }}
        >
          <BulbOutlined />
          光照设置
        </DropdownItem>
        
        <DropdownSeparator style={{ backgroundColor: theme.colors.border }} />
        
        <DropdownItem 
          onClick={handleShadowSettings}
          style={{ color: theme.colors.text }}
        >
          <BorderOutlined />
          阴影设置
        </DropdownItem>
      </DropdownContainer>
    </ConfigProvider>
  );
}); 