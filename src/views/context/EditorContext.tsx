import { createContext, useContext, useCallback, useEffect, useState, type ReactNode, type FC } from 'react';

import { EditorCore } from '../../core/EditorCore';
import { EditorState, EditorAction } from '../../models/EditorState';

export interface EditorContextValue {
  editor: EditorCore | null;
  state: EditorState;
  dispatch: (action: EditorAction) => void;
  isReady: boolean;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export interface EditorProviderProps {
  children: ReactNode;
  canvas?: HTMLCanvasElement;
  editor?: EditorCore;
}

export const EditorProvider: FC<EditorProviderProps> = ({
  children,
  canvas,
  editor: externalEditor,
}) => {
  const [editor, setEditor] = useState<EditorCore | null>(externalEditor || null);
  const [state, setState] = useState<EditorState>(() => 
    externalEditor?.getState() || {} as EditorState
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (externalEditor) {
      setEditor(externalEditor);
      setState(externalEditor.getState());
      setIsReady(externalEditor.isReady);
      
      // 订阅状态变化
      const unsubscribe = externalEditor.subscribe((newState: EditorState) => {
        setState(newState);
      });

      return unsubscribe;
    } else if (canvas) {
      // 创建新的编辑器实例
      const newEditor = new EditorCore(canvas);
      setEditor(newEditor);
      setState(newEditor.getState());
      setIsReady(newEditor.isReady);

      // 订阅状态变化
      const unsubscribe = newEditor.subscribe((newState: EditorState) => {
        setState(newState);
      });

      return () => {
        unsubscribe();
        newEditor.dispose();
      };
    }
  }, [canvas, externalEditor]);

  const dispatch = useCallback((action: EditorAction) => {
    if (editor) {
      editor.dispatch(action);
    }
  }, [editor]);

  const contextValue: EditorContextValue = {
    editor,
    state,
    dispatch,
    isReady,
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
};

export default EditorContext; 