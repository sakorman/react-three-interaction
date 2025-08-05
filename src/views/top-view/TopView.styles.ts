import styled from 'styled-components';

// 俯视图容器
export const TopViewContainer = styled.div`
  position: fixed;
  background: rgba(45, 45, 55, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  user-select: none;
  min-width: 200px;
  min-height: 200px;
  
  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
`;

// 俯视图头部
export const TopViewHeader = styled.div`
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 32px;
  cursor: move;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.12);
  }
`;

// 俯视图标题
export const TopViewTitle = styled.h3`
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #e0e0e0;
`;

// 关闭按钮
export const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

// Canvas 容器
export const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  
  canvas {
    width: 100% !important;
    height: 100% !important;
  }
`;

// 俯视图工具栏
export const TopViewToolbar = styled.div`
  padding: 6px;
  display: flex;
  justify-content: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

// 工具按钮
export const ToolButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ccc;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &.active {
    background: rgba(0, 122, 204, 0.5);
    border-color: rgba(0, 122, 204, 0.7);
    color: #fff;
  }
`;

// 状态指示器容器
export const StatusIndicator = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  pointer-events: none;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

// 操作提示
export const HelpOverlay = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: #ccc;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 9px;
  line-height: 1.3;
  pointer-events: none;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
  
  &.visible {
    opacity: 1;
  }
`;

// 交互状态指示器
export const InteractionIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 122, 204, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  pointer-events: none;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(0, 122, 204, 0.5);
  opacity: 0;
  transition: opacity 0.2s ease;
  
  &.visible {
    opacity: 1;
  }
`; 