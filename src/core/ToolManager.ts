import { BaseTool } from '../tools/BaseTool';
import { SelectTool } from '../tools/select/SelectTool';
import { DragTool } from '../tools/drag/DragTool';
import { EventSystem } from './EventSystem';
import { StateManager } from './StateManager';
import { editorStore } from '../stores/EditorStore';

export class ToolManager {
  private tools: Map<string, BaseTool> = new Map();
  private activeTool?: BaseTool;
  private eventSystem: EventSystem;
  private stateManager: StateManager;

  constructor(
    eventSystem: EventSystem,
    stateManager: StateManager,
    editorCore: any // EditorCore 的引用，用于工具初始化
  ) {
    this.eventSystem = eventSystem;
    this.stateManager = stateManager;
    this.initializeTools(editorCore);
  }

  private createEditorAdapter(editorCore: any): any {
    // 创建一个适配器，包含工具所需的所有方法
    return {
      ...editorCore,
      // 确保包含原始 EditorCore 的关键方法
      getState: () => editorCore.getState(),
      dispatch: (action: any) => editorCore.dispatch(action),
      subscribe: (listener: any) => editorCore.subscribe(listener),
      rendererInstance: editorCore.rendererInstance,
      sceneInstance: editorCore.sceneInstance,
      cameraInstance: editorCore.cameraInstance,
      eventSystemInstance: editorCore.eventSystemInstance,
      sceneManagerInstance: editorCore.sceneManagerInstance,
      // 添加其他工具可能需要的方法
    };
  }

  private initializeTools(editorCore: any): void {
    // 创建一个兼容的 EditorCore 适配器
    const editorAdapter = this.createEditorAdapter(editorCore);
    
    // 创建选择工具
    const selectTool = new SelectTool(editorAdapter as any);
    this.tools.set('select', selectTool);
    
    // 创建拖拽工具
    const dragTool = new DragTool(editorAdapter as any);
    this.tools.set('drag', dragTool);
    
    // 可以在这里添加更多工具
    // const moveTool = new MoveTool(editorCore);
    // this.tools.set('move', moveTool);
    
    // 激活默认工具
    this.setActiveTool('select');
    
    // 同步到 MobX Store
    editorStore.setActiveTool('select');
  }

  public setActiveTool(toolName: string): boolean {
    const tool = this.tools.get(toolName);
    if (!tool) {
      console.warn(`工具 '${toolName}' 不存在`);
      return false;
    }

    // 如果已经是当前激活的工具，无需重复激活
    if (this.activeTool === tool) {
      return true;
    }

    // 停用当前工具
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    // 激活新工具
    this.activeTool = tool;
    this.activeTool.activate();

    // 触发工具变更事件
    this.eventSystem.emit('tool:change', { 
      oldTool: this.activeTool?.name || '', 
      newTool: tool.name 
    });

    // 同步到状态管理器
    this.stateManager.dispatch({ 
      type: 'SET_ACTIVE_TOOL', 
      payload: toolName as any 
    });

    return true;
  }

  public getActiveTool(): BaseTool | undefined {
    return this.activeTool;
  }

  public getActiveToolName(): string | undefined {
    return this.activeTool?.name;
  }

  public getTool(toolName: string): BaseTool | undefined {
    return this.tools.get(toolName);
  }

  public getAvailableTools(): string[] {
    return Array.from(this.tools.keys());
  }

  public registerTool(name: string, tool: BaseTool): void {
    if (this.tools.has(name)) {
      console.warn(`工具 '${name}' 已存在，将被覆盖`);
    }
    this.tools.set(name, tool);
  }

  public unregisterTool(name: string): boolean {
    const tool = this.tools.get(name);
    if (!tool) {
      return false;
    }

    // 如果是当前激活的工具，先切换到默认工具
    if (this.activeTool === tool) {
      this.setActiveTool('select');
    }

    // 停用并移除工具
    tool.deactivate();
    tool.dispose();
    this.tools.delete(name);

    return true;
  }

  public enableTool(toolName: string): boolean {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return false;
    }
    
    // 工具通常没有单独的启用状态，这里可以根据需要扩展
    return true;
  }

  public disableTool(toolName: string): boolean {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return false;
    }
    
    // 如果是当前激活的工具，切换到默认工具
    if (this.activeTool === tool) {
      this.setActiveTool('select');
    }
    
    return true;
  }

  public dispose(): void {
    // 停用当前工具
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    // 清理所有工具
    this.tools.forEach(tool => {
      tool.deactivate();
      tool.dispose();
    });
    
    this.tools.clear();
    this.activeTool = undefined;
  }
} 