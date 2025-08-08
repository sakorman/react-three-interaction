import { useMemo } from 'react';

import { useEditor } from './useEditor';

export const useSelection = () => {
  const { state, dispatch, editor } = useEditor();

  const selectedObjects = useMemo(() => {
    if (!editor) return null;
    return state.selectedObjectIds
      .map(id => editor.getObject(id))
      .filter(obj => obj !== undefined);
  }, [state.selectedObjectIds, editor]);

  const selectObject = (objectId: string, addToSelection = false) => {
    if (addToSelection && state.settings.multiSelect) {
      if (!state.selectedObjectIds.includes(objectId)) {
        dispatch({ type: 'ADD_SELECTION', payload: objectId });
      }
    } else {
      dispatch({ type: 'SELECT_OBJECTS', payload: [objectId] });
    }
  };

  const deselectObject = (objectId: string) => {
    dispatch({ type: 'REMOVE_SELECTION', payload: objectId });
  };

  const clearSelection = () => {
    dispatch({ type: 'CLEAR_SELECTION' });
  };

  const selectAll = () => {
    if (!editor) return;
    const allObjectIds = editor.getAllObjects().map(obj => obj.id);
    dispatch({ type: 'SELECT_OBJECTS', payload: allObjectIds });
  };

  const isSelected = (objectId: string) => {
    return state.selectedObjectIds.includes(objectId);
  };

  const hasSelection = state.selectedObjectIds.length > 0;
  const selectionCount = state.selectedObjectIds.length;

  return {
    selectedObjectIds: state.selectedObjectIds,
    selectedObjects,
    hoveredObjectId: state.hoveredObjectId,
    selectObject,
    deselectObject,
    clearSelection,
    selectAll,
    isSelected,
    hasSelection,
    selectionCount,
  };
}; 