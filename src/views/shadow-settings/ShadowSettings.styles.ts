import styled from 'styled-components';
import { themeStore } from '../../stores/ThemeStore';

export const ShadowSettingsContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  background: ${() => themeStore.currentTheme.colors.background};
  border: 1px solid ${() => themeStore.currentTheme.colors.border};
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: ${() => themeStore.currentTheme.shadows.xl};
  z-index: 2000;
  color: ${() => themeStore.currentTheme.colors.text};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
`;

export const ShadowSettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${() => themeStore.currentTheme.colors.border};
  background: ${() => themeStore.currentTheme.colors.surfaceVariant};
`;

export const ShadowSettingsTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${() => themeStore.currentTheme.colors.text};
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${() => themeStore.currentTheme.colors.textSecondary};
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: ${() => themeStore.currentTheme.colors.text};
    background: ${() => themeStore.currentTheme.colors.borderLight};
  }
`;

export const ShadowSettingsContent = styled.div`
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
`;

export const SettingSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${() => themeStore.currentTheme.colors.textSecondary};
`;

export const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SettingLabel = styled.label`
  font-size: 13px;
  color: ${() => themeStore.currentTheme.colors.textSecondary};
  min-width: 140px;
`;

export const SettingControl = styled.div`
  flex: 1;
  max-width: 160px;
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${() => themeStore.currentTheme.colors.backdrop};
  z-index: 1999;
`; 