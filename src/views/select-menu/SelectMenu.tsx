import React, { useEffect, useRef } from 'react';
import { Dropdown, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  CopyOutlined,
  ReconciliationOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  AimOutlined,
  SyncOutlined,
  DeleteOutlined
} from '@ant-design/icons';

import { useEditor } from '../../hooks/useEditor';
import { useSelection } from '../../hooks/useSelection';

export const SelectMenu: React.FC = () => {
  const { state, dispatch, editor } = useEditor();
  const { selectedObjects, hasSelection } = useSelection();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!state.showSelectMenu || !state.selectMenuPosition) {
    return null;
  }

  const handleClose = () => {
    dispatch({ type: 'HIDE_SELECT_MENU' });
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

  const items: MenuProps['items'] = [
    { key: 'copy', label: '复制', icon: <CopyOutlined />, onClick: handleCopy, disabled: !hasSelection },
    { key: 'duplicate', label: '重复', icon: <ReconciliationOutlined />, onClick: handleDuplicate, disabled: !hasSelection },
    { type: 'divider' },
    ...(hasVisibleObjects ? [{ key: 'hide', label: '隐藏', icon: <EyeInvisibleOutlined />, onClick: handleHide, disabled: !hasSelection }] : []),
    ...(hasHiddenObjects ? [{ key: 'show', label: '显示', icon: <EyeOutlined />, onClick: handleShow, disabled: !hasSelection }] : []),
    { type: 'divider' },
    { key: 'focus', label: '聚焦到对象', icon: <AimOutlined />, onClick: handleFocus, disabled: !hasSelection },
    { key: 'reset', label: '重置变换', icon: <SyncOutlined />, onClick: handleReset, disabled: !hasSelection },
    { type: 'divider' },
    { key: 'delete', label: '删除', icon: <DeleteOutlined />, onClick: handleDelete, disabled: !hasSelection, danger: true },
  ];
  
  const menu = <Menu items={items} onClick={handleClose} />;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: state.selectMenuPosition.x,
        top: state.selectMenuPosition.y,
        zIndex: 2000,
      }}
    >
      <Dropdown overlay={menu} open>
        <div />
      </Dropdown>
    </div>
  );
}; 