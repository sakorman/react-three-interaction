import * as THREE from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { EditorState, EditorAction, EditorTool, EditorSnapshot, EditorSettings, defaultEditorState } from '../models/EditorState';
import { SceneObject } from '../models/SceneObject';
import { EventSystem } from './EventSystem';
import { SceneManager } from './SceneManager';
import { SelectTool } from '../tools/select/SelectTool';
import { DragTool } from '../tools/drag/DragTool';
import { BaseTool } from '../tools/BaseTool';
import { editorStore } from '../stores/EditorStore';

export interface EditorCoreOptions {
  canvas?: HTMLCanvasElement;
  enableControls?: boolean;
  enableStats?: boolean;
  autoResize?: boolean;
}

export class EditorCore {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private eventSystem: EventSystem;
  private sceneManager: SceneManager;
  private options: Required<EditorCoreOptions>;
  
  // 工具管理
  private tools: Map<string, BaseTool> = new Map();
  private activeTool?: BaseTool;
  
  // 状态管理
  private store: any; // Zustand store - 复杂的泛型类型，保持 any 以避免类型复杂性
  private isInitialized = false;
  private animationFrameId?: number;

  // 鼠标交互
  private mouse = new THREE.Vector2();
  private isDragging = false;
  private dragStartMouse = new THREE.Vector2();

  // 相机控制器管理
  private cameraControls: OrbitControls | null = null; // 用于存储 OrbitControls 或其他控制器

  // 光照管理
  private ambientLight?: THREE.AmbientLight;
  private directionalLight?: THREE.DirectionalLight;
  private pointLight?: THREE.PointLight;
  private spotLight?: THREE.SpotLight;

  constructor(canvas: HTMLCanvasElement, options: EditorCoreOptions = {}) {
    this.canvas = canvas;
    this.options = {
      canvas,
      enableControls: true,
      enableStats: true,
      autoResize: true,
      ...options,
    };

    // 初始化Three.js组件
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      1000
    );

    // 初始化系统
    this.eventSystem = new EventSystem();
    this.sceneManager = new SceneManager(this.scene, this.eventSystem);

    // 初始化状态管理
    this.initializeStore();

    // 初始化工具
    this.initializeTools();

    // 设置MobX Store的编辑器引用
    editorStore.setEditor(this);

