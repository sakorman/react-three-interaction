import styled from 'styled-components';

// 俯视图容器
export const TopViewContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 200px;
  height: 200px;
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