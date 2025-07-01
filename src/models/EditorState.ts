import { SceneObject } from './SceneObject';

export type EditorTool = 'select' | 'drag' | 'move' | 'rotate' | 'scale' | 'add' | 'delete';

export interface EditorCamera {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

export interface EditorState {
  // 工具状态
  activeTool: EditorTool;
  isEnabled: boolean;
  
  // 选择状态
  selectedObjectIds: string[];
  hoveredObjectId: string | null;
  
  // 场景对象管理
  sceneObjects: Map<string, SceneObject>;
  objectHierarchy: string[]; // 根对象ID列表
  
  // 摄像机状态
  camera: EditorCamera;
  
  // UI状态
  showFunctionPanel: boolean;
  showResourceManager: boolean;
  showSelectMenu: boolean;
  selectMenuPosition: { x: number; y: number } | null;
  
  // 历史记录
  history: EditorSnapshot[];
  historyIndex: number;
  maxHistorySize: number;
  
  // 设置
  settings: EditorSettings;
}

export interface EditorSnapshot {
  id: string;
  timestamp: number;
  description: string;
  state: {
    sceneObjects: Array<{
      id: string;
      properties: any;
    }>;
    selectedObjectIds: string[];
  };
}

export interface EditorSettings {
  // 选择设置
  multiSelect: boolean;
  selectThroughMeshes: boolean;
  
  // 变换设置
  snapToGrid: boolean;
  gridSize: number;
  
  // 渲染设置
  showGrid: boolean;
  showAxes: boolean;
  showBoundingBoxes: boolean;
  
  // 性能设置
  maxSelectableObjects: number;
  enableAutoSave: boolean;
  autoSaveInterval: number;
}

export const defaultEditorState: EditorState = {
  activeTool: 'select',
  isEnabled: true,
  selectedObjectIds: [],
  hoveredObjectId: null,
  sceneObjects: new Map(),
  objectHierarchy: [],
  camera: {
    position: [5, 5, 5],
    target: [0, 0, 0],
    zoom: 1,
  },
  showFunctionPanel: true,
  showResourceManager: true,
  showSelectMenu: false,
  selectMenuPosition: null,
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
  settings: {
    multiSelect: true,
    selectThroughMeshes: false,
    snapToGrid: false,
    gridSize: 1,
    showGrid: true,
    showAxes: true,
    showBoundingBoxes: false,
    maxSelectableObjects: 1000,
    enableAutoSave: true,
    autoSaveInterval: 30000,
  },
};

// 状态更新操作类型
export type EditorAction = 
  | { type: 'SET_ACTIVE_TOOL'; payload: EditorTool }
  | { type: 'SET_ENABLED'; payload: boolean }
  | { type: 'SELECT_OBJECTS'; payload: string[] }
  | { type: 'ADD_SELECTION'; payload: string }
  | { type: 'REMOVE_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_HOVERED_OBJECT'; payload: string | null }
  | { type: 'ADD_SCENE_OBJECT'; payload: SceneObject }
  | { type: 'REMOVE_SCENE_OBJECT'; payload: string }
  | { type: 'UPDATE_SCENE_OBJECT'; payload: { id: string; properties: any } }
  | { type: 'SHOW_SELECT_MENU'; payload: { x: number; y: number } }
  | { type: 'HIDE_SELECT_MENU' }
  | { type: 'TOGGLE_FUNCTION_PANEL' }
  | { type: 'TOGGLE_RESOURCE_MANAGER' }
  | { type: 'UPDATE_CAMERA'; payload: Partial<EditorCamera> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<EditorSettings> }
  | { type: 'ADD_HISTORY_SNAPSHOT'; payload: Omit<EditorSnapshot, 'id' | 'timestamp'> }
  | { type: 'UNDO' }
  | { type: 'REDO' }; 