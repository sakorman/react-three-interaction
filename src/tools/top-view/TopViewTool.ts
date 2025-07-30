import * as THREE from 'three';
import { BaseTool } from '../BaseTool';
import { EditorCore } from '../../core/EditorCore';
import { editorStore } from '../../stores/EditorStore';

export interface TopViewToolOptions {
  enableDrag?: boolean;
  enableZoom?: boolean;
  enableSelect?: boolean;
  zoomSpeed?: number;
  minZoom?: number;
  maxZoom?: number;
}

export class TopViewTool extends BaseTool {
  private options: Required<TopViewToolOptions>;
  private camera: THREE.OrthographicCamera;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  
  // 交互状态
  private isDragging = false;
  private isViewDragging = false; // 拖拽视图
  private dragTargetId: string | null = null;
  private lastMousePosition = new THREE.Vector2();
  private currentMousePosition = new THREE.Vector2();
  private dragStartPosition = new THREE.Vector3();
  private dragOffset = new THREE.Vector3();
  
  // Three.js 工具
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private dragPlane = new THREE.Plane();
  private intersectionPoint = new THREE.Vector3();
  
  // 视图缩放
  private zoomLevel = 1;

  constructor(
    editor: EditorCore,
    camera: THREE.OrthographicCamera,
    canvas: HTMLCanvasElement,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    options: TopViewToolOptions = {}
  ) {
    super(editor, 'topview');
    
    this.camera = camera;
    this.canvas = canvas;
    this.renderer = renderer;
    this.scene = scene;
    
    this.options = {
      enableDrag: true,
      enableZoom: true,
      enableSelect: true,
      zoomSpeed: 0.1,
      minZoom: 0.1,
      maxZoom: 5,
      ...options,
    };

    this.initialize();
  }

