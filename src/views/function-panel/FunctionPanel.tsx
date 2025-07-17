import React from 'react';

import { useEditor } from '../../hooks/useEditor';
import { useSelection } from '../../hooks/useSelection';
import { PropertyEditor } from './PropertyEditor';
import {
  PanelContainer,
  PanelHeader,
  PanelTitle,
  CloseButton,
  PanelContent,
  EmptyState,
  SelectionSummary
} from './FunctionPanel.styles';

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
        <PanelTitle>
          {selectionCount === 0 ? '属性面板' : 
           selectionCount === 1 ? `属性 - ${selectedObjects[0].name}` :
           `属性 - ${selectionCount} 个对象`}
        </PanelTitle>
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
            未选择任何对象
          </EmptyState>
        ) : (
          selectedObjects.map(object => (
            <PropertyEditor
              key={object.id}
              object={object}
              compact={selectionCount > 1}
            />
          ))
        )}
      </PanelContent>
    </PanelContainer>
  );
}; 