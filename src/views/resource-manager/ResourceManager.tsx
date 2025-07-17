import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';

import { useEditor } from '../../hooks/useEditor';
import { useSelection } from '../../hooks/useSelection';
import { SceneObject } from '../../models/SceneObject';
import { editorStore } from '../../stores/EditorStore';
import {
  ManagerContainer,
  ManagerHeader,
  ManagerTitle,
  CloseButton,
  ToolBar,
  ToolButton,
  SearchInput,
  ObjectList,
  ObjectItem,
  ObjectIcon,
  ObjectName,
  ObjectType,
  VisibilityButton,
  Stats
} from './ResourceManager.styles';

export const ResourceManager: React.FC = observer(() => {
  const { state, dispatch } = useEditor();
  const { selectedObjectIds, selectObject, isSelected } = useSelection();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  const handleClose = () => {
    editorStore.toggleResourceManager();
  };

  // 获取所有对象并转换为数组
  const allObjects = useMemo(() => {
    return Array.from(state.sceneObjects.values());
  }, [state.sceneObjects]);

  // 过滤对象
  const filteredObjects = useMemo(() => {
    return allObjects.filter(obj => {
      // 搜索过滤
      if (searchTerm && !obj.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // 可见性过滤
      if (filter === 'visible' && !obj.visible) return false;
      if (filter === 'hidden' && obj.visible) return false;
      
      return true;
    });
  }, [allObjects, searchTerm, filter]);

  const handleObjectClick = (object: SceneObject, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // 多选模式
      if (isSelected(object.id)) {
        dispatch({ type: 'REMOVE_SELECTION', payload: object.id });
      } else {
        dispatch({ type: 'ADD_SELECTION', payload: object.id });
      }
    } else {
      // 单选模式
      selectObject(object.id);
    }
  };

  const handleToggleVisibility = (object: SceneObject, event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch({
      type: 'UPDATE_SCENE_OBJECT',
      payload: { id: object.id, properties: { visible: !object.visible } }
    });
  };

  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'mesh': return '📦';
      case 'group': return '📁';
      case 'light': return '💡';
      case 'camera': return '📷';
      case 'helper': return '🔧';
      default: return '❓';
    }
  };

  const stats = {
    total: allObjects.length,
    visible: allObjects.filter(obj => obj.visible).length,
    hidden: allObjects.filter(obj => !obj.visible).length,
    selected: selectedObjectIds.length,
  };

  if (!editorStore.showResourceManager) {
    return null;
  }

  return (
    <ManagerContainer>
      <ManagerHeader>
        <ManagerTitle>资源管理器</ManagerTitle>
        <CloseButton onClick={handleClose}>✕</CloseButton>
      </ManagerHeader>

      <ToolBar>
        <ToolButton 
          style={{ 
            background: filter === 'all' ? 'rgba(0, 122, 204, 0.5)' : undefined 
          }}
          onClick={() => setFilter('all')}
        >
          全部
        </ToolButton>
        <ToolButton 
          style={{ 
            background: filter === 'visible' ? 'rgba(0, 122, 204, 0.5)' : undefined 
          }}
          onClick={() => setFilter('visible')}
        >
          可见
        </ToolButton>
        <ToolButton 
          style={{ 
            background: filter === 'hidden' ? 'rgba(0, 122, 204, 0.5)' : undefined 
          }}
          onClick={() => setFilter('hidden')}
        >
          隐藏
        </ToolButton>
      </ToolBar>

      <div style={{ padding: '8px 12px' }}>
        <SearchInput
          type="text"
          placeholder="搜索对象..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ObjectList>
        {filteredObjects.length === 0 ? (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#888',
            fontSize: '12px' 
          }}>
            {searchTerm ? '没有找到匹配的对象' : '场景中没有对象'}
          </div>
        ) : (
          filteredObjects.map(object => (
            <ObjectItem
              key={object.id}
              isSelected={isSelected(object.id)}
              isHidden={!object.visible}
              onClick={(e) => handleObjectClick(object, e)}
            >
              <ObjectIcon>{getObjectIcon(object.type)}</ObjectIcon>
              <ObjectName>{object.name}</ObjectName>
              <ObjectType>{object.type}</ObjectType>
              <VisibilityButton
                onClick={(e) => handleToggleVisibility(object, e)}
                title={object.visible ? '隐藏' : '显示'}
              >
                {object.visible ? '👁️' : '🙈'}
              </VisibilityButton>
            </ObjectItem>
          ))
        )}
      </ObjectList>

      <Stats>
        总计: {stats.total} | 可见: {stats.visible} | 隐藏: {stats.hidden} | 已选: {stats.selected}
      </Stats>
    </ManagerContainer>
  );
}); 