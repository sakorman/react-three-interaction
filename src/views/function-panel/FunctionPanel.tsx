import React from 'react';
import styled from 'styled-components';

import { useEditor } from '../../hooks/useEditor';
import { useSelection } from '../../hooks/useSelection';
import { PropertyEditor } from './PropertyEditor';

const PanelContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  max-height: 60vh;
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

const PanelHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelTitle = styled.h3`
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

const PanelContent = styled.div`
  padding: 16px;
  overflow-y: auto;
  max-height: calc(60vh - 60px);
`;

const EmptyState = styled.div`
  text-align: center;
  color: #888;
  padding: 20px;
`;

const SelectionSummary = styled.div`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  color: #ccc;
`;

export const FunctionPanel: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { selectedObjects, selectionCount } = useSelection();

  if (!state.showFunctionPanel) {
    return null;
  }

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_FUNCTION_PANEL' });
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>属性面板</PanelTitle>
        <CloseButton onClick={handleClose}>✕</CloseButton>
      </PanelHeader>
      
      {selectionCount > 0 && (
        <SelectionSummary>
          已选择 {selectionCount} 个对象
        </SelectionSummary>
      )}

      <PanelContent>
        {selectionCount === 0 ? (
          <EmptyState>
            请选择一个或多个对象来查看属性
          </EmptyState>
        ) : selectionCount === 1 ? (
          <PropertyEditor object={selectedObjects[0]} />
        ) : (
          <div>
            <h4 style={{ margin: '0 0 12px 0' }}>多对象编辑</h4>
            {selectedObjects.map((obj, index) => (
              <div key={obj.id} style={{ marginBottom: '16px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#ccc' }}>
                  {obj.name || `对象 ${index + 1}`}
                </h5>
                <PropertyEditor object={obj} compact />
              </div>
            ))}
          </div>
        )}
      </PanelContent>
    </PanelContainer>
  );
}; 