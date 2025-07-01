import * as THREE from 'three';
import { EditorCore } from '../../core/EditorCore';
import { BaseTool } from '../BaseTool';

export interface DragToolOptions {
  enableSnapping?: boolean;
  snapDistance?: number;
  constrainToPlane?: 'xy' | 'xz' | 'yz' | null;
  enableGridSnap?: boolean;
  gridSize?: number;
}

export class DragTool extends BaseTool {
  private options: Required<DragToolOptions>;
  private isDragging = false;
  private dragTargetId: string | null = null;
  private dragStartPosition = new THREE.Vector3();
  private dragOffset = new THREE.Vector3();
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private dragPlane?: THREE.Plane;
  private intersectionPoint = new THREE.Vector3();

  constructor(editor: EditorCore, options: DragToolOptions = {}) {
    super(editor, 'drag');
    
    this.options = {
      enableSnapping: true,
      snapDistance: 0.5,
      constrainToPlane: null,
      enableGridSnap: false,
      gridSize: 1,
      ...options,
    };

    this.initialize();
  }

  private initialize(): void {
    // 监听编辑器事件
    this.editor.eventSystemInstance.on('object:drag:start', this.onDragStart.bind(this));
    this.editor.eventSystemInstance.on('object:drag:update', this.onDragUpdate.bind(this));
    this.editor.eventSystemInstance.on('object:drag:end', this.onDragEnd.bind(this));
  }

  public activate(): void {
    super.activate();
    console.log('拖拽工具已激活');
    this.addEventListeners();
  }

  public deactivate(): void {
    super.deactivate();
    this.removeEventListeners();
    this.stopDragging();
  }

  private addEventListeners(): void {
    const canvas = this.editor.rendererInstance.domElement;
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  private removeEventListeners(): void {
    const canvas = this.editor.rendererInstance.domElement;
    canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
  }

  private onMouseDown(event: MouseEvent): void {
    this.updateMousePosition(event);
    
    // 检测鼠标下的对象
    const intersectedObject = this.getIntersectedObject();
    if (intersectedObject) {
      this.startDragging(intersectedObject);
    }
  }

  private onMouseMove(event: MouseEvent): void {
    this.updateMousePosition(event);
    
    if (this.isDragging && this.dragTargetId) {
      this.updateDragPosition();
    }
  }

  private onMouseUp(_event: MouseEvent): void {
    if (this.isDragging) {
      this.stopDragging();
    }
  }

  private updateMousePosition(event: MouseEvent): void {
    const canvas = this.editor.rendererInstance.domElement;
    const rect = canvas.getBoundingClientRect();
    
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private getIntersectedObject(): string | null {
    this.raycaster.setFromCamera(this.mouse, this.editor.cameraInstance);
    
    // 获取场景中的所有mesh对象
    const meshObjects: THREE.Object3D[] = [];
    this.editor.sceneInstance.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshObjects.push(child);
      }
    });

