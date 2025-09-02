import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { EventSystem } from './EventSystem';
import { StateManager } from './StateManager';
import { SceneManager } from './SceneManager';
import { editorStore } from '../stores/EditorStore';

export interface InteractionManagerOptions {
  enableCameraControls?: boolean;
}

export class InteractionManager {
  private canvas: HTMLCanvasElement;
  private camera: THREE.PerspectiveCamera;
  private eventSystem: EventSystem;
  private stateManager: StateManager;
  private sceneManager: SceneManager;
  private options: Required<InteractionManagerOptions>;

  // 鼠标交互
  private mouse = new THREE.Vector2();
  private isDragging = false;
  private dragStartMouse = new THREE.Vector2();

  // 相机控制器管理
  private cameraControls: OrbitControls | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    camera: THREE.PerspectiveCamera,
    eventSystem: EventSystem,
    stateManager: StateManager,
    sceneManager: SceneManager,
    options: InteractionManagerOptions = {}
  ) {
    this.canvas = canvas;
    this.camera = camera;
    this.eventSystem = eventSystem;
    this.stateManager = stateManager;
    this.sceneManager = sceneManager;
    this.options = {
      enableCameraControls: true,
      ...options,
    };

    this.initialize();
  }

  private initialize(): void {
    this.addEventListeners();
  }

  private addEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('click', this.onClick.bind(this));
    this.canvas.addEventListener('contextmenu', this.onContextMenu.bind(this));
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
      this.stateManager.dispatch({
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
    const state = this.stateManager.getState();
    
    if (clickedObject) {
      const isMultiSelect = event.ctrlKey || event.metaKey;
      const isAlreadySelected = state.selectedObjectIds.includes(clickedObject.id);
      
      if (isMultiSelect) {
        // 多选模式：Ctrl/Cmd + 点击
        if (isAlreadySelected) {
          // 如果已选中，则取消选中该对象
          this.stateManager.dispatch({ type: 'REMOVE_SELECTION', payload: clickedObject.id });
          editorStore.deselectModel(clickedObject.id);
        } else {
          // 如果未选中，则添加到选择
          this.stateManager.dispatch({ type: 'ADD_SELECTION', payload: clickedObject.id });
          editorStore.selectModel(clickedObject.id, true);
        }
      } else {
        // 单选模式：普通点击
        if (isAlreadySelected && state.selectedObjectIds.length === 1) {
          // 如果只选中了这一个对象，点击时保持选中状态，不做任何操作
          return;
        } else {
          // 清除之前的选择，只选中当前对象
          this.stateManager.dispatch({ type: 'SELECT_OBJECTS', payload: [clickedObject.id] });
          editorStore.clearSelection();
          editorStore.selectModel(clickedObject.id, false);
        }
      }

      // 显示SelectMenu
      this.showSelectMenuForObject(clickedObject.id);
    } else {
      // 点击空白处清除所有选择
      this.stateManager.dispatch({ type: 'CLEAR_SELECTION' });
      editorStore.clearSelection();
    }
  }

  private onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    // SelectMenu现在通过选中对象自动显示，不需要在右键时触发
  }

  private showSelectMenuForObject(objectId: string): void {
    const screenPosition = this.getObjectScreenPosition(objectId);
    if (screenPosition) {
      // 添加一些偏移，让菜单显示在对象右侧
      this.stateManager.dispatch({
        type: 'SHOW_SELECT_MENU',
        payload: { x: screenPosition.x + 50, y: screenPosition.y },
      });
    }
  }

  private getObjectScreenPosition(objectId: string): { x: number; y: number } | null {
    const sceneObject = this.sceneManager.getObject(objectId);
    if (!sceneObject) return null;

    const object3D = sceneObject.object3D;
    const canvas = this.canvas;
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

  private updateMousePosition(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
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

  public createCameraControls(): OrbitControls {
    const controls = new OrbitControls(this.camera, this.canvas);
    this.setCameraControls(controls);
    return controls;
  }

  public dispose(): void {
    // 移除事件监听器
    this.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.removeEventListener('click', this.onClick.bind(this));
    this.canvas.removeEventListener('contextmenu', this.onContextMenu.bind(this));

    // 清理相机控制器
    if (this.cameraControls) {
      this.cameraControls.dispose();
      this.cameraControls = null;
    }
  }

  // Getters
  public get mousePosition(): THREE.Vector2 {
    return this.mouse.clone();
  }

  public get isDraggingMouse(): boolean {
    return this.isDragging;
  }
} 