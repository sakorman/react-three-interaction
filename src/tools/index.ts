export { BaseTool } from './BaseTool';
export { SelectTool } from './select/SelectTool';
export { DragTool } from './drag/DragTool';
export { TopViewTool } from './top-view';

// 工具工厂函数
import { EditorCore } from '../core/EditorCore';
import { SelectTool } from './select/SelectTool';
import { DragTool } from './drag/DragTool';

export const createSelectTool = (editor: EditorCore) => new SelectTool(editor);
export const createDragTool = (editor: EditorCore) => new DragTool(editor);

// 工具注册表
export const toolRegistry = {
  select: SelectTool,
  drag: DragTool,
};

export type ToolType = keyof typeof toolRegistry; 