    this.initialize();
  }

  // 计算3D对象在屏幕上的位置
  private getObjectScreenPosition(objectId: string): { x: number; y: number } | null {
    const sceneObject = this.sceneManager.getObject(objectId);
    if (!sceneObject) return null;

    const object3D = sceneObject.object3D;
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();

    // 获取对象的世界位置
    const worldPosition = new THREE.Vector3();
    object3D.getWorldPosition(worldPosition);

    // 将世界坐标转换为屏幕坐标
    const screenPosition = worldPosition.clone().project(this.camera);
    
    // 转换为像素坐标
    const x = (screenPosition.x * 0.5 + 0.5) * rect.width + rect.left;
    const y = (screenPosition.y * -0.5 + 0.5) * rect.height + rect.top;

    return { x, y };
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

    // 监听状态变化
    this.store.subscribe(
      (state: EditorState) => state.selectedObjectIds,
      (selectedObjectIds: string[], previousSelectedObjectIds: string[]) => {
        // 找出被取消选中的对象
        const deselected = previousSelectedObjectIds.filter(id => !selectedObjectIds.includes(id));
        
        // 触发取消选中事件
        if (deselected.length > 0) {
          this.eventSystem.emit('object:deselect', { objectIds: deselected });
        }
        
        // 触发选中事件
        if (selectedObjectIds.length > 0) {
          this.eventSystem.emit('object:select', { objectIds: selectedObjectIds });
          
          // 自动显示SelectMenu在第一个选中对象附近
          const firstSelectedId = selectedObjectIds[0];
          const screenPosition = this.getObjectScreenPosition(firstSelectedId);
          if (screenPosition) {
            // 添加一些偏移，让菜单显示在对象右侧
            this.store.getState().dispatch({
              type: 'SHOW_SELECT_MENU',
              payload: { x: screenPosition.x + 50, y: screenPosition.y },
            });
          }
        } else {
          // 没有选中对象时隐藏菜单
          this.store.getState().dispatch({ type: 'HIDE_SELECT_MENU' });
        }
        
        // 同步到 MobX Store
        editorStore.setSelectedModelIds(selectedObjectIds);
      }
    );

    this.store.subscribe(
      (state: EditorState) => state.hoveredObjectId,
      (hoveredObjectId: string | null, previousHoveredObjectId: string | null) => {
        if (previousHoveredObjectId) {
          this.eventSystem.emit('object:unhover', { objectId: previousHoveredObjectId });
        }
        if (hoveredObjectId) {
          this.eventSystem.emit('object:hover', { objectId: hoveredObjectId });
        }
        
        // 同步到 MobX Store
        editorStore.setHoveredModel(hoveredObjectId);
      }
    );
  }

  private initializeTools(): void {
    // 创建选择工具
    const selectTool = new SelectTool(this);
    this.tools.set('select', selectTool);
    
    // 创建拖拽工具
    const dragTool = new DragTool(this);
    this.tools.set('drag', dragTool);
    
    // 激活默认工具
    this.setActiveTool('select');
    
    // 同步到 MobX Store
    editorStore.setActiveTool('select');
  }

  private setActiveTool(toolName: string): void {
    const tool = this.tools.get(toolName);
    if (!tool) {
      console.warn(`Tool '${toolName}' not found`);
      return;
    }

    // 如果已经是当前激活的工具，无需重复激活
    if (this.activeTool === tool) {
      return;
    }

    // 停用当前工具
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    // 激活新工具
    this.activeTool = tool;
    this.activeTool.activate();
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
        // 避免重复设置同一个工具
        if (oldTool !== action.payload) {
          set({ activeTool: action.payload });
          this.setActiveTool(action.payload);
          this.eventSystem.emit('tool:change', { oldTool, newTool: action.payload });
          
          // 同步到 MobX Store
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
        
        // 同步到 MobX Store
        editorStore.toggleResourceManager();
        break;

      case 'UPDATE_CAMERA':
        set({ camera: { ...state.camera, ...action.payload } });
        this.eventSystem.emit('camera:change', action.payload);
        break;

      case 'UPDATE_SETTINGS':
        const newSettings = { ...state.settings, ...action.payload };
        set({ settings: newSettings });
        // 应用阴影设置更新
        this.applyShadowSettings(newSettings);
        // 应用光照设置更新
        this.applyLightingSettings(newSettings);
        break;

      case 'ADD_HISTORY_SNAPSHOT':
        const snapshot = {
          id: THREE.MathUtils.generateUUID(),
          timestamp: Date.now(),
          ...action.payload,
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(snapshot);
        
        // 限制历史记录数量
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
          const previousSnapshot = state.history[state.historyIndex - 1];
          this.restoreSnapshot(previousSnapshot);
          set({ historyIndex: state.historyIndex - 1 });
        }
        break;

      case 'REDO':
        if (state.historyIndex < state.history.length - 1) {
          const nextSnapshot = state.history[state.historyIndex + 1];
          this.restoreSnapshot(nextSnapshot);
          set({ historyIndex: state.historyIndex + 1 });
        }
        break;
    }
  }

  private restoreSnapshot(_snapshot: EditorSnapshot) {
    // 这里实现历史记录恢复逻辑
  }

  private initialize(): void {
    // 设置渲染器
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // 应用默认阴影设置
    this.applyShadowSettings(this.store.getState().settings);

    // 设置相机
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    // 初始化光照系统
    this.initializeLights();
    
    // 应用默认光照设置
    this.applyLightingSettings(this.store.getState().settings);

    // 添加事件监听器
    this.addEventListeners();

    // 开始渲染循环
    this.startRenderLoop();

    this.isInitialized = true;
  }

  private addEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('click', this.onClick.bind(this));
    this.canvas.addEventListener('contextmenu', this.onContextMenu.bind(this));

    if (this.options.autoResize) {
      window.addEventListener('resize', this.onWindowResize.bind(this));
    }
  }

  private onMouseDown(event: MouseEvent): void {
    this.updateMousePosition(event);
    this.isDragging = true;
    this.dragStartMouse.copy(this.mouse);
  }

  private onMouseMove(event: MouseEvent): void {
    this.updateMousePosition(event);
    
    if (!this.isDragging) {
      // 处理悬停
      const hoveredObject = this.sceneManager.getObjectAtMouse(this.mouse, this.camera);
      this.store.getState().dispatch({
        type: 'SET_HOVERED_OBJECT',
        payload: hoveredObject?.id || null,
      });
    }
  }

  private onMouseUp(_event: MouseEvent): void {
    this.isDragging = false;
  }

  private onClick(event: MouseEvent): void {
    this.updateMousePosition(event);
    
    const clickedObject = this.sceneManager.getObjectAtMouse(this.mouse, this.camera);
    const state = this.store.getState();
    
    if (clickedObject) {
      const isMultiSelect = event.ctrlKey || event.metaKey;
      const isAlreadySelected = state.selectedObjectIds.includes(clickedObject.id);
      
      if (isMultiSelect) {
        // 多选模式：Ctrl/Cmd + 点击
        if (isAlreadySelected) {
          // 如果已选中，则取消选中该对象
          state.dispatch({ type: 'REMOVE_SELECTION', payload: clickedObject.id });
          editorStore.deselectModel(clickedObject.id);
        } else {
          // 如果未选中，则添加到选择
          state.dispatch({ type: 'ADD_SELECTION', payload: clickedObject.id });
          editorStore.selectModel(clickedObject.id, true);
        }
      } else {
        // 单选模式：普通点击
        if (isAlreadySelected && state.selectedObjectIds.length === 1) {
          // 如果只选中了这一个对象，点击时保持选中状态，不做任何操作
          return;
        } else {
          // 清除之前的选择，只选中当前对象
          state.dispatch({ type: 'SELECT_OBJECTS', payload: [clickedObject.id] });
          editorStore.clearSelection();
          editorStore.selectModel(clickedObject.id, false);
        }
      }
    } else {
      // 点击空白处清除所有选择
      state.dispatch({ type: 'CLEAR_SELECTION' });
      editorStore.clearSelection();
    }
  }

  private onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    // SelectMenu现在通过选中对象自动显示，不需要在右键时触发
  }

  private onWindowResize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private updateMousePosition(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private startRenderLoop(): void {
    const render = () => {
      this.animationFrameId = requestAnimationFrame(render);
      this.renderer.render(this.scene, this.camera);
    };
    render();
  }

  // 公共API
  public getState() {
    return this.store.getState();
  }

  public dispatch(action: EditorAction) {
    this.store.getState().dispatch(action);
  }

  public subscribe(listener: (state: EditorState) => void) {
    return this.store.subscribe(listener);
  }

  public addObject(object3D: THREE.Object3D, parentId?: string): SceneObject {
    const sceneObject = this.sceneManager.addObject(object3D, parentId);
    this.dispatch({ type: 'ADD_SCENE_OBJECT', payload: sceneObject });
    
    // 同步到MobX Store
    editorStore.addModelFromSceneObject(sceneObject);
    
    return sceneObject;
  }

  public removeObject(objectId: string): boolean {
    const success = this.sceneManager.removeObject(objectId);
    if (success) {
      this.dispatch({ type: 'REMOVE_SCENE_OBJECT', payload: objectId });
      
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

  // 工具管理API
  public getActiveTool(): BaseTool | undefined {
    return this.activeTool;
  }

  public getActiveToolName(): string | undefined {
    return this.activeTool?.name;
  }

  public switchTool(toolName: string): boolean {
    const tool = this.tools.get(toolName);
    if (!tool) {
      console.warn(`工具 '${toolName}' 不存在`);
      return false;
    }
    
    this.dispatch({ type: 'SET_ACTIVE_TOOL', payload: toolName as EditorTool });
    return true;
  }

  public getTool(toolName: string): BaseTool | undefined {
    return this.tools.get(toolName);
  }

  public getAvailableTools(): string[] {
    return Array.from(this.tools.keys());
  }

  // 相机控制器管理API
  public setCameraControls(controls: OrbitControls): void {
    this.cameraControls = controls;
  }

  public getCameraControls(): OrbitControls | null {
    return this.cameraControls;
  }

  public enableCameraControls(): void {
    if (this.cameraControls && this.cameraControls.enabled !== undefined) {
      this.cameraControls.enabled = true;
    }
  }

  public disableCameraControls(): void {
    if (this.cameraControls && this.cameraControls.enabled !== undefined) {
      this.cameraControls.enabled = false;
    }
  }

  // 应用阴影设置
  private applyShadowSettings(settings: EditorSettings): void {
    // 配置渲染器阴影设置
    this.renderer.shadowMap.enabled = settings.enableShadows;
    
    if (settings.enableShadows) {
      // 设置阴影贴图类型
      switch (settings.shadowMapType) {
        case 'Basic':
          this.renderer.shadowMap.type = THREE.BasicShadowMap;
          break;
        case 'PCF':
          this.renderer.shadowMap.type = THREE.PCFShadowMap;
          break;
        case 'PCFSoft':
          this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          break;
        case 'VSM':
          this.renderer.shadowMap.type = THREE.VSMShadowMap;
          break;
        default:
          this.renderer.shadowMap.type = THREE.PCFShadowMap;
      }

      // 更新场景中所有的方向光阴影设置
      this.scene.traverse((object) => {
        if (object instanceof THREE.DirectionalLight && object.castShadow) {
          object.shadow.mapSize.width = settings.shadowMapSize;
          object.shadow.mapSize.height = settings.shadowMapSize;
          object.shadow.camera.near = settings.shadowCameraNear;
          object.shadow.camera.far = settings.shadowCameraFar;
          object.shadow.radius = settings.shadowRadius;
          object.shadow.bias = settings.shadowBias;
          object.shadow.camera.updateProjectionMatrix();
        }
      });

      // 确保场景中的对象启用阴影投射和接收
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });
    }
  }

  // 初始化光照系统
  private initializeLights(): void {
    // 创建环境光
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    // 创建平行光
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.directionalLight.position.set(5, 5, 5);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.camera.near = 0.1;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.radius = 1;
    this.directionalLight.shadow.bias = -0.0001;
    this.scene.add(this.directionalLight);

    // 创建点光源（默认不启用）
    this.pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
    this.pointLight.position.set(0, 5, 0);
    this.pointLight.visible = false;
    this.scene.add(this.pointLight);

    // 创建聚光灯（默认不启用）
    this.spotLight = new THREE.SpotLight(0xffffff, 1.0, 100, Math.PI / 4, 0.1);
    this.spotLight.position.set(0, 10, 0);
    this.spotLight.target.position.set(0, 0, 0);
    this.spotLight.visible = false;
    this.scene.add(this.spotLight);
    this.scene.add(this.spotLight.target);
  }

  // 应用光照设置
  private applyLightingSettings(settings: EditorSettings): void {
    if (!this.ambientLight || !this.directionalLight || !this.pointLight || !this.spotLight) {
      return;
    }

    // 更新环境光
    this.ambientLight.intensity = settings.ambientLightIntensity;
    this.ambientLight.color.setHex(parseInt(settings.ambientLightColor.replace('#', ''), 16));

    // 更新平行光
    this.directionalLight.visible = settings.enableDirectionalLight;
    if (settings.enableDirectionalLight) {
      this.directionalLight.intensity = settings.directionalLightIntensity;
      this.directionalLight.color.setHex(parseInt(settings.directionalLightColor.replace('#', ''), 16));
      this.directionalLight.position.set(
        settings.directionalLightPosition.x,
        settings.directionalLightPosition.y,
        settings.directionalLightPosition.z
      );
    }

    // 更新点光源
    this.pointLight.visible = settings.enablePointLight;
    if (settings.enablePointLight) {
      this.pointLight.intensity = settings.pointLightIntensity;
      this.pointLight.color.setHex(parseInt(settings.pointLightColor.replace('#', ''), 16));
      this.pointLight.position.set(
        settings.pointLightPosition.x,
        settings.pointLightPosition.y,
        settings.pointLightPosition.z
      );
    }

    // 更新聚光灯
    this.spotLight.visible = settings.enableSpotLight;
    if (settings.enableSpotLight) {
      this.spotLight.intensity = settings.spotLightIntensity;
      this.spotLight.color.setHex(parseInt(settings.spotLightColor.replace('#', ''), 16));
      this.spotLight.position.set(
        settings.spotLightPosition.x,
        settings.spotLightPosition.y,
        settings.spotLightPosition.z
      );
      this.spotLight.target.position.set(
        settings.spotLightTarget.x,
        settings.spotLightTarget.y,
        settings.spotLightTarget.z
      );
      this.spotLight.angle = settings.spotLightAngle;
      this.spotLight.penumbra = settings.spotLightPenumbra;
    }
  }

  public dispose(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // 清理工具
    this.tools.forEach(tool => tool.dispose());
    this.tools.clear();
    this.activeTool = undefined;

    this.sceneManager.dispose();
    this.eventSystem.dispose();
    this.renderer.dispose();

    // 移除事件监听器
    this.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.removeEventListener('click', this.onClick.bind(this));
    this.canvas.removeEventListener('contextmenu', this.onContextMenu.bind(this));

    if (this.options.autoResize) {
      window.removeEventListener('resize', this.onWindowResize.bind(this));
    }

    this.isInitialized = false;
  }

  // Getters
  public get rendererInstance() { return this.renderer; }
  public get sceneInstance() { return this.scene; }
  public get cameraInstance() { return this.camera; }
  public get eventSystemInstance() { return this.eventSystem; }
  public get sceneManagerInstance() { return this.sceneManager; }
  public get isReady() { return this.isInitialized; }
} 