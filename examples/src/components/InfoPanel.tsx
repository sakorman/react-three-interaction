import React from 'react';
import { Card, Typography, List } from 'antd';

const { Title, Text } = Typography;

interface InfoPanelProps {
  activeTool: string;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ activeTool }) => {
  const getToolInstructions = () => {
    switch (activeTool) {
      case 'select':
        return [
          '• 左键点击选择对象',
          '• Ctrl + 左键多选',
          '• 右键显示上下文菜单',
          '• 拖拽鼠标旋转视角',
          '• 滚轮缩放视角',
          '• 选中对象后可在右下角编辑属性'
        ];
      case 'drag':
        return [
          '• 点击对象开始拖拽',
          '• 移动鼠标拖拽对象位置',
          '• 释放鼠标结束拖拽',
          '• 支持平面约束拖拽',
          '• 支持网格吸附功能',
          '• 拖拽时会自动选中对象'
        ];
      default:
        return [
          '• 选择工具进行交互',
          '• 使用工具栏切换功能',
          '• 查看具体工具说明'
        ];
    }
  };

  const instructions = getToolInstructions();
  const toolTitle = activeTool === 'select' ? '选择工具' : activeTool === 'drag' ? '拖拽工具' : '当前工具';

  return (
    <Card
      title={`操作说明 - ${toolTitle}`}
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        width: 300,
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        backgroundColor: 'rgba(45, 45, 55, 0.8)',
      }}
      headStyle={{ 
        color: '#e0e0e0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '0 16px',
        minHeight: '40px',
      }}
      bodyStyle={{ padding: '12px 16px', color: '#ccc' }}
      bordered={false}
    >
      <List
        dataSource={instructions}
        renderItem={(item) => (
          <List.Item style={{ padding: '4px 0', borderBottom: 'none' }}>
            <Text style={{ color: '#ccc', fontSize: '12px' }}>{item}</Text>
          </List.Item>
        )}
        size="small"
      />
    </Card>
  );
}; 