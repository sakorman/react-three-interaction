// 核心类
export { EditorCore } from './core/EditorCore';
export { EventSystem } from './core/EventSystem';
export { SceneManager } from './core/SceneManager';

// 数据模型
export { SceneObject } from './models/SceneObject';
export type { 
  SceneObjectProperties, 
  SceneObjectBounds 
} from './models/SceneObject';
export type { 
  EditorState, 
  EditorAction, 
  EditorTool,
  EditorSnapshot,
  EditorSettings,
  EditorCamera 
} from './models/EditorState';

// 工具
export { BaseTool } from './tools/BaseTool';
export { SelectTool } from './tools/select/SelectTool';
export * from './tools';

// React组件
export { EditorProvider, useEditor as useEditorContext } from './views/context/EditorContext';
export { FunctionPanel } from './views/function-panel/FunctionPanel';
export { PropertyEditor } from './views/function-panel/PropertyEditor';
export { MobxPropertyPanel } from './views/function-panel/MobxPropertyPanel';
export { SelectMenu } from './views/select-menu/SelectMenu';
export { ResourceManager } from './views/resource-manager/ResourceManager';
export { MobxResourceManager } from './views/resource-manager';
export { DebugPanel } from './views/debug/DebugPanel';

// MobX Store
export { EditorStore, editorStore } from './stores/EditorStore';
export type { ModelData } from './stores/EditorStore';

// Hooks
export { useEditor } from './hooks/useEditor';
export { useSelection } from './hooks/useSelection';

// 工具函数
export * from './utils/three-utils';

// 主要入口类型
export interface ReactThreeInteractionConfig {
  canvas: HTMLCanvasElement;
  enableControls?: boolean;
  enableStats?: boolean;
  autoResize?: boolean;
}

// 快速初始化函数
import { EditorCore } from './core/EditorCore';

export const createEditor = (config: ReactThreeInteractionConfig) => {
  return new EditorCore(config.canvas, {
    enableControls: config.enableControls,
    enableStats: config.enableStats,
    autoResize: config.autoResize,
  });
}; 