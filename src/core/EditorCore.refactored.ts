import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { EditorState, EditorAction } from '../models/EditorState';
import { SceneObject } from '../models/SceneObject';

// 导入所有管理器
import { EventSystem } from './EventSystem';
import { RenderManager } from './RenderManager';
import { StateManager } from './StateManager';
import { ToolManager } from './ToolManager';
import { InteractionManager } from './InteractionManager';
import { SceneManager } from './SceneManager';
import { LightingManager } from './LightingManager';
import { HistoryManager } from './HistoryManager';

import { editorStore } from '../stores/EditorStore';

export interface EditorCoreOptions {
  canvas?: HTMLCanvasElement;
  enableControls?: boolean;
  enableStats?: boolean;
  autoResize?: boolean;
}

export class EditorCore {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private options: Required<EditorCoreOptions>;
  private isInitialized = false;

  // 管理器组合
  private eventSystem!: EventSystem;
  private renderManager!: RenderManager;
  private stateManager!: StateManager;
  private toolManager!: ToolManager;
  private interactionManager!: InteractionManager;
  private sceneManager!: SceneManager;
  private lightingManager!: LightingManager;
  private historyManager!: HistoryManager;

  constructor(canvas: HTMLCanvasElement, options: EditorCoreOptions = {}) {
    this.canvas = canvas;
    this.options = {
      canvas,
      enableControls: true,
      enableStats: true,
      autoResize: true,
      ...options,
    };

    // 初始化场景
    this.scene = new THREE.Scene();

    // 初始化所有管理器
    this.initializeManagers();

    // 设置MobX Store的编辑器引用
    editorStore.setEditor(this as any);

    this.initialize();
  }

  private initializeManagers(): void {
    // 1. 事件系统（其他管理器都依赖它）
    this.eventSystem = new EventSystem();

    // 2. 渲染管理器（管理渲染器和相机）
    this.renderManager = new RenderManager(
      this.canvas,
      this.scene,
      this.eventSystem,
      {
        antialias: true,
        alpha: true,
        autoResize: this.options.autoResize,
      }
    );

    // 3. 状态管理器（管理 Zustand 状态）
    this.stateManager = new StateManager(this.eventSystem);

    // 4. 场景管理器（管理 3D 对象）
    this.sceneManager = new SceneManager(this.scene, this.eventSystem);

    // 5. 工具管理器（管理编辑工具）
    this.toolManager = new ToolManager(
      this.eventSystem,
      this.stateManager,
      this as any // 传递 EditorCore 引用给工具，使用 any 避免类型冲突
    );

    // 6. 交互管理器（管理鼠标和相机控制）
    this.interactionManager = new InteractionManager(
      this.canvas,
      this.renderManager.cameraInstance,
      this.eventSystem,
      this.stateManager,
      this.sceneManager,
      {
        enableCameraControls: this.options.enableControls,
      }
    );

    // 7. 光照管理器（管理光源和阴影）
    this.lightingManager = new LightingManager(
      this.scene,
      this.renderManager.rendererInstance,
      this.eventSystem
    );

    // 8. 历史记录管理器（管理撤销/重做）
    this.historyManager = new HistoryManager(
      this.stateManager,
      this.eventSystem,
      { maxHistorySize: 50 }
    );
  }

  private initialize(): void {
    // 应用默认设置
    const defaultSettings = this.stateManager.getState().settings;
    this.lightingManager.applyShadowSettings(defaultSettings);
    this.lightingManager.applyLightingSettings(defaultSettings);

    // 创建相机控制器（如果启用）
    if (this.options.enableControls) {
      this.interactionManager.createCameraControls();
    }

    // 监听设置变化
    this.stateManager.subscribeToSettings((settings) => {
      this.lightingManager.applyShadowSettings(settings);
      this.lightingManager.applyLightingSettings(settings);
    });

    this.isInitialized = true;
  }

  // === 对象管理 API ===
  public addObject(object3D: THREE.Object3D, parentId?: string): SceneObject {
    const sceneObject = this.sceneManager.addObject(object3D, parentId);
    this.stateManager.dispatch({ type: 'ADD_SCENE_OBJECT', payload: sceneObject });
    
    // 同步到MobX Store
    editorStore.addModelFromSceneObject(sceneObject);
    
    return sceneObject;
  }

  public removeObject(objectId: string): boolean {
    const success = this.sceneManager.removeObject(objectId);
    if (success) {
      this.stateManager.dispatch({ type: 'REMOVE_SCENE_OBJECT', payload: objectId });
      
      // 同步到MobX Store
      editorStore.removeModel(objectId);
    }
    return success;
  }

  public getObject(objectId: string): SceneObject | undefined {
    return this.sceneManager.getObject(objectId);
  }

