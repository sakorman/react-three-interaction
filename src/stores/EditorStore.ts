import { makeAutoObservable, runInAction } from 'mobx';
import * as THREE from 'three';
import { SceneObject } from '../models/SceneObject';
import { EditorCore } from '../core/EditorCore';

export interface ModelData {
  id: string;
  name: string;
  type: 'cube' | 'sphere' | 'cylinder' | 'plane' | 'mesh';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  visible: boolean;
  color: string;
  material?: {
    type: 'standard' | 'basic' | 'lambert' | 'phong';
    color: string;
    metalness?: number;
    roughness?: number;
    opacity?: number;
    transparent?: boolean;
  };
  sceneObject?: SceneObject;
}

export class EditorStore {
  // 场景中的所有模型
  models = new Map<string, ModelData>();
  
  // 选中的模型ID列表
  selectedModelIds: string[] = [];
  
  // 悬停的模型ID
  hoveredModelId: string | null = null;
  
  // 当前激活的工具
  activeTool: string = 'select';
  
  // UI状态
  showPropertyPanel: boolean = true;
  showResourceManager: boolean = true;
  
  // 编辑器实例引用
  private editor: EditorCore | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // 设置编辑器实例
  setEditor(editor: EditorCore) {
    this.editor = editor;
  }

  // 添加模型到场景
  addModel(modelData: Partial<ModelData>): string {
    const id = THREE.MathUtils.generateUUID();
    
    const model: ModelData = {
      id,
      name: modelData.name || `模型_${id.slice(0, 8)}`,
      type: modelData.type || 'mesh',
      position: modelData.position || { x: 0, y: 0, z: 0 },
      rotation: modelData.rotation || { x: 0, y: 0, z: 0 },
      scale: modelData.scale || { x: 1, y: 1, z: 1 },
      visible: modelData.visible !== undefined ? modelData.visible : true,
      color: modelData.color || '#ffffff',
      material: modelData.material,
      sceneObject: modelData.sceneObject,
    };

    runInAction(() => {
      this.models.set(id, model);
    });

    return id;
  }

  // 从场景对象添加模型
  addModelFromSceneObject(sceneObject: SceneObject): string {
    const object3D = sceneObject.object3D;
    const material = object3D instanceof THREE.Mesh ? object3D.material : null;
    
    let color = '#ffffff';
    let materialData = undefined;
    
    if (material && material instanceof THREE.Material) {
      if ('color' in material && material.color instanceof THREE.Color) {
        color = `#${material.color.getHexString()}`;
      }
      
      materialData = {
        type: this.getMaterialType(material),
        color,
        metalness: 'metalness' in material ? (material as any).metalness : undefined,
        roughness: 'roughness' in material ? (material as any).roughness : undefined,
        opacity: material.opacity,
        transparent: material.transparent,
      };
    }

    const modelData: Partial<ModelData> = {
      name: sceneObject.name,
      type: this.getObjectType(object3D),
      position: {
        x: object3D.position.x,
        y: object3D.position.y,
        z: object3D.position.z,
      },
      rotation: {
        x: object3D.rotation.x,
        y: object3D.rotation.y,
        z: object3D.rotation.z,
      },
      scale: {
        x: object3D.scale.x,
        y: object3D.scale.y,
        z: object3D.scale.z,
      },
      visible: object3D.visible,
      color,
      material: materialData,
      sceneObject,
    };

    return this.addModel(modelData);
  }

  // 移除模型
  removeModel(id: string) {
    runInAction(() => {
      this.models.delete(id);
      this.selectedModelIds = this.selectedModelIds.filter(selectedId => selectedId !== id);
      if (this.hoveredModelId === id) {
        this.hoveredModelId = null;
      }
    });
  }

