import React from 'react';
import styled from 'styled-components';

import { useEditor } from '../../hooks/useEditor';
import { useSelection } from '../../hooks/useSelection';

const MenuContainer = styled.div<{ x: number; y: number }>`
  position: fixed;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: rgba(45, 45, 55, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 2000;
  min-width: 160px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: white;
  overflow: hidden;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 13px;
  text-align: left;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.danger:hover {
    background: rgba(255, 59, 48, 0.2);
    color: #ff3b30;
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 4px 0;
`;

const MenuIcon = styled.span`
  margin-right: 8px;
  font-size: 14px;
`;

export const SelectMenu: React.FC = () => {
  const { state, dispatch, editor } = useEditor();
  const { selectedObjects, hasSelection } = useSelection();

  if (!state.showSelectMenu || !state.selectMenuPosition) {
    return null;
  }

  const handleClose = () => {
    dispatch({ type: 'HIDE_SELECT_MENU' });
  };

  const handleCopy = () => {
    if (!hasSelection || !editor) return;
    
    // 复制选中的对象
    selectedObjects.forEach(obj => {
      const clonedObject = editor.sceneManagerInstance.cloneObject(obj.id);
      if (clonedObject) {
        // 稍微偏移位置
        clonedObject.object3D.position.x += 0.5;
        clonedObject.object3D.position.z += 0.5;
      }
    });
    
    handleClose();
  };

  const handleDuplicate = () => {
    if (!hasSelection || !editor) return;
    
    selectedObjects.forEach(obj => {
      const clonedObject = editor.sceneManagerInstance.cloneObject(obj.id);
      if (clonedObject) {
        // 选择新复制的对象
        dispatch({ type: 'SELECT_OBJECTS', payload: [clonedObject.id] });
      }
    });
    
    handleClose();
  };

  const handleDelete = () => {
    if (!hasSelection || !editor) return;
    
    selectedObjects.forEach(obj => {
      editor.removeObject(obj.id);
    });
    
    handleClose();
  };

  const handleHide = () => {
    if (!hasSelection) return;
    
    selectedObjects.forEach(obj => {
      dispatch({
        type: 'UPDATE_SCENE_OBJECT',
        payload: { id: obj.id, properties: { visible: false } }
      });
    });
    
    handleClose();
  };

  const handleShow = () => {
    if (!hasSelection) return;
    
    selectedObjects.forEach(obj => {
      dispatch({
        type: 'UPDATE_SCENE_OBJECT',
        payload: { id: obj.id, properties: { visible: true } }
      });
    });
    
    handleClose();
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
    
    handleClose();
  };

  const handleFocus = () => {
    if (!hasSelection || !editor) return;
    
    // 计算选中对象的中心点
    const bounds = selectedObjects[0].getBounds();
    const center = bounds.center;
    
    // 更新相机目标
    dispatch({
      type: 'UPDATE_CAMERA',
      payload: { target: [center.x, center.y, center.z] }
    });
    
    handleClose();
  };

  // 检查是否有隐藏的对象
  const hasHiddenObjects = selectedObjects.some(obj => !obj.visible);
  const hasVisibleObjects = selectedObjects.some(obj => obj.visible);

  return (
    <>
      {/* 背景遮罩，点击关闭菜单 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1999,
        }}
        onClick={handleClose}
      />
      
      <MenuContainer 
        x={state.selectMenuPosition.x} 
        y={state.selectMenuPosition.y}
      >
        <MenuItem onClick={handleCopy} disabled={!hasSelection}>
          <MenuIcon>📋</MenuIcon>
          复制
        </MenuItem>
        
        <MenuItem onClick={handleDuplicate} disabled={!hasSelection}>
          <MenuIcon>📄</MenuIcon>
          重复
        </MenuItem>
        
        <MenuDivider />
        
        {hasHiddenObjects && (
          <MenuItem onClick={handleShow} disabled={!hasSelection}>
            <MenuIcon>👁️</MenuIcon>
            显示
          </MenuItem>
        )}
        
        {hasVisibleObjects && (
          <MenuItem onClick={handleHide} disabled={!hasSelection}>
            <MenuIcon>🙈</MenuIcon>
            隐藏
          </MenuItem>
        )}
        
        <MenuDivider />
        
        <MenuItem onClick={handleFocus} disabled={!hasSelection}>
          <MenuIcon>🎯</MenuIcon>
          聚焦到对象
        </MenuItem>
        
        <MenuItem onClick={handleReset} disabled={!hasSelection}>
          <MenuIcon>🔄</MenuIcon>
          重置变换
        </MenuItem>
        
        <MenuDivider />
        
        <MenuItem 
          className="danger" 
          onClick={handleDelete} 
          disabled={!hasSelection}
        >
          <MenuIcon>🗑️</MenuIcon>
          删除
        </MenuItem>
      </MenuContainer>
    </>
  );
}; 