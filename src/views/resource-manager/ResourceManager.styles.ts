import styled from 'styled-components';

// 主容器
export const ManagerContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 280px;
  max-height: 50vh;
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
`;

// 头部容器
export const ManagerHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// 标题
export const ManagerTitle = styled.h3`
  margin: 0;
  font-size: 14px;
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
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

// 工具栏
export const ToolBar = styled.div`
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 8px;
`;

// 工具按钮
export const ToolButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 搜索输入框
export const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 6px 8px;
  color: white;
  font-size: 12px;
  margin-bottom: 8px;
  
  &:focus {
    outline: none;
    border-color: #007acc;
    background: rgba(255, 255, 255, 0.15);
  }
  
  &::placeholder {
    color: #888;
  }
`;

// 对象列表容器
export const ObjectList = styled.div`
  padding: 8px 0;
  max-height: 300px;
  overflow-y: auto;
`;

// 对象项
export const ObjectItem = styled.div<{ isSelected: boolean; isHidden: boolean }>`
  display: flex;
  align-items: center;
  padding: 6px 16px;
  cursor: pointer;
  transition: background 0.15s;
  opacity: ${props => props.isHidden ? 0.5 : 1};
  background: ${props => props.isSelected ? 'rgba(0, 122, 204, 0.3)' : 'transparent'};
  
  &:hover {
    background: ${props => props.isSelected ? 'rgba(0, 122, 204, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

// 对象图标
export const ObjectIcon = styled.span`
  margin-right: 8px;
  font-size: 14px;
`;

// 对象名称
export const ObjectName = styled.span<{ color?: string }>`
  flex: 1;
  font-size: 12px;
  color: ${props => props.color || '#e0e0e0'};
`;

// 对象类型
export const ObjectType = styled.span`
  font-size: 10px;
  color: #888;
  margin-left: 8px;
`;

// 可见性按钮
export const VisibilityButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 2px;
  margin-left: 8px;
  font-size: 12px;
  
  &:hover {
    color: #fff;
  }
`;

// 统计信息
export const Stats = styled.div`
  padding: 8px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  font-size: 11px;
  color: #ccc;
`; 