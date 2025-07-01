import React from 'react';
import styled from 'styled-components';

const ToolbarContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(45, 45, 55, 0.9);
  border-radius: 8px;
  padding: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  display: flex;
  gap: 8px;
`;

const ToolButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? '#007acc' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.active ? '#007acc' : 'rgba(255, 255, 255, 0.2)'};
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#007acc' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

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
    <ToolbarContainer>
      <ToolButton
        active={activeTool === 'select'}
        onClick={() => onToolChange('select')}
      >
        选择
      </ToolButton>
      
      <ToolButton
        active={activeTool === 'drag'}
        onClick={() => onToolChange('drag')}
      >
        拖拽
      </ToolButton>
      
      <ToolButton onClick={onAddCube}>
        添加立方体
      </ToolButton>
      
      <ToolButton onClick={onAddSphere}>
        添加球体
      </ToolButton>
      
      <ToolButton onClick={onAddCylinder}>
        添加圆柱
      </ToolButton>
      
      <ToolButton onClick={onClearScene}>
        清空场景
      </ToolButton>
      
      <ToolButton onClick={onToggleResourceManager}>
        资源管理器
      </ToolButton>
      
      <ToolButton onClick={onToggleFunctionPanel}>
        属性面板
      </ToolButton>
    </ToolbarContainer>
  );
}; 