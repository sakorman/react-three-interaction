export { BaseTool } from './BaseTool';
export { SelectTool } from './select/SelectTool';

// 工具工厂函数
import { EditorCore } from '../core/EditorCore';
import { SelectTool } from './select/SelectTool';

export const createSelectTool = (editor: EditorCore) => new SelectTool(editor);

// 工具注册表
export const toolRegistry = {
  select: SelectTool,
};

export type ToolType = keyof typeof toolRegistry; 