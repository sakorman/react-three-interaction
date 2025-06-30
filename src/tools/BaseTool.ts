import { EditorCore } from '../core/EditorCore';

export abstract class BaseTool {
  protected editor: EditorCore;
  protected toolName: string;
  protected isActive = false;

  constructor(editor: EditorCore, toolName: string) {
    this.editor = editor;
    this.toolName = toolName;
  }

  public activate(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    // 注意：不在这里调用dispatch，避免循环调用
    // 状态更新由EditorCore的setActiveTool方法负责
  }

  public deactivate(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
  }

  public get name(): string {
    return this.toolName;
  }

  public get active(): boolean {
    return this.isActive;
  }

  public dispose(): void {
    this.deactivate();
  }
} 