  private initialize(): void {
    // 设置拖拽平面（对于俯视图，平面在XZ平面上）
    this.dragPlane.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0), // Y轴向上的法向量
      new THREE.Vector3(0, 0, 0)  // 原点
    );
  }

  public activate(): void {
    super.activate();
    this.addEventListeners();
  }

  public deactivate(): void {
    super.deactivate();
    this.removeEventListeners();
  }

  private addEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('wheel', this.onWheel);
    this.canvas.addEventListener('contextmenu', this.onContextMenu);
  }

  private removeEventListeners(): void {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
  }

  private onMouseDown = (event: MouseEvent): void => {
    if (!this.isActive) return;

    this.updateMousePosition(event);
    this.lastMousePosition.copy(this.currentMousePosition);

    if (event.button === 0) { // 左键
      if (this.options.enableSelect || this.options.enableDrag) {
        const intersectedObjectId = this.getIntersectedObject();
        
        if (intersectedObjectId && this.options.enableDrag) {
          // 开始拖拽对象
          this.startObjectDrag(intersectedObjectId);
        } else if (this.options.enableSelect) {
          // 选择或取消选择
          if (intersectedObjectId) {
            this.selectObject(intersectedObjectId, event.ctrlKey || event.metaKey);
          } else {
            // 点击空白处，清除选择
            editorStore.clearSelection();
          }
        }
      }
    } else if (event.button === 2) { // 右键
      // 开始拖拽视图
      this.startViewDrag();
    }
  };

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.isActive) return;

    this.updateMousePosition(event);

    if (this.isDragging && this.dragTargetId) {
      // 拖拽对象
      this.updateObjectDrag();
    } else if (this.isViewDragging) {
      // 拖拽视图
      this.updateViewDrag();
    }
  };

  private onMouseUp = (_event: MouseEvent): void => {
    if (!this.isActive) return;

    if (this.isDragging && this.dragTargetId) {
      this.endObjectDrag();
    } else if (this.isViewDragging) {
      this.endViewDrag();
    }
  };

  private onWheel = (event: WheelEvent): void => {
    if (!this.isActive || !this.options.enableZoom) return;

    event.preventDefault();
    
    const zoomDelta = event.deltaY > 0 ? 1 + this.options.zoomSpeed : 1 - this.options.zoomSpeed;
    this.zoomLevel = THREE.MathUtils.clamp(
      this.zoomLevel * zoomDelta,
      this.options.minZoom,
      this.options.maxZoom
    );

    this.updateCameraZoom();
    
    // 触发缩放级别变化回调
    if (this.onZoomChange) {
      this.onZoomChange(this.zoomLevel);
    }
  };

  private onContextMenu = (event: MouseEvent): void => {
    event.preventDefault(); // 禁用右键菜单
  };

  private updateMousePosition(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.currentMousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.currentMousePosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.mouse.copy(this.currentMousePosition);
  }

  private getIntersectedObject(): string | null {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    const objects: THREE.Object3D[] = [];
    this.scene.traverse((child) => {
      if (child.userData.id && child.userData.selectable !== false) {
        objects.push(child);
      }
    });

    const intersects = this.raycaster.intersectObjects(objects, true);
    
    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      // 向上查找直到找到有ID的对象
      let current = intersected;
      while (current && !current.userData.id) {
        current = current.parent!;
      }
      return current?.userData.id || null;
    }
    
    return null;
  }

  private selectObject(objectId: string, addToSelection: boolean): void {
    if (addToSelection) {
      if (editorStore.selectedModelIds.includes(objectId)) {
        editorStore.deselectModel(objectId);
      } else {
        editorStore.selectModel(objectId, true);
      }
    } else {
      editorStore.clearSelection();
      editorStore.selectModel(objectId, false);
    }

    // 同步到编辑器状态
    const selectedIds = editorStore.selectedModelIds;
    this.editor.dispatch({ type: 'SELECT_OBJECTS', payload: selectedIds });
  }

  private startObjectDrag(objectId: string): void {
    const sceneObject = this.editor.getObject(objectId);
    if (!sceneObject) return;

    this.isDragging = true;
    this.dragTargetId = objectId;
    this.dragStartPosition.copy(sceneObject.object3D.position);

    // 计算鼠标在拖拽平面上的交点
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersectionPoint = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.dragPlane, intersectionPoint);

    // 计算偏移量
    this.dragOffset.copy(sceneObject.object3D.position).sub(intersectionPoint);

    // 选中被拖拽的对象
    this.selectObject(objectId, false);

    // 触发拖拽开始事件
    this.editor.eventSystemInstance.emit('object:drag:start', {
      objectId,
      startPosition: this.dragStartPosition.clone()
    });
  }

  private updateObjectDrag(): void {
    if (!this.isDragging || !this.dragTargetId) return;

    const sceneObject = this.editor.getObject(this.dragTargetId);
    if (!sceneObject) return;

    // 计算鼠标在拖拽平面上的交点
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersected = this.raycaster.ray.intersectPlane(this.dragPlane, this.intersectionPoint);

    if (intersected) {
      // 计算新位置（加上偏移）
      const newPosition = this.intersectionPoint.clone().add(this.dragOffset);
      
      // 更新对象位置
      sceneObject.object3D.position.copy(newPosition);

      // 触发拖拽更新事件
      this.editor.eventSystemInstance.emit('object:drag:update', {
        objectId: this.dragTargetId,
        position: newPosition.clone(),
        delta: newPosition.clone().sub(this.dragStartPosition)
      });
    }
  }

  private endObjectDrag(): void {
    if (!this.isDragging || !this.dragTargetId) return;

    const sceneObject = this.editor.getObject(this.dragTargetId);
    if (sceneObject) {
      // 触发拖拽结束事件
      this.editor.eventSystemInstance.emit('object:drag:end', {
        objectId: this.dragTargetId,
        startPosition: this.dragStartPosition.clone(),
        endPosition: sceneObject.object3D.position.clone(),
        delta: sceneObject.object3D.position.clone().sub(this.dragStartPosition)
      });
    }

    this.isDragging = false;
    this.dragTargetId = null;
  }

  private startViewDrag(): void {
    this.isViewDragging = true;
  }

  private updateViewDrag(): void {
    if (!this.isViewDragging) return;

    const deltaX = this.currentMousePosition.x - this.lastMousePosition.x;
    const deltaY = this.currentMousePosition.y - this.lastMousePosition.y;

    // 根据相机的正交尺寸计算移动距离
    const moveScale = (this.camera.right - this.camera.left) / 2;
    
    // 移动相机
    this.camera.position.x -= deltaX * moveScale;
    this.camera.position.z += deltaY * moveScale; // 注意Z轴方向

    this.lastMousePosition.copy(this.currentMousePosition);
  }

  private endViewDrag(): void {
    this.isViewDragging = false;
  }

  private updateCameraZoom(): void {
    const baseSize = 10;
    const size = baseSize / this.zoomLevel;
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;

    this.camera.left = -size * aspect;
    this.camera.right = size * aspect;
    this.camera.top = size;
    this.camera.bottom = -size;
    this.camera.updateProjectionMatrix();
  }

  // 公共方法：设置视角类型
  public setViewType(type: 'top' | 'front' | 'side'): void {
    switch (type) {
      case 'top':
        this.camera.position.set(0, 20, 0);
        this.camera.lookAt(0, 0, 0);
        this.camera.up.set(0, 0, -1);
        // 重新设置拖拽平面为XZ平面
        this.dragPlane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, 0, 0)
        );
        break;
      case 'front':
        this.camera.position.set(0, 0, 20);
        this.camera.lookAt(0, 0, 0);
        this.camera.up.set(0, 1, 0);
        // 重新设置拖拽平面为XY平面
        this.dragPlane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(0, 0, 0)
        );
        break;
      case 'side':
        this.camera.position.set(20, 0, 0);
        this.camera.lookAt(0, 0, 0);
        this.camera.up.set(0, 1, 0);
        // 重新设置拖拽平面为YZ平面
        this.dragPlane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, 0, 0)
        );
        break;
    }
  }

  // 重置视图
  public resetView(): void {
    this.zoomLevel = 1;
    this.camera.position.copy(new THREE.Vector3(0, 20, 0));
    this.camera.lookAt(0, 0, 0);
    this.updateCameraZoom();
    
    // 触发缩放级别变化回调
    if (this.onZoomChange) {
      this.onZoomChange(this.zoomLevel);
    }
  }

  // 获取当前缩放级别
  public getZoomLevel(): number {
    return this.zoomLevel;
  }

  // 设置缩放级别变化回调
  public onZoomChange?: (zoomLevel: number) => void;

  public dispose(): void {
    this.removeEventListeners();
    super.dispose();
  }
} 