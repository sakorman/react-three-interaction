import * as THREE from 'three';

import { SceneObject } from '../models/SceneObject';
import { EventSystem } from './EventSystem';

export interface SceneManagerOptions {
  enableOutlines?: boolean;
  enableGrid?: boolean;
  enableAxes?: boolean;
  maxObjects?: number;
}

export class SceneManager {
  private scene: THREE.Scene;
  private eventSystem: EventSystem;
  private sceneObjects: Map<string, SceneObject> = new Map();
  private objectHierarchy: Map<string, Set<string>> = new Map(); // parentId -> childIds
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private options: Required<SceneManagerOptions>;

  // 辅助对象
  private gridHelper?: THREE.GridHelper;
  private axesHelper?: THREE.AxesHelper;
  private outlinePass?: any; // 需要后期渲染

  constructor(
    scene: THREE.Scene,
    eventSystem: EventSystem,
    options: SceneManagerOptions = {}
  ) {
    this.scene = scene;
    this.eventSystem = eventSystem;
    this.options = {
      enableOutlines: true,
      enableGrid: true,
      enableAxes: true,
      maxObjects: 1000,
      ...options,
    };

    this.initialize();
  }

  private initialize(): void {
    // 创建网格辅助器
    if (this.options.enableGrid) {
      this.gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
      this.scene.add(this.gridHelper);
    }

    // 创建坐标轴辅助器
    if (this.options.enableAxes) {
      this.axesHelper = new THREE.AxesHelper(5);
      this.scene.add(this.axesHelper);
    }

    // 设置raycaster参数
    this.raycaster.params.Line.threshold = 0.1;
    this.raycaster.params.Points.threshold = 0.1;
  }

  public addObject(object3D: THREE.Object3D, parentId?: string): SceneObject {
    if (this.sceneObjects.size >= this.options.maxObjects) {
      throw new Error(`Maximum number of objects (${this.options.maxObjects}) reached`);
    }

    const sceneObject = new SceneObject(object3D, { parentId });
    this.sceneObjects.set(sceneObject.id, sceneObject);

    // 添加到场景或父对象
    if (parentId) {
      const parentObject = this.sceneObjects.get(parentId);
      if (parentObject) {
        parentObject.object3D.add(object3D);
        parentObject.children.push(sceneObject.id);
        
        // 更新层级关系
        if (!this.objectHierarchy.has(parentId)) {
          this.objectHierarchy.set(parentId, new Set());
        }
        this.objectHierarchy.get(parentId)!.add(sceneObject.id);
      }
    } else {
      this.scene.add(object3D);
    }

    this.eventSystem.emit('object:add', { objectId: sceneObject.id });
    this.eventSystem.emit('scene:update', { timestamp: Date.now() });

    return sceneObject;
  }

  public removeObject(objectId: string): boolean {
    const sceneObject = this.sceneObjects.get(objectId);
    if (!sceneObject) return false;

    // 递归删除子对象
    const children = this.objectHierarchy.get(objectId);
    if (children) {
      Array.from(children).forEach(childId => {
        this.removeObject(childId);
      });
      this.objectHierarchy.delete(objectId);
    }

    // 从父对象中移除
    if (sceneObject.parentId) {
      const parentObject = this.sceneObjects.get(sceneObject.parentId);
      if (parentObject) {
        parentObject.object3D.remove(sceneObject.object3D);
        const index = parentObject.children.indexOf(objectId);
        if (index > -1) {
          parentObject.children.splice(index, 1);
        }
        
        const siblings = this.objectHierarchy.get(sceneObject.parentId);
        if (siblings) {
          siblings.delete(objectId);
        }
      }
    } else {
      this.scene.remove(sceneObject.object3D);
    }

    // 清理资源
    sceneObject.dispose();
    this.sceneObjects.delete(objectId);

    this.eventSystem.emit('object:remove', { objectId });
    this.eventSystem.emit('scene:update', { timestamp: Date.now() });

    return true;
  }

  public getObject(objectId: string): SceneObject | undefined {
    return this.sceneObjects.get(objectId);
  }

  public getAllObjects(): SceneObject[] {
    return Array.from(this.sceneObjects.values());
  }

  public getObjectsByType(type: string): SceneObject[] {
    return this.getAllObjects().filter(obj => obj.type === type);
  }

  public getChildren(parentId: string): SceneObject[] {
    const childIds = this.objectHierarchy.get(parentId);
    if (!childIds) return [];
    
    return Array.from(childIds)
      .map(id => this.sceneObjects.get(id))
      .filter(obj => obj !== undefined) as SceneObject[];
  }

  public getRootObjects(): SceneObject[] {
    return this.getAllObjects().filter(obj => !obj.parentId);
  }

  public raycast(
    mouse: THREE.Vector2,
    camera: THREE.Camera,
    objects?: THREE.Object3D[]
  ): THREE.Intersection[] {
    this.raycaster.setFromCamera(mouse, camera);
    
    const targetObjects = objects || this.scene.children.filter(child => 
      child.userData.sceneObjectId && this.sceneObjects.has(child.userData.sceneObjectId)
    );

    return this.raycaster.intersectObjects(targetObjects, true);
  }

  public getObjectAtMouse(
    mouse: THREE.Vector2,
    camera: THREE.Camera
  ): SceneObject | null {
    const intersections = this.raycast(mouse, camera);
    
    for (const intersection of intersections) {
      let object = intersection.object;
      
      // 向上查找直到找到有sceneObjectId的对象
      while (object && !object.userData.sceneObjectId) {
        object = object.parent!;
      }
      
      if (object?.userData.sceneObjectId) {
        return this.sceneObjects.get(object.userData.sceneObjectId) || null;
      }
    }
    
    return null;
  }

  public updateObject(objectId: string, properties: any): boolean {
    const sceneObject = this.sceneObjects.get(objectId);
    if (!sceneObject) return false;

    sceneObject.updateProperties(properties);
    this.eventSystem.emit('object:transform', { objectId, transform: properties });
    this.eventSystem.emit('scene:update', { timestamp: Date.now() });

    return true;
  }

  public cloneObject(objectId: string): SceneObject | null {
    const originalObject = this.sceneObjects.get(objectId);
    if (!originalObject) return null;

    const clonedObject = originalObject.clone();
    return this.addObject(clonedObject.object3D, originalObject.parentId);
  }

  public showGrid(show: boolean): void {
    if (this.gridHelper) {
      this.gridHelper.visible = show;
    }
  }

  public showAxes(show: boolean): void {
    if (this.axesHelper) {
      this.axesHelper.visible = show;
    }
  }

  public clear(): void {
    // 删除所有场景对象
    const objectIds = Array.from(this.sceneObjects.keys());
    objectIds.forEach(id => this.removeObject(id));
    
    this.sceneObjects.clear();
    this.objectHierarchy.clear();
    
    this.eventSystem.emit('scene:update', { timestamp: Date.now() });
  }

  public dispose(): void {
    this.clear();
    
    // 清理辅助对象
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper);
      this.gridHelper.dispose();
    }
    
    if (this.axesHelper) {
      this.scene.remove(this.axesHelper);
      this.axesHelper.dispose();
    }
  }

  public getStats() {
    return {
      totalObjects: this.sceneObjects.size,
      rootObjects: this.getRootObjects().length,
      maxObjects: this.options.maxObjects,
    };
  }
} 