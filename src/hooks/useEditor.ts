import { useContext } from 'react';

import EditorContext from '../views/context/EditorContext';

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
}; 