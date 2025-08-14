import { useCallback, useState, type FC } from 'react';
import { observer } from 'mobx-react-lite';
import { 
  Switch, 
  Slider, 
  InputNumber, 
  ConfigProvider, 
  Popover,
  Row,
  Col,
} from 'antd';
import { SketchPicker } from 'react-color';
import { editorStore } from '../../stores/EditorStore';
import { themeStore } from '../../stores/ThemeStore';
import { useEditor } from '../../hooks/useEditor';
import {
  LightingSettingsContainer,
  LightingSettingsHeader,
  LightingSettingsTitle,
  CloseButton,
  LightingSettingsContent,
  SettingSection,
  SectionTitle,
  SettingRow,
  SettingLabel,
  SettingControl,
  ColorPickerButton,
  LightTypeCard,
  LightTypeHeader,
  LightTypeName,
  Overlay,
} from './LightingSettings.styles';

export const LightingSettings: FC = observer(() => {
  const { state, dispatch } = useEditor();
  const { showLightingSettings } = editorStore;
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    editorStore.toggleLightingSettings();
  }, []);

  const handleSettingChange = useCallback((key: string, value: any) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { [key]: value }
    });
  }, [dispatch]);

  const handleColorChange = useCallback((colorKey: string, color: any) => {
    handleSettingChange(colorKey, color.hex);
    setColorPickerOpen(null);
  }, [handleSettingChange]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  if (!showLightingSettings) {
    return null;
  }

  const { settings } = state;
  const theme = themeStore.currentTheme;

  const ColorPicker: FC<{ 
    colorKey: string; 
    currentColor: string; 
    label: string;
  }> = ({ colorKey, currentColor, label }) => (
    <Popover
      content={
        <SketchPicker
          color={currentColor}
          onChange={(color) => handleColorChange(colorKey, color)}
        />
      }
      trigger="click"
      open={colorPickerOpen === colorKey}
      onOpenChange={(open) => setColorPickerOpen(open ? colorKey : null)}
    >
      <ColorPickerButton 
        style={{ backgroundColor: currentColor }}
        title={`选择${label}颜色`}
      />
    </Popover>
  );

  return (
    <>
      <Overlay onClick={handleOverlayClick} />
      
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
          },
        }}
      >
        <LightingSettingsContainer>
          <LightingSettingsHeader>
            <LightingSettingsTitle>光照设置</LightingSettingsTitle>
            <CloseButton onClick={handleClose}>✕</CloseButton>
          </LightingSettingsHeader>

          <LightingSettingsContent>
            {/* 环境光设置 */}
            <SettingSection>
              <SectionTitle>环境光</SectionTitle>
              <LightTypeCard enabled={true}>
                <SettingRow>
                  <SettingLabel>强度</SettingLabel>
                  <SettingControl>
                    <Row gutter={12}>
                      <Col span={16}>
                        <Slider
                          min={0}
                          max={2}
                          step={0.1}
                          value={settings.ambientLightIntensity}
                          onChange={(value) => handleSettingChange('ambientLightIntensity', value)}
                        />
                      </Col>
                      <Col span={8}>
                        <InputNumber
                          min={0}
                          max={2}
                          step={0.1}
                          value={settings.ambientLightIntensity}
                          onChange={(value) => handleSettingChange('ambientLightIntensity', value)}
                        />
                      </Col>
                    </Row>
                  </SettingControl>
                </SettingRow>
                <SettingRow>
                  <SettingLabel>颜色</SettingLabel>
                  <SettingControl>
                    <ColorPicker 
                      colorKey="ambientLightColor" 
                      currentColor={settings.ambientLightColor}
                      label="环境光"
                    />
                  </SettingControl>
                </SettingRow>
              </LightTypeCard>
            </SettingSection>

            {/* 平行光设置 */}
            <SettingSection>
              <SectionTitle>平行光</SectionTitle>
              <LightTypeCard enabled={settings.enableDirectionalLight}>
                <LightTypeHeader>
                  <LightTypeName>平行光</LightTypeName>
                  <Switch
                    checked={settings.enableDirectionalLight}
                    onChange={(checked) => handleSettingChange('enableDirectionalLight', checked)}
                  />
                </LightTypeHeader>
                {settings.enableDirectionalLight && (
                  <>
                    <SettingRow>
                      <SettingLabel>强度</SettingLabel>
                      <SettingControl>
                        <Row gutter={12}>
                          <Col span={16}>
                            <Slider
                              min={0}
                              max={3}
                              step={0.1}
                              value={settings.directionalLightIntensity}
                              onChange={(value) => handleSettingChange('directionalLightIntensity', value)}
                            />
                          </Col>
                          <Col span={8}>
                            <InputNumber
                              min={0}
                              max={3}
                              step={0.1}
                              value={settings.directionalLightIntensity}
                              onChange={(value) => handleSettingChange('directionalLightIntensity', value)}
                            />
                          </Col>
                        </Row>
                      </SettingControl>
                    </SettingRow>
                    <SettingRow>
                      <SettingLabel>颜色</SettingLabel>
                      <SettingControl>
                        <ColorPicker 
                          colorKey="directionalLightColor" 
                          currentColor={settings.directionalLightColor}
                          label="平行光"
                        />
                      </SettingControl>
                    </SettingRow>
                    <SettingRow>
                      <SettingLabel>位置 X</SettingLabel>
                      <SettingControl>
                        <Row gutter={12}>
                          <Col span={16}>
                            <Slider
                              min={-10}
                              max={10}
                              step={0.5}
                              value={settings.directionalLightPosition.x}
                              onChange={(value) => handleSettingChange('directionalLightPosition', 
                                { ...settings.directionalLightPosition, x: value })}
                            />
                          </Col>
                          <Col span={8}>
                            <InputNumber
                              min={-10}
                              max={10}
                              step={0.5}
                              value={settings.directionalLightPosition.x}
                              onChange={(value) => handleSettingChange('directionalLightPosition', 
                                { ...settings.directionalLightPosition, x: value })}
                            />
                          </Col>
                        </Row>
                      </SettingControl>
                    </SettingRow>
                    <SettingRow>
                      <SettingLabel>位置 Y</SettingLabel>
                      <SettingControl>
                        <Row gutter={12}>
                          <Col span={16}>
                            <Slider
                              min={-10}
                              max={10}
                              step={0.5}
                              value={settings.directionalLightPosition.y}
                              onChange={(value) => handleSettingChange('directionalLightPosition', 
                                { ...settings.directionalLightPosition, y: value })}
                            />
                          </Col>
                          <Col span={8}>
                            <InputNumber
                              min={-10}
                              max={10}
                              step={0.5}
                              value={settings.directionalLightPosition.y}
                              onChange={(value) => handleSettingChange('directionalLightPosition', 
                                { ...settings.directionalLightPosition, y: value })}
                            />
                          </Col>
                        </Row>
                      </SettingControl>
                    </SettingRow>
                    <SettingRow>
                      <SettingLabel>位置 Z</SettingLabel>
                      <SettingControl>
                        <Row gutter={12}>
                          <Col span={16}>
                            <Slider
                              min={-10}
                              max={10}
                              step={0.5}
                              value={settings.directionalLightPosition.z}
                              onChange={(value) => handleSettingChange('directionalLightPosition', 
                                { ...settings.directionalLightPosition, z: value })}
                            />
                          </Col>
                          <Col span={8}>
                            <InputNumber
                              min={-10}
                              max={10}
                              step={0.5}
                              value={settings.directionalLightPosition.z}
                              onChange={(value) => handleSettingChange('directionalLightPosition', 
                                { ...settings.directionalLightPosition, z: value })}
                            />
                          </Col>
                        </Row>
                      </SettingControl>
                    </SettingRow>
                  </>
                )}
              </LightTypeCard>
            </SettingSection>

            {/* 点光源设置 */}
            <SettingSection>
              <SectionTitle>点光源</SectionTitle>
              <LightTypeCard enabled={settings.enablePointLight}>
                <LightTypeHeader>
                  <LightTypeName>点光源</LightTypeName>
                  <Switch
                    checked={settings.enablePointLight}
                    onChange={(checked) => handleSettingChange('enablePointLight', checked)}
                  />
                </LightTypeHeader>
                {settings.enablePointLight && (
                  <>
                    <SettingRow>
                      <SettingLabel>强度</SettingLabel>
                      <SettingControl>
                        <Row gutter={12}>
                          <Col span={16}>
                            <Slider
                              min={0}
                              max={3}
                              step={0.1}
                              value={settings.pointLightIntensity}
                              onChange={(value) => handleSettingChange('pointLightIntensity', value)}
                            />
                          </Col>
                          <Col span={8}>
                            <InputNumber
                              min={0}
                              max={3}
                              step={0.1}
                              value={settings.pointLightIntensity}
                              onChange={(value) => handleSettingChange('pointLightIntensity', value)}
                            />
                          </Col>
                        </Row>
                      </SettingControl>
                    </SettingRow>
                    <SettingRow>
                      <SettingLabel>颜色</SettingLabel>
                      <SettingControl>
                        <ColorPicker 
                          colorKey="pointLightColor" 
                          currentColor={settings.pointLightColor}
                          label="点光源"
                        />
                      </SettingControl>
                    </SettingRow>
                    <SettingRow>
                      <SettingLabel>位置 X</SettingLabel>
                      <SettingControl>
                        <Row gutter={12}>
                          <Col span={16}>
                            <Slider
                              min={-10}
                              max={10}
                              step={0.5}
                              value={settings.pointLightPosition.x}
                              onChange={(value) => handleSettingChange('pointLightPosition', 
                                { ...settings.pointLightPosition, x: value })}
                            />
                          </Col>
                          <Col span={8}>
                            <InputNumber
                              min={-10}
                              max={10}
                              step={0.5}
                              value={settings.pointLightPosition.x}
                              onChange={(value) => handleSettingChange('pointLightPosition', 
                                { ...settings.pointLightPosition, x: value })}
                            />
                          </Col>
                        </Row>
                      </SettingControl>
                    </SettingRow>
                    <SettingRow>
                      <SettingLabel>位置 Y</SettingLabel>
                      <SettingControl>
                        <Row gutter={12}>
                          <Col span={16}>
                            <Slider
                              min={-10}
                              max={10}
                              step={0.5}
                              value={settings.pointLightPosition.y}
                              onChange={(value) => handleSettingChange('pointLightPosition', 
                                { ...settings.pointLightPosition, y: value })}
                            />
                          </Col>
                          <Col span={8}>
                            <InputNumber
                              min={-10}
                              max={10}
                              step={0.5}
                              value={settings.pointLightPosition.y}
                              onChange={(value) => handleSettingChange('pointLightPosition', 
                                { ...settings.pointLightPosition, y: value })}
                            />
                          </Col>
                        </Row>
                      </SettingControl>
                    </SettingRow>
                    <SettingRow>
                      <SettingLabel>位置 Z</SettingLabel>
                      <SettingControl>
                        <Row gutter={12}>
                          <Col span={16}>
                            <Slider
                              min={-10}
                              max={10}
                              step={0.5}
                              value={settings.pointLightPosition.z}
                              onChange={(value) => handleSettingChange('pointLightPosition', 
                                { ...settings.pointLightPosition, z: value })}
                            />
                          </Col>
                          <Col span={8}>
                            <InputNumber
                              min={-10}
                              max={10}
                              step={0.5}
                              value={settings.pointLightPosition.z}
                              onChange={(value) => handleSettingChange('pointLightPosition', 
                                { ...settings.pointLightPosition, z: value })}
                            />
                          </Col>
                        </Row>
                      </SettingControl>
                    </SettingRow>
                  </>
                )}
              </LightTypeCard>
            </SettingSection>

            {/* 聚光灯设置 */}
            <SettingSection>
              <SectionTitle>聚光灯</SectionTitle>
              <LightTypeCard enabled={settings.enableSpotLight}>
                <LightTypeHeader>
                  <LightTypeName>聚光灯</LightTypeName>
                  <Switch
                    checked={settings.enableSpotLight}
                    onChange={(checked) => handleSettingChange('enableSpotLight', checked)}
                  />
                </LightTypeHeader>
                {settings.enableSpotLight && (
                  <>
                    <SettingRow>
                      <SettingLabel>强度</SettingLabel>
                      <SettingControl>
                        <Row gutter={12}>
                          <Col span={16}>
                            <Slider
                              min={0}
                              max={3}
                              step={0.1}
                              value={settings.spotLightIntensity}
                              onChange={(value) => handleSettingChange('spotLightIntensity', value)}
                            />
                          </Col>
                          <Col span={8}>
                            <InputNumber
                              min={0}
                              max={3}
                              step={0.1}
                              value={settings.spotLightIntensity}
                              onChange={(value) => handleSettingChange('spotLightIntensity', value)}
                            />
                          </Col>
                        </Row>
                      </SettingControl>
                    </SettingRow>
                    <SettingRow>
                      <SettingLabel>颜色</SettingLabel>
                      <SettingControl>
                        <ColorPicker 
                          colorKey="spotLightColor" 
                          currentColor={settings.spotLightColor}
                          label="聚光灯"
                        />
                      </SettingControl>
                    </SettingRow>
                    <SettingRow>
                      <SettingLabel>角度</SettingLabel>
                      <SettingControl>
                        <Row gutter={12}>
                          <Col span={16}>
                            <Slider
                              min={0}
                              max={Math.PI / 2}
                              step={0.1}
                              value={settings.spotLightAngle}
                              onChange={(value) => handleSettingChange('spotLightAngle', value)}
                            />
                          </Col>
                          <Col span={8}>
                            <InputNumber
                              min={0}
                              max={Math.PI / 2}
                              step={0.1}
                              value={settings.spotLightAngle}
                              onChange={(value) => handleSettingChange('spotLightAngle', value)}
                            />
                          </Col>
                        </Row>
                      </SettingControl>
                    </SettingRow>
                    <SettingRow>
                      <SettingLabel>半影</SettingLabel>
                      <SettingControl>
                        <Row gutter={12}>
                          <Col span={16}>
                            <Slider
                              min={0}
                              max={1}
                              step={0.1}
                              value={settings.spotLightPenumbra}
                              onChange={(value) => handleSettingChange('spotLightPenumbra', value)}
                            />
                          </Col>
                          <Col span={8}>
                            <InputNumber
                              min={0}
                              max={1}
                              step={0.1}
                              value={settings.spotLightPenumbra}
                              onChange={(value) => handleSettingChange('spotLightPenumbra', value)}
                            />
                          </Col>
                        </Row>
                      </SettingControl>
                    </SettingRow>
                  </>
                )}
              </LightTypeCard>
            </SettingSection>
          </LightingSettingsContent>
        </LightingSettingsContainer>
      </ConfigProvider>
    </>
  );
}); 