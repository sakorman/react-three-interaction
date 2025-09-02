import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { EditorState, EditorAction, EditorSettings, defaultEditorState } from '../models/EditorState';
import { EventSystem } from './EventSystem';
import { editorStore } from '../stores/EditorStore';

export class StateManager {
  private store: any; // Zustand store - 保持 any 以避免类型复杂性
  private eventSystem: EventSystem;

  constructor(eventSystem: EventSystem) {
    this.eventSystem = eventSystem;
    this.initializeStore();
  }

  private initializeStore() {
    this.store = create<EditorState & { dispatch: (action: EditorAction) => void }>()(
      subscribeWithSelector((set, get) => ({
        ...defaultEditorState,
        dispatch: (action: EditorAction) => {
          this.handleAction(action, set, get);
        },
      }))
    );

    this.setupStateSubscriptions();
  }

  private setupStateSubscriptions(): void {
    // 监听选中对象变化
    this.store.subscribe(
      (state: EditorState) => state.selectedObjectIds,
      (selectedObjectIds: string[], previousSelectedObjectIds: string[]) => {
        this.handleSelectionChange(selectedObjectIds, previousSelectedObjectIds);
      }
    );

    // 监听悬停对象变化
    this.store.subscribe(
      (state: EditorState) => state.hoveredObjectId,
      (hoveredObjectId: string | null, previousHoveredObjectId: string | null) => {
        this.handleHoverChange(hoveredObjectId, previousHoveredObjectId);
      }
    );
  }

  private handleSelectionChange(selectedObjectIds: string[], previousSelectedObjectIds: string[]): void {
    // 找出被取消选中的对象
    const deselected = previousSelectedObjectIds.filter(id => !selectedObjectIds.includes(id));
    
    // 触发取消选中事件
    if (deselected.length > 0) {
      this.eventSystem.emit('object:deselect', { objectIds: deselected });
    }
    
    // 触发选中事件
    if (selectedObjectIds.length > 0) {
      this.eventSystem.emit('object:select', { objectIds: selectedObjectIds });
    }
    
    // 同步到 MobX Store
    editorStore.setSelectedModelIds(selectedObjectIds);
  }

  private handleHoverChange(hoveredObjectId: string | null, previousHoveredObjectId: string | null): void {
    if (previousHoveredObjectId) {
      this.eventSystem.emit('object:unhover', { objectId: previousHoveredObjectId });
    }
    if (hoveredObjectId) {
      this.eventSystem.emit('object:hover', { objectId: hoveredObjectId });
    }
    
    // 同步到 MobX Store
    editorStore.setHoveredModel(hoveredObjectId);
  }

  private handleAction(
    action: EditorAction,
    set: any, // Zustand setter function
    get: () => EditorState & { dispatch: (action: EditorAction) => void }
  ) {
    const state = get();
    
    switch (action.type) {
      case 'SET_ACTIVE_TOOL':
        const oldTool = state.activeTool;
        if (oldTool !== action.payload) {
          set({ activeTool: action.payload });
          this.eventSystem.emit('tool:change', { oldTool, newTool: action.payload });
          editorStore.setActiveTool(action.payload);
        }
        break;

      case 'SET_ENABLED':
        set({ isEnabled: action.payload });
        break;

      case 'SELECT_OBJECTS':
        set({ selectedObjectIds: action.payload });
        break;

      case 'ADD_SELECTION':
        if (!state.selectedObjectIds.includes(action.payload)) {
          set({ selectedObjectIds: [...state.selectedObjectIds, action.payload] });
        }
        break;

      case 'REMOVE_SELECTION':
        set({ 
          selectedObjectIds: state.selectedObjectIds.filter(id => id !== action.payload) 
        });
        break;

      case 'CLEAR_SELECTION':
        set({ selectedObjectIds: [] });
        break;

      case 'SET_HOVERED_OBJECT':
        set({ hoveredObjectId: action.payload });
        break;

      case 'ADD_SCENE_OBJECT':
        state.sceneObjects.set(action.payload.id, action.payload);
        set({ sceneObjects: new Map(state.sceneObjects) });
        break;

      case 'REMOVE_SCENE_OBJECT':
        state.sceneObjects.delete(action.payload);
        set({ 
          sceneObjects: new Map(state.sceneObjects),
          selectedObjectIds: state.selectedObjectIds.filter(id => id !== action.payload)
        });
        break;

      case 'UPDATE_SCENE_OBJECT':
        const existingObject = state.sceneObjects.get(action.payload.id);
        if (existingObject) {
          existingObject.updateProperties(action.payload.properties);
          set({ sceneObjects: new Map(state.sceneObjects) });
        }
        break;

      case 'SHOW_SELECT_MENU':
        set({ 
          showSelectMenu: true,
          selectMenuPosition: action.payload 
        });
        break;

      case 'HIDE_SELECT_MENU':
        set({ 
          showSelectMenu: false,
          selectMenuPosition: null 
        });
        break;

      case 'TOGGLE_FUNCTION_PANEL':
        set({ showFunctionPanel: !state.showFunctionPanel });
        break;

      case 'TOGGLE_RESOURCE_MANAGER':
        set({ showResourceManager: !state.showResourceManager });
        editorStore.toggleResourceManager();
        break;

      case 'UPDATE_CAMERA':
        set({ camera: { ...state.camera, ...action.payload } });
        this.eventSystem.emit('camera:change', action.payload);
        break;

      case 'UPDATE_SETTINGS':
        const newSettings = { ...state.settings, ...action.payload };
        set({ settings: newSettings });
        break;

      case 'ADD_HISTORY_SNAPSHOT':
        const snapshot = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          ...action.payload,
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(snapshot);
        
        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        }
        
        set({ 
          history: newHistory,
          historyIndex: newHistory.length - 1
        });
        break;

      case 'UNDO':
        if (state.historyIndex > 0) {
          set({ historyIndex: state.historyIndex - 1 });
        }
        break;

      case 'REDO':
        if (state.historyIndex < state.history.length - 1) {
          set({ historyIndex: state.historyIndex + 1 });
        }
        break;
    }
  }

  // 公共 API
  public getState(): EditorState {
    return this.store.getState();
  }

  public dispatch(action: EditorAction): void {
    this.store.getState().dispatch(action);
  }

  public subscribe(listener: (state: EditorState) => void): () => void {
    return this.store.subscribe(listener);
  }

  public subscribeToSelection(listener: (selectedIds: string[]) => void): () => void {
    return this.store.subscribe(
      (state: EditorState) => state.selectedObjectIds,
      listener
    );
  }

  public subscribeToHover(listener: (hoveredId: string | null) => void): () => void {
    return this.store.subscribe(
      (state: EditorState) => state.hoveredObjectId,
      listener
    );
  }

  public subscribeToActiveTool(listener: (tool: string) => void): () => void {
    return this.store.subscribe(
      (state: EditorState) => state.activeTool,
      listener
    );
  }

  public subscribeToSettings(listener: (settings: EditorSettings) => void): () => void {
    return this.store.subscribe(
      (state: EditorState) => state.settings,
      listener
    );
  }
} 