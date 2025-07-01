import React from 'react';
import styled from 'styled-components';

const InfoContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(45, 45, 55, 0.9);
  border-radius: 8px;
  padding: 16px;
  color: white;
  font-size: 13px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  max-width: 300px;
`;

const InfoTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #e0e0e0;
`;

const InfoList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const InfoItem = styled.li`
  margin: 4px 0;
  font-size: 12px;
  color: #ccc;
`;

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

  return (
    <InfoContainer>
      <InfoTitle>操作说明 - {activeTool === 'select' ? '选择工具' : activeTool === 'drag' ? '拖拽工具' : '当前工具'}</InfoTitle>
      <InfoList>
        {getToolInstructions().map((instruction, index) => (
          <InfoItem key={index}>{instruction}</InfoItem>
        ))}
      </InfoList>
    </InfoContainer>
  );
}; 