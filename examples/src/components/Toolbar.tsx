import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Card, Space, Tooltip, ConfigProvider } from 'antd';
import { themeStore } from '@/stores/ThemeStore';
import {
  SelectOutlined,
  DragOutlined,
  PlusOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  SettingOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
  BulbOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';

interface ToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onAddCube: () => void;
  onAddSphere: () => void;
  onAddCylinder: () => void;
  onClearScene: () => void;
  onToggleResourceManager: () => void;
  onToggleFunctionPanel: () => void;
  onToggleTopView: () => void;
  onToggleInfoPanel: () => void;
  onToggleSettingsDropdown: () => void;
  showInfoPanel: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = observer(({
  activeTool,
  onToolChange,
  onAddCube,
  onAddSphere,
  onAddCylinder,
  onClearScene,
  onToggleResourceManager,
  onToggleFunctionPanel,
  onToggleTopView,
  onToggleInfoPanel,
  onToggleSettingsDropdown,
  showInfoPanel,
}) => {
  const theme = themeStore.currentTheme;
  
  const handleToggleTheme = () => {
    themeStore.toggleTheme();
  };

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
      <Card
      style={{
        position: 'fixed',
        top: 20,
        left: 20,
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        backgroundColor: theme.colors.overlay,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.md,
      }}
      styles={{
        body: {
          padding: '12px',
          borderRadius: '8px',
        }
      }}
      variant="borderless"
    >
      <Space>
        <Tooltip title="选择">
          <Button
            type={activeTool === 'select' ? 'primary' : 'default'}
            onClick={() => onToolChange('select')}
            icon={<SelectOutlined />}
          />
        </Tooltip>

        <Tooltip title="拖拽">
          <Button
            type={activeTool === 'drag' ? 'primary' : 'default'}
            onClick={() => onToolChange('drag')}
            icon={<DragOutlined />}
          />
        </Tooltip>

        <Tooltip title="添加立方体">
          <Button onClick={onAddCube} icon={<PlusOutlined />}>
            立方体
          </Button>
        </Tooltip>

        <Tooltip title="添加球体">
          <Button onClick={onAddSphere} icon={<PlusOutlined />}>
            球体
          </Button>
        </Tooltip>

        <Tooltip title="添加圆柱">
          <Button onClick={onAddCylinder} icon={<PlusOutlined />}>
            圆柱
          </Button>
        </Tooltip>

        <Tooltip title="清空场景">
          <Button onClick={onClearScene} icon={<DeleteOutlined />} danger />
        </Tooltip>

        <Tooltip title="资源管理器">
          <Button
            onClick={onToggleResourceManager}
            icon={<AppstoreOutlined />}
          />
        </Tooltip>

        <Tooltip title="属性面板">
          <Button
            onClick={onToggleFunctionPanel}
            icon={<SettingOutlined />}
          />
        </Tooltip>

        <Tooltip title="俯视图">
          <Button
            onClick={onToggleTopView}
            icon={<EyeOutlined />}
          />
        </Tooltip>

        <Tooltip title="设置">
          <Button
            onClick={onToggleSettingsDropdown}
            icon={<SettingOutlined />}
          />
        </Tooltip>

        <Tooltip title={`切换到${theme.mode === 'light' ? '深色' : '浅色'}模式`}>
          <Button
            onClick={handleToggleTheme}
            icon={theme.mode === 'light' ? <MoonOutlined /> : <SunOutlined />}
          />
        </Tooltip>

        <Tooltip title="操作说明">
          <Button
            type={showInfoPanel ? 'primary' : 'default'}
            onClick={onToggleInfoPanel}
            icon={<QuestionCircleOutlined />}
          />
        </Tooltip>
      </Space>
    </Card>
    </ConfigProvider>
  );
}); 