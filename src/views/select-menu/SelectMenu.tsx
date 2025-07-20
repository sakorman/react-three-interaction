import React, { useEffect, useRef, useState } from 'react';
import { Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  CopyOutlined,
  ReconciliationOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  AimOutlined,
  SyncOutlined,
  DeleteOutlined,
  MoreOutlined,
  SettingOutlined,
  BgColorsOutlined
} from '@ant-design/icons';

import { useEditor } from '../../hooks/useEditor';
import { useSelection } from '../../hooks/useSelection';
import {
  SelectMenuContainer,
  DropdownContent,
  MenuHeader,
  SelectionInfo,
  SelectionBadge,
  MenuContainer,
  MenuItemIcon,
  HiddenTrigger,
  StyledTooltip
} from './SelectMenu.styles';

interface SelectMenuProps {
  className?: string;
}

export const SelectMenu: React.FC<SelectMenuProps> = ({ className }) => {
  const { state, dispatch, editor } = useEditor();
  const { selectedObjects, hasSelection } = useSelection();
  const menuRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state.showSelectMenu) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [state.showSelectMenu]);

  // 监听选中状态变化，没有选中对象时自动隐藏菜单
  useEffect(() => {
    if (!hasSelection && visible) {
      setVisible(false);
      dispatch({ type: 'HIDE_SELECT_MENU' });
    }
  }, [hasSelection, visible, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible]);

  if (!state.showSelectMenu || !state.selectMenuPosition) {
    return null;
  }

  const handleClose = () => {
    setVisible(false);
    dispatch({ type: 'HIDE_SELECT_MENU' });
  };

  const handleMenuClick = (action: () => void) => {
    return () => {
      action();
      handleClose();
    };
  };

  const handleCopy = () => {
    if (!hasSelection || !editor) return;
    selectedObjects.forEach(obj => {
      const clonedObject = editor.sceneManagerInstance.cloneObject(obj.id);
      if (clonedObject) {
        clonedObject.object3D.position.x += 0.5;
        clonedObject.object3D.position.z += 0.5;
      }
    });
  };

  const handleDuplicate = () => {
    if (!hasSelection || !editor) return;
    selectedObjects.forEach(obj => {
      const clonedObject = editor.sceneManagerInstance.cloneObject(obj.id);
      if (clonedObject) {
        dispatch({ type: 'SELECT_OBJECTS', payload: [clonedObject.id] });
      }
    });
  };

  const handleDelete = () => {
    if (!hasSelection || !editor) return;
    selectedObjects.forEach(obj => editor.removeObject(obj.id));
  };

  const handleHide = () => {
    if (!hasSelection) return;
    selectedObjects.forEach(obj => {
      dispatch({ type: 'UPDATE_SCENE_OBJECT', payload: { id: obj.id, properties: { visible: false } } });
    });
  };

  const handleShow = () => {
    if (!hasSelection) return;
    selectedObjects.forEach(obj => {
      dispatch({ type: 'UPDATE_SCENE_OBJECT', payload: { id: obj.id, properties: { visible: true } } });
    });
  };

  const handleReset = () => {
    if (!hasSelection) return;
    selectedObjects.forEach(obj => {
      dispatch({
        type: 'UPDATE_SCENE_OBJECT',
        payload: {
          id: obj.id,
          properties: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 }
          }
        }
      });
    });
  };

  const handleFocus = () => {
    if (!hasSelection || !editor) return;
    const bounds = selectedObjects[0].getBounds();
    const center = bounds.center;
    dispatch({ type: 'UPDATE_CAMERA', payload: { target: [center.x, center.y, center.z] } });
  };

  const hasHiddenObjects = selectedObjects.some(obj => !obj.visible);
  const hasVisibleObjects = selectedObjects.some(obj => obj.visible);
  const selectedCount = selectedObjects.length;

  // 构建菜单项
  const menuItems: MenuProps['items'] = [
    {
      key: 'copy',
      label: (
        <StyledTooltip title="复制选中对象 (Ctrl+C)" placement="right">
          <Space>
            <MenuItemIcon className="menu-item-icon">
              <CopyOutlined />
            </MenuItemIcon>
            复制
          </Space>
        </StyledTooltip>
      ),
      onClick: handleMenuClick(handleCopy),
      disabled: !hasSelection,
    },
    {
      key: 'duplicate',
      label: (
        <StyledTooltip title="重复选中对象 (Ctrl+D)" placement="right">
          <Space>
            <MenuItemIcon className="menu-item-icon">
              <ReconciliationOutlined />
            </MenuItemIcon>
            重复
          </Space>
        </StyledTooltip>
      ),
      onClick: handleMenuClick(handleDuplicate),
      disabled: !hasSelection,
    },
    { type: 'divider' },
    // 可见性控制
    ...(hasVisibleObjects ? [{
      key: 'hide',
      label: (
        <StyledTooltip title="隐藏选中对象 (H)" placement="right">
          <Space>
            <MenuItemIcon className="menu-item-icon">
              <EyeInvisibleOutlined />
            </MenuItemIcon>
            隐藏
          </Space>
        </StyledTooltip>
      ),
      onClick: handleMenuClick(handleHide),
      disabled: !hasSelection,
    }] : []),
    ...(hasHiddenObjects ? [{
      key: 'show',
      label: (
        <StyledTooltip title="显示选中对象 (Shift+H)" placement="right">
          <Space>
            <MenuItemIcon className="menu-item-icon">
              <EyeOutlined />
            </MenuItemIcon>
            显示
          </Space>
        </StyledTooltip>
      ),
      onClick: handleMenuClick(handleShow),
      disabled: !hasSelection,
    }] : []),
    { type: 'divider' },
    // 变换操作
    {
      key: 'focus',
      label: (
        <StyledTooltip title="聚焦到对象 (F)" placement="right">
          <Space>
            <MenuItemIcon className="menu-item-icon">
              <AimOutlined />
            </MenuItemIcon>
            聚焦到对象
          </Space>
        </StyledTooltip>
      ),
      onClick: handleMenuClick(handleFocus),
      disabled: !hasSelection,
    },
    {
      key: 'reset',
      label: (
        <StyledTooltip title="重置变换 (Ctrl+R)" placement="right">
          <Space>
            <MenuItemIcon className="menu-item-icon">
              <SyncOutlined />
            </MenuItemIcon>
            重置变换
          </Space>
        </StyledTooltip>
      ),
      onClick: handleMenuClick(handleReset),
      disabled: !hasSelection,
    },
    { type: 'divider' },
    // 高级操作子菜单
    {
      key: 'advanced',
      label: (
        <Space>
          <MenuItemIcon className="menu-item-icon">
            <MoreOutlined />
          </MenuItemIcon>
          高级操作
        </Space>
      ),
      disabled: !hasSelection,
      children: [
        {
          key: 'material',
          label: (
            <Space>
              <MenuItemIcon className="menu-item-icon">
                <BgColorsOutlined />
              </MenuItemIcon>
              材质设置
            </Space>
          ),
          disabled: !hasSelection,
        },
        {
          key: 'properties',
          label: (
            <Space>
              <MenuItemIcon className="menu-item-icon">
                <SettingOutlined />
              </MenuItemIcon>
              属性面板
            </Space>
          ),
          disabled: !hasSelection,
        },
      ],
    },
    { type: 'divider' },
    // 危险操作
    {
      key: 'delete',
      label: (
        <StyledTooltip title="删除选中对象 (Delete)" placement="right">
          <Space>
            <MenuItemIcon className="menu-item-icon">
              <DeleteOutlined />
            </MenuItemIcon>
            删除
          </Space>
        </StyledTooltip>
      ),
      onClick: handleMenuClick(handleDelete),
      disabled: !hasSelection,
      danger: true,
    },
  ];

  const dropdownRender = () => (
    <DropdownContent>
      {/* 选中对象信息头部 */}
      <MenuHeader>
        <SelectionBadge 
          count={selectedCount} 
          size="small"
        />
        <SelectionInfo>
          {selectedCount === 1 ? '个对象已选中' : `个对象已选中`}
        </SelectionInfo>
      </MenuHeader>

      {/* 菜单项 */}
      <MenuContainer items={menuItems} />
    </DropdownContent>
  );

  return (
    <SelectMenuContainer
      ref={menuRef}
      className={className}
      style={{
        left: state.selectMenuPosition.x,
        top: state.selectMenuPosition.y,
      }}
    >
      <Dropdown
        open={visible}
        onOpenChange={setVisible}
        dropdownRender={dropdownRender}
        trigger={[]}
        placement="bottomLeft"
        getPopupContainer={() => document.body}
      >
        <HiddenTrigger />
      </Dropdown>
    </SelectMenuContainer>
  );
}; 