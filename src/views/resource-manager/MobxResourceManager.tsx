import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import { editorStore } from '../../stores/EditorStore';
import { ModelData } from '../../stores/EditorStore';

const ManagerContainer = styled.div`
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

const ManagerHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ManagerTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
`;

const CloseButton = styled.button`
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

const ToolBar = styled.div`
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 8px;
`;

const ToolButton = styled.button`
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

const SearchInput = styled.input`
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

const ObjectList = styled.div`
  padding: 8px 0;
  max-height: 300px;
  overflow-y: auto;
`;

const ObjectItem = styled.div<{ isSelected: boolean; isHidden: boolean }>`
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

const ObjectIcon = styled.span`
  margin-right: 8px;
  font-size: 14px;
`;

const ObjectName = styled.span`
  flex: 1;
  font-size: 12px;
  color: ${props => props.color || '#e0e0e0'};
`;

const ObjectType = styled.span`
  font-size: 10px;
  color: #888;
  margin-left: 8px;
`;

const VisibilityButton = styled.button`
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

const Stats = styled.div`
  padding: 8px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  font-size: 11px;
  color: #ccc;
`;

export const MobxResourceManager: React.FC = observer(() => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  const handleClose = () => {
    editorStore.toggleResourceManager();
  };

  // 获取所有模型
  const allModels = useMemo(() => {
    return editorStore.modelList;
  }, [editorStore.modelList]);

  // 过滤模型
  const filteredModels = useMemo(() => {
    return allModels.filter(model => {
      // 搜索过滤
      if (searchTerm && !model.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // 可见性过滤
      if (filter === 'visible' && !model.visible) return false;
      if (filter === 'hidden' && model.visible) return false;
      
      return true;
    });
  }, [allModels, searchTerm, filter]);

  const handleModelClick = (model: ModelData, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // 多选模式
      editorStore.selectModel(model.id, true);
    } else {
      // 单选模式
      editorStore.selectModel(model.id, false);
    }
  };

  const handleToggleVisibility = (model: ModelData, event: React.MouseEvent) => {
    event.stopPropagation();
    editorStore.updateModel(model.id, { visible: !model.visible });
  };

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'cube': return '🟦';
      case 'sphere': return '🔴';
      case 'cylinder': return '🥫';
      case 'plane': return '🟫';
      case 'mesh': return '📦';
      default: return '❓';
    }
  };

  const stats = {
    total: allModels.length,
    visible: allModels.filter(model => model.visible).length,
    hidden: allModels.filter(model => !model.visible).length,
    selected: editorStore.selectionCount,
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
          placeholder="搜索模型..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ObjectList>
        {filteredModels.length === 0 ? (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#888',
            fontSize: '12px' 
          }}>
            {searchTerm ? '没有找到匹配的模型' : '场景中没有模型'}
          </div>
        ) : (
          filteredModels.map(model => (
            <ObjectItem
              key={model.id}
              isSelected={editorStore.selectedModelIds.includes(model.id)}
              isHidden={!model.visible}
              onClick={(e) => handleModelClick(model, e)}
            >
              <ObjectIcon>{getModelIcon(model.type)}</ObjectIcon>
              <ObjectName>{model.name}</ObjectName>
              <ObjectType>{model.type}</ObjectType>
              <VisibilityButton
                onClick={(e) => handleToggleVisibility(model, e)}
                title={model.visible ? '隐藏' : '显示'}
              >
                {model.visible ? '👁️' : '🙈'}
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