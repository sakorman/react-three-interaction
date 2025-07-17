import styled, { keyframes } from 'styled-components';
import { Badge, Menu, Tooltip } from 'antd';

// 动画定义
export const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

// 主容器
export const SelectMenuContainer = styled.div`
  position: fixed;
  z-index: 2000;
`;

// 下拉菜单内容容器
export const DropdownContent = styled.div`
  min-width: 180px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  animation: ${slideInUp} 0.2s ease-out;

  @media (max-width: 768px) {
    min-width: 160px;
    font-size: 14px;
  }

  @media (prefers-color-scheme: dark) {
    background: #1f1f1f;
    box-shadow: 
      0 6px 16px 0 rgba(0, 0, 0, 0.3),
      0 3px 6px -4px rgba(0, 0, 0, 0.2),
      0 9px 28px 8px rgba(0, 0, 0, 0.15);
  }
`;

// 菜单头部
export const MenuHeader = styled.div`
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    padding: 6px 10px;
  }

  @media (prefers-color-scheme: dark) {
    background: #262626;
    border-bottom-color: #303030;
  }
`;

// 选中信息文本
export const SelectionInfo = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;

  @media (prefers-color-scheme: dark) {
    color: #a6a6a6;
  }
`;

// 选中数量徽章
export const SelectionBadge = styled(Badge)`
  .ant-badge-count {
    background-color: #1890ff !important;
    font-weight: 600;
  }
`;

// 菜单容器
export const MenuContainer = styled(Menu)`
  border: none;
  background: transparent;

  .ant-menu-item {
    padding: 8px 12px;
    margin: 2px 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      background-color: #f5f5f5;
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      padding: 6px 10px;
    }

    @media (prefers-color-scheme: dark) {
      &:hover {
        background-color: #262626;
      }
    }
  }

  .ant-menu-item-danger {
    color: #ff4d4f;

    &:hover {
      background-color: #fff2f0;
      color: #ff4d4f;
    }

    .menu-item-icon {
      color: #ff4d4f;
    }
  }

  .ant-menu-submenu {
    margin: 2px 4px;
    border-radius: 4px;

    .ant-menu-submenu-title {
      padding: 8px 12px;
      transition: all 0.2s ease;

      &:hover {
        background-color: #f5f5f5;
      }

      @media (prefers-color-scheme: dark) {
        &:hover {
          background-color: #262626;
        }
      }
    }

    .ant-menu-item {
      padding: 6px 12px;

      &:hover {
        background-color: #f0f6ff;
      }

      @media (prefers-color-scheme: dark) {
        &:hover {
          background-color: #001529;
        }
      }
    }
  }

  .ant-menu-item-divider {
    margin: 4px 0;
    background-color: #f0f0f0;

    @media (prefers-color-scheme: dark) {
      background-color: #303030;
    }
  }
`;

// 菜单项图标
export const MenuItemIcon = styled.span`
  color: #8c8c8c;
  transition: color 0.2s ease;

  .ant-menu-item:hover & {
    color: #1890ff;
  }

  @media (prefers-color-scheme: dark) {
    color: #8c8c8c;

    .ant-menu-item:hover & {
      color: #40a9ff;
    }
  }
`;

// 隐藏的触发器
export const HiddenTrigger = styled.div`
  width: 1px;
  height: 1px;
  position: absolute;
  pointer-events: none;
  opacity: 0;
`;

// 自定义工具提示
export const StyledTooltip = styled(Tooltip)`
  z-index: 2100;
`;

// 菜单分组样式（可选，用于将来扩展）
export const MenuGroup = styled.div`
  padding: 4px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
    
    @media (prefers-color-scheme: dark) {
      border-bottom-color: #303030;
    }
  }
`;

// 子菜单样式增强（可选）
export const SubMenuTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
`;

// 菜单项标签样式（可选）
export const MenuItemLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

// 快捷键显示样式（可选，用于将来扩展）
export const ShortcutKey = styled.span`
  margin-left: auto;
  font-size: 11px;
  color: #999;
  font-family: monospace;
  
  @media (prefers-color-scheme: dark) {
    color: #666;
  }
`; 