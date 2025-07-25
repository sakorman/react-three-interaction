import React from 'react';
import { Button, Card, Space, Tooltip } from 'antd';
import {
  SelectOutlined,
  DragOutlined,
  PlusOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  SettingOutlined,
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
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onToolChange,
  onAddCube,
  onAddSphere,
  onAddCylinder,
  onClearScene,
  onToggleResourceManager,
  onToggleFunctionPanel,
}) => {
  return (
    <Card
      style={{
        position: 'fixed',
        top: 20,
        left: 20,
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        backgroundColor: 'rgba(45, 45, 55, 0.8)',
      }}
      bodyStyle={{
        padding: '12px',
        borderRadius: '8px',
      }}
      bordered={false}
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
      </Space>
    </Card>
  );
}; 