  // 更新模型属性
  updateModel(id: string, updates: Partial<ModelData>) {
    const model = this.models.get(id);
    if (!model) return;

    runInAction(() => {
      Object.assign(model, updates);
      
      // 同步到3D对象
      if (model.sceneObject) {
        const object3D = model.sceneObject.object3D;
        
        if (updates.position) {
          object3D.position.set(updates.position.x, updates.position.y, updates.position.z);
        }
        if (updates.rotation) {
          object3D.rotation.set(updates.rotation.x, updates.rotation.y, updates.rotation.z);
        }
        if (updates.scale) {
          object3D.scale.set(updates.scale.x, updates.scale.y, updates.scale.z);
        }
        if (updates.visible !== undefined) {
          object3D.visible = updates.visible;
        }
        if (updates.color && object3D instanceof THREE.Mesh && object3D.material instanceof THREE.Material && 'color' in object3D.material) {
          (object3D.material as any).color.setHex(parseInt(updates.color.replace('#', ''), 16));
        }
      }
    });
  }

  // 选择模型
  selectModel(id: string, multiSelect: boolean = false) {
    runInAction(() => {
      if (multiSelect) {
        if (this.selectedModelIds.includes(id)) {
          this.selectedModelIds = this.selectedModelIds.filter(selectedId => selectedId !== id);
        } else {
          this.selectedModelIds.push(id);
        }
      } else {
        this.selectedModelIds = [id];
      }
    });
  }

  // 取消选择模型
  deselectModel(id: string) {
    runInAction(() => {
      this.selectedModelIds = this.selectedModelIds.filter(selectedId => selectedId !== id);
    });
  }

  // 清空选择
  clearSelection() {
    runInAction(() => {
      this.selectedModelIds = [];
    });
  }

  // 设置悬停模型
  setHoveredModel(id: string | null) {
    runInAction(() => {
      this.hoveredModelId = id;
    });
  }

  // 设置激活工具
  setActiveTool(tool: string) {
    runInAction(() => {
      this.activeTool = tool;
    });
  }

  // 切换属性面板显示
  togglePropertyPanel() {
    runInAction(() => {
      this.showPropertyPanel = !this.showPropertyPanel;
    });
  }

  // 切换资源管理器显示
  toggleResourceManager() {
    runInAction(() => {
      this.showResourceManager = !this.showResourceManager;
    });
  }

  // 清空场景
  clearScene() {
    runInAction(() => {
      this.models.clear();
      this.selectedModelIds = [];
      this.hoveredModelId = null;
    });
  }

  // 获取计算属性
  get selectedModels(): ModelData[] {
    return this.selectedModelIds
      .map(id => this.models.get(id))
      .filter((model): model is ModelData => model !== undefined);
  }

  get activeModel(): ModelData | null {
    return this.selectedModelIds.length === 1 
      ? this.models.get(this.selectedModelIds[0]) || null 
      : null;
  }

  get modelList(): ModelData[] {
    return Array.from(this.models.values());
  }

  get selectionCount(): number {
    return this.selectedModelIds.length;
  }

  get hasSelection(): boolean {
    return this.selectedModelIds.length > 0;
  }

  // 辅助方法
  private getMaterialType(material: THREE.Material): 'standard' | 'basic' | 'lambert' | 'phong' {
    if (material instanceof THREE.MeshStandardMaterial) return 'standard';
    if (material instanceof THREE.MeshBasicMaterial) return 'basic';
    if (material instanceof THREE.MeshLambertMaterial) return 'lambert';
    if (material instanceof THREE.MeshPhongMaterial) return 'phong';
    return 'standard';
  }

  private getObjectType(object3D: THREE.Object3D): 'cube' | 'sphere' | 'cylinder' | 'plane' | 'mesh' {
    if (object3D instanceof THREE.Mesh && object3D.geometry) {
      if (object3D.geometry instanceof THREE.BoxGeometry) return 'cube';
      if (object3D.geometry instanceof THREE.SphereGeometry) return 'sphere';
      if (object3D.geometry instanceof THREE.CylinderGeometry) return 'cylinder';
      if (object3D.geometry instanceof THREE.PlaneGeometry) return 'plane';
    }
    return 'mesh';
  }
}

// 创建全局store实例
export const editorStore = new EditorStore(); 