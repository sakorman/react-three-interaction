import { EventSystem } from './EventSystem';
import { StateManager } from './StateManager';
import { EditorSnapshot } from '../models/EditorState';

export interface HistoryManagerOptions {
  maxHistorySize?: number;
}

export class HistoryManager {
  private stateManager: StateManager;
  private eventSystem: EventSystem;
  private options: Required<HistoryManagerOptions>;

  constructor(
    stateManager: StateManager,
    eventSystem: EventSystem,
    options: HistoryManagerOptions = {}
  ) {
    this.stateManager = stateManager;
    this.eventSystem = eventSystem;
    this.options = {
      maxHistorySize: 50,
      ...options,
    };

    this.initialize();
  }

  private initialize(): void {
    // 监听状态变化以自动创建快照
    // this.setupAutoSnapshot();
  }

  public addSnapshot(
    description: string,
    sceneObjectData?: any,
    cameraData?: any,
    settingsData?: any
  ): void {
    this.stateManager.dispatch({
      type: 'ADD_HISTORY_SNAPSHOT',
      payload: {
        description,
        sceneObjectData,
        cameraData,
        settingsData,
        selectedObjectIds: this.stateManager.getState().selectedObjectIds.slice(),
      },
    });
  }

  public undo(): boolean {
    const state = this.stateManager.getState();
    if (state.historyIndex > 0) {
      const previousSnapshot = state.history[state.historyIndex - 1];
      this.restoreSnapshot(previousSnapshot);
      this.stateManager.dispatch({ type: 'UNDO' });
      return true;
    }
    return false;
  }

  public redo(): boolean {
    const state = this.stateManager.getState();
    if (state.historyIndex < state.history.length - 1) {
      const nextSnapshot = state.history[state.historyIndex + 1];
      this.restoreSnapshot(nextSnapshot);
      this.stateManager.dispatch({ type: 'REDO' });
      return true;
    }
    return false;
  }

  private restoreSnapshot(snapshot: EditorSnapshot): void {
    // 恢复选中对象
    if (snapshot.selectedObjectIds) {
      this.stateManager.dispatch({
        type: 'SELECT_OBJECTS',
        payload: snapshot.selectedObjectIds,
      });
    }

    // 恢复相机状态
    if (snapshot.cameraData) {
      this.stateManager.dispatch({
        type: 'UPDATE_CAMERA',
        payload: snapshot.cameraData,
      });
    }

    // 恢复设置
    if (snapshot.settingsData) {
      this.stateManager.dispatch({
        type: 'UPDATE_SETTINGS',
        payload: snapshot.settingsData,
      });
    }

    // 这里可以添加恢复场景对象数据的逻辑
    // 需要与 SceneManager 配合
    if (snapshot.sceneObjectData) {
      // TODO: 实现场景对象数据的恢复
      console.log('恢复场景对象数据:', snapshot.sceneObjectData);
    }
  }

  public canUndo(): boolean {
    const state = this.stateManager.getState();
    return state.historyIndex > 0;
  }

  public canRedo(): boolean {
    const state = this.stateManager.getState();
    return state.historyIndex < state.history.length - 1;
  }

  public getHistoryLength(): number {
    const state = this.stateManager.getState();
    return state.history.length;
  }

  public getCurrentHistoryIndex(): number {
    const state = this.stateManager.getState();
    return state.historyIndex;
  }

  public getHistorySnapshot(index: number): EditorSnapshot | undefined {
    const state = this.stateManager.getState();
    return state.history[index];
  }

  public clearHistory(): void {
    // 重置历史记录
    this.stateManager.getState().history.length = 0;
    this.stateManager.dispatch({
      type: 'ADD_HISTORY_SNAPSHOT',
      payload: {
        description: '初始状态',
        selectedObjectIds: [],
      },
    });
  }

  public getHistoryList(): { index: number; snapshot: EditorSnapshot }[] {
    const state = this.stateManager.getState();
    return state.history.map((snapshot, index) => ({ index, snapshot }));
  }

  // 自动快照功能（可选）
  private setupAutoSnapshot(): void {
    // 监听重要的状态变化，自动创建快照
    this.stateManager.subscribeToSelection((selectedIds) => {
      if (selectedIds.length > 0) {
        this.addSnapshot(`选中 ${selectedIds.length} 个对象`);
      }
    });

    // 可以添加更多自动快照的触发条件
  }

  // 批量操作支持
  public startBatch(description: string): void {
    // 开始批量操作，暂停自动快照
    this.addSnapshot(`开始: ${description}`);
  }

  public endBatch(description: string): void {
    // 结束批量操作，创建最终快照
    this.addSnapshot(`完成: ${description}`);
  }

  public dispose(): void {
    // 清理资源
  }
} 