    const intersects = this.raycaster.intersectObjects(meshObjects);
    
    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      return intersectedObject.userData?.sceneObjectId || null;
    }
    
    return null;
  }

  private startDragging(objectId: string): void {
    const sceneObject = this.editor.getObject(objectId);
    if (!sceneObject) return;

    this.isDragging = true;
    this.dragTargetId = objectId;
    
    // 记录拖拽开始位置
    this.dragStartPosition.copy(sceneObject.object3D.position);
    
    // 创建拖拽平面
    this.createDragPlane(sceneObject.object3D.position);
    
    // 计算鼠标到对象的偏移
    this.calculateDragOffset();
    
    // 选中被拖拽的对象
    this.editor.dispatch({ type: 'SELECT_OBJECTS', payload: [objectId] });
    
    // 触发拖拽开始事件
    this.editor.eventSystemInstance.emit('object:drag:start', {
      objectId,
      startPosition: this.dragStartPosition.clone()
    });
    
    console.log(`开始拖拽对象: ${objectId}`);
  }

  private createDragPlane(position: THREE.Vector3): void {
    const camera = this.editor.cameraInstance;
    
    if (this.options.constrainToPlane) {
      // 根据约束平面创建拖拽平面
      switch (this.options.constrainToPlane) {
        case 'xy':
          this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -position.z);
          break;
        case 'xz':
          this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -position.y);
          break;
        case 'yz':
          this.dragPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), -position.x);
          break;
      }
    } else {
      // 创建垂直于相机视线的平面
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      this.dragPlane = new THREE.Plane(cameraDirection, -cameraDirection.dot(position));
    }
  }

  private calculateDragOffset(): void {
    if (!this.dragPlane) return;
    
    this.raycaster.setFromCamera(this.mouse, this.editor.cameraInstance);
    this.raycaster.ray.intersectPlane(this.dragPlane, this.intersectionPoint);
    
    if (this.dragTargetId) {
      const sceneObject = this.editor.getObject(this.dragTargetId);
      if (sceneObject) {
        this.dragOffset.subVectors(sceneObject.object3D.position, this.intersectionPoint);
      }
    }
  }

  private updateDragPosition(): void {
    if (!this.isDragging || !this.dragTargetId || !this.dragPlane) return;
    
    const sceneObject = this.editor.getObject(this.dragTargetId);
    if (!sceneObject) return;
    
    // 计算鼠标在拖拽平面上的交点
    this.raycaster.setFromCamera(this.mouse, this.editor.cameraInstance);
    const intersected = this.raycaster.ray.intersectPlane(this.dragPlane, this.intersectionPoint);
    
    if (intersected) {
      // 计算新位置（加上偏移）
      const newPosition = this.intersectionPoint.clone().add(this.dragOffset);
      
      // 应用网格吸附
      if (this.options.enableGridSnap) {
        this.applyGridSnap(newPosition);
      }
      
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

  private applyGridSnap(position: THREE.Vector3): void {
    const gridSize = this.options.gridSize;
    position.x = Math.round(position.x / gridSize) * gridSize;
    position.y = Math.round(position.y / gridSize) * gridSize;
    position.z = Math.round(position.z / gridSize) * gridSize;
  }

  private stopDragging(): void {
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
      
      // 触发变换事件
      this.editor.eventSystemInstance.emit('object:transform', {
        objectId: this.dragTargetId,
        transform: {
          position: sceneObject.object3D.position.clone(),
          rotation: sceneObject.object3D.rotation.clone(),
          scale: sceneObject.object3D.scale.clone()
        }
      });
    }
    
    console.log(`拖拽结束: ${this.dragTargetId}`);
    
    this.isDragging = false;
    this.dragTargetId = null;
    this.dragPlane = undefined;
  }

  private onDragStart({ objectId, startPosition }: { objectId: string; startPosition: THREE.Vector3 }): void {
    console.log(`对象 ${objectId} 开始拖拽，起始位置:`, startPosition);
  }

  private onDragUpdate({ objectId: _objectId, position: _position, delta: _delta }: { objectId: string; position: THREE.Vector3; delta: THREE.Vector3 }): void {
    // 可以在这里添加拖拽过程中的额外逻辑
  }

  private onDragEnd({ objectId, startPosition: _startPosition, endPosition: _endPosition, delta }: { 
    objectId: string; 
    startPosition: THREE.Vector3; 
    endPosition: THREE.Vector3; 
    delta: THREE.Vector3; 
  }): void {
    console.log(`对象 ${objectId} 拖拽完成，移动距离:`, delta);
  }

  // 公共API
  public setConstrainToPlane(plane: 'xy' | 'xz' | 'yz' | null): void {
    this.options.constrainToPlane = plane;
  }

  public setGridSnap(enabled: boolean, gridSize?: number): void {
    this.options.enableGridSnap = enabled;
    if (gridSize !== undefined) {
      this.options.gridSize = gridSize;
    }
  }

  public isCurrentlyDragging(): boolean {
    return this.isDragging;
  }

  public getDragTarget(): string | null {
    return this.dragTargetId;
  }

  public dispose(): void {
    this.stopDragging();
    this.removeEventListeners();
    super.dispose();
  }
} 