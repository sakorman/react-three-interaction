import { useCallback, type FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Switch, Slider, Select, InputNumber, ConfigProvider } from 'antd';
import { editorStore } from '../../stores/EditorStore';
import { themeStore } from '../../stores/ThemeStore';
import { useEditor } from '../../hooks/useEditor';
import {
  ShadowSettingsContainer,
  ShadowSettingsHeader,
  ShadowSettingsTitle,
  CloseButton,
  ShadowSettingsContent,
  SettingSection,
  SectionTitle,
  SettingRow,
  SettingLabel,
  SettingControl,
  Overlay,
} from './ShadowSettings.styles';

const { Option } = Select;

export const ShadowSettings: FC = observer(() => {
  const { state, dispatch } = useEditor();
  const { showShadowSettings } = editorStore;

  const handleClose = useCallback(() => {
    editorStore.toggleShadowSettings();
  }, []);

  const handleSettingChange = useCallback((key: string, value: any) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { [key]: value }
    });
  }, [dispatch]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  if (!showShadowSettings) {
    return null;
  }

  const { settings } = state;
  const theme = themeStore.currentTheme;

  return (
    <>
      <Overlay onClick={handleOverlayClick} />
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: theme.colors.primary,
            colorBgContainer: theme.colors.surface,
            colorBgElevated: theme.colors.background,
            colorText: theme.colors.text,
            colorTextSecondary: theme.colors.textSecondary,
            colorBorder: theme.colors.border,
            borderRadius: 6,
          },
          algorithm: theme.mode === 'dark' ? undefined : undefined,
        }}
      >
        <ShadowSettingsContainer>
        <ShadowSettingsHeader>
          <ShadowSettingsTitle>阴影设置</ShadowSettingsTitle>
          <CloseButton onClick={handleClose}>✕</CloseButton>
        </ShadowSettingsHeader>

        <ShadowSettingsContent>
          <SettingSection>
            <SectionTitle>基础设置</SectionTitle>
            
            <SettingRow>
              <SettingLabel>启用阴影</SettingLabel>
              <SettingControl>
                <Switch
                  checked={settings.enableShadows}
                  onChange={(checked) => handleSettingChange('enableShadows', checked)}
                  size="small"
                />
              </SettingControl>
            </SettingRow>

            <SettingRow>
              <SettingLabel>阴影贴图尺寸</SettingLabel>
              <SettingControl>
                <Select
                  value={settings.shadowMapSize}
                  onChange={(value) => handleSettingChange('shadowMapSize', value)}
                  size="small"
                  style={{ width: '100%' }}
                  disabled={!settings.enableShadows}
                >
                  <Option value={512}>512x512</Option>
                  <Option value={1024}>1024x1024</Option>
                  <Option value={2048}>2048x2048</Option>
                  <Option value={4096}>4096x4096</Option>
                </Select>
              </SettingControl>
            </SettingRow>

            <SettingRow>
              <SettingLabel>阴影类型</SettingLabel>
              <SettingControl>
                <Select
                  value={settings.shadowMapType}
                  onChange={(value) => handleSettingChange('shadowMapType', value)}
                  size="small"
                  style={{ width: '100%' }}
                  disabled={!settings.enableShadows}
                >
                  <Option value="Basic">基础阴影</Option>
                  <Option value="PCF">PCF 过滤</Option>
                  <Option value="PCFSoft">PCF 软阴影</Option>
                  <Option value="VSM">方差阴影贴图</Option>
                </Select>
              </SettingControl>
            </SettingRow>
          </SettingSection>

          <SettingSection>
            <SectionTitle>阴影相机设置</SectionTitle>
            
            <SettingRow>
              <SettingLabel>近平面距离</SettingLabel>
              <SettingControl>
                <InputNumber
                  value={settings.shadowCameraNear}
                  onChange={(value) => handleSettingChange('shadowCameraNear', value || 0.1)}
                  min={0.01}
                  max={10}
                  step={0.01}
                  size="small"
                  style={{ width: '100%' }}
                  disabled={!settings.enableShadows}
                />
              </SettingControl>
            </SettingRow>

            <SettingRow>
              <SettingLabel>远平面距离</SettingLabel>
              <SettingControl>
                <InputNumber
                  value={settings.shadowCameraFar}
                  onChange={(value) => handleSettingChange('shadowCameraFar', value || 50)}
                  min={1}
                  max={1000}
                  step={1}
                  size="small"
                  style={{ width: '100%' }}
                  disabled={!settings.enableShadows}
                />
              </SettingControl>
            </SettingRow>
          </SettingSection>

          <SettingSection>
            <SectionTitle>阴影质量设置</SectionTitle>
            
            <SettingRow>
              <SettingLabel>阴影半径</SettingLabel>
              <SettingControl>
                <Slider
                  value={settings.shadowRadius}
                  onChange={(value) => handleSettingChange('shadowRadius', value)}
                  min={0}
                  max={10}
                  step={0.1}
                  disabled={!settings.enableShadows}
                />
              </SettingControl>
            </SettingRow>

            <SettingRow>
              <SettingLabel>阴影偏移</SettingLabel>
              <SettingControl>
                <Slider
                  value={settings.shadowBias * 10000}
                  onChange={(value) => handleSettingChange('shadowBias', value / 10000)}
                  min={-10}
                  max={10}
                  step={0.1}
                  disabled={!settings.enableShadows}
                />
              </SettingControl>
            </SettingRow>
          </SettingSection>
        </ShadowSettingsContent>
        </ShadowSettingsContainer>
      </ConfigProvider>
    </>
  );
}); 