  public getAllObjects(): SceneObject[] {
    return this.sceneManager.getAllObjects();
  }

  // === 工具管理 API ===
  public getActiveTool(): any {
    return this.toolManager.getActiveTool();
  }

  public getActiveToolName(): string | undefined {
    return this.toolManager.getActiveToolName();
  }

  public switchTool(toolName: string): boolean {
    return this.toolManager.setActiveTool(toolName);
  }

  public getTool(toolName: string): any {
    return this.toolManager.getTool(toolName);
  }

  public getAvailableTools(): string[] {
    return this.toolManager.getAvailableTools();
  }

  // === 相机控制器管理 API ===
  public setCameraControls(controls: OrbitControls): void {
    this.interactionManager.setCameraControls(controls);
  }

  public getCameraControls(): OrbitControls | null {
    return this.interactionManager.getCameraControls();
  }

  public enableCameraControls(): void {
    this.interactionManager.enableCameraControls();
  }

  public disableCameraControls(): void {
    this.interactionManager.disableCameraControls();
  }

  // === 光照管理 API ===
  public setAmbientLight(intensity: number, color: string): void {
    this.lightingManager.setAmbientLight(intensity, color);
  }

  public setDirectionalLight(
    enabled: boolean,
    intensity?: number,
    color?: string,
    position?: { x: number; y: number; z: number }
  ): void {
    this.lightingManager.setDirectionalLight(enabled, intensity, color, position);
  }

  public setPointLight(
    enabled: boolean,
    intensity?: number,
    color?: string,
    position?: { x: number; y: number; z: number }
  ): void {
    this.lightingManager.setPointLight(enabled, intensity, color, position);
  }

  public enableShadows(enabled: boolean): void {
    this.lightingManager.enableShadows(enabled);
  }

  // === 历史记录 API ===
  public undo(): boolean {
    return this.historyManager.undo();
  }

  public redo(): boolean {
    return this.historyManager.redo();
  }

  public canUndo(): boolean {
    return this.historyManager.canUndo();
  }

  public canRedo(): boolean {
    return this.historyManager.canRedo();
  }

  public addHistorySnapshot(description: string): void {
    this.historyManager.addSnapshot(description);
  }

  // === 状态管理 API ===
  public getState(): EditorState {
    return this.stateManager.getState();
  }

  public dispatch(action: EditorAction): void {
    this.stateManager.dispatch(action);
  }

  public subscribe(listener: (state: EditorState) => void): () => void {
    return this.stateManager.subscribe(listener);
  }

  // === 渲染管理 API ===
  public setRenderSize(width: number, height: number): void {
    this.renderManager.setSize(width, height);
  }

  public setCameraPosition(x: number, y: number, z: number): void {
    this.renderManager.setCameraPosition(x, y, z);
  }

  public setCameraLookAt(x: number, y: number, z: number): void {
    this.renderManager.setCameraLookAt(x, y, z);
  }

  // === 扩展性 API ===
  public registerTool(name: string, tool: any): void {
    this.toolManager.registerTool(name, tool);
  }

  public unregisterTool(name: string): boolean {
    return this.toolManager.unregisterTool(name);
  }

  // === 清理 ===
  public dispose(): void {
    // 按相反顺序清理管理器
    this.historyManager?.dispose();
    this.lightingManager?.dispose();
    this.interactionManager?.dispose();
    this.toolManager?.dispose();
    this.sceneManager?.dispose();
    this.stateManager && this.stateManager.getState(); // StateManager 没有 dispose 方法
    this.renderManager?.dispose();
    this.eventSystem?.dispose();

    this.isInitialized = false;
  }

  // === Getters ===
  public get rendererInstance(): THREE.WebGLRenderer { 
    return this.renderManager.rendererInstance; 
  }
  
  public get sceneInstance(): THREE.Scene { 
    return this.scene; 
  }
  
  public get cameraInstance(): THREE.PerspectiveCamera { 
    return this.renderManager.cameraInstance; 
  }
  
  public get eventSystemInstance(): EventSystem { 
    return this.eventSystem; 
  }
  
  public get sceneManagerInstance(): SceneManager { 
    return this.sceneManager; 
  }
  
  public get isReady(): boolean { 
    return this.isInitialized; 
  }

  // === 管理器访问器（用于高级使用） ===
  public getRenderManager(): RenderManager {
    return this.renderManager;
  }

  public getStateManager(): StateManager {
    return this.stateManager;
  }

  public getToolManager(): ToolManager {
    return this.toolManager;
  }

  public getInteractionManager(): InteractionManager {
    return this.interactionManager;
  }

  public getLightingManager(): LightingManager {
    return this.lightingManager;
  }

  public getHistoryManager(): HistoryManager {
    return this.historyManager;
  }
} 