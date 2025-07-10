import * as THREE from 'three';

import { EditorCore } from '../../core/EditorCore';
import { BaseTool } from '../BaseTool';

export interface SelectToolOptions {
  multiSelect?: boolean;
  selectOnHover?: boolean;
  highlightColor?: number;
}

export class SelectTool extends BaseTool {
  private options: Required<SelectToolOptions>;
  private selectHighlightMaterial: THREE.Material;
  private hoverHighlightMaterial: THREE.Material;
  private originalMaterials: Map<string, THREE.Material | THREE.Material[]> = new Map();

  constructor(editor: EditorCore, options: SelectToolOptions = {}) {
    super(editor, 'select');
    
    this.options = {
      multiSelect: true,
      selectOnHover: false,
      highlightColor: 0x00ff00,
      ...options,
    };

    // 创建可重用的高亮材质
    this.selectHighlightMaterial = new THREE.MeshBasicMaterial({
      color: this.options.highlightColor,
      transparent: true,
      opacity: 0.5,
      depthTest: false,
    });

    this.hoverHighlightMaterial = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.3,
      depthTest: false,
    });

    this.initialize();
  }

  private initialize(): void {
    // 监听编辑器事件
    this.editor.eventSystemInstance.on('object:select', this.onObjectSelect.bind(this));
    this.editor.eventSystemInstance.on('object:deselect', this.onObjectDeselect.bind(this));
    this.editor.eventSystemInstance.on('object:hover', this.onObjectHover.bind(this));
    this.editor.eventSystemInstance.on('object:unhover', this.onObjectUnhover.bind(this));
  }

  public activate(): void {
    super.activate();
  }

  public deactivate(): void {
    super.deactivate();
    this.clearAllHighlights();
  }

  private onObjectSelect({ objectIds }: { objectIds: string[] }): void {
    // 清除所有现有的选择高亮
    this.clearAllHighlights();
    
    // 为当前选中的对象添加高亮
    objectIds.forEach(objectId => {
      this.highlightObject(objectId, 'select');
    });
  }

  private onObjectDeselect({ objectIds }: { objectIds: string[] }): void {
    objectIds.forEach(objectId => {
      this.removeHighlight(objectId);
    });
  }

  private onObjectHover({ objectId }: { objectId: string }): void {
    if (!this.options.selectOnHover) {
      const state = this.editor.getState();
      // 只有在对象未被选中时才添加悬停高亮
      if (!state.selectedObjectIds.includes(objectId)) {
        this.highlightObject(objectId, 'hover');
      }
    }
  }

  private onObjectUnhover({ objectId }: { objectId: string }): void {
    if (!this.options.selectOnHover) {
      const state = this.editor.getState();
      // 只有在对象未被选中时才移除悬停高亮
      if (!state.selectedObjectIds.includes(objectId)) {
        this.removeHighlight(objectId);
      }
    }
  }

  private highlightObject(objectId: string, type: 'select' | 'hover'): void {
    const sceneObject = this.editor.getObject(objectId);
    if (!sceneObject || !(sceneObject.object3D instanceof THREE.Mesh)) return;

    const mesh = sceneObject.object3D as THREE.Mesh;
    
    // 保存原始材质
    if (!this.originalMaterials.has(objectId)) {
      this.originalMaterials.set(objectId, mesh.material);
    }

    // 应用高亮材质
    const highlightMaterial = type === 'select' ? this.selectHighlightMaterial : this.hoverHighlightMaterial;
    mesh.material = highlightMaterial;
  }

  private removeHighlight(objectId: string): void {
    const sceneObject = this.editor.getObject(objectId);
    if (!sceneObject || !(sceneObject.object3D instanceof THREE.Mesh)) return;

    const mesh = sceneObject.object3D as THREE.Mesh;
    const originalMaterial = this.originalMaterials.get(objectId);
    
    if (originalMaterial) {
      mesh.material = originalMaterial;
      this.originalMaterials.delete(objectId);
    }
  }

  private clearAllHighlights(): void {
    // 清除所有高亮并恢复原始材质
    this.originalMaterials.forEach((originalMaterial, objectId) => {
      const sceneObject = this.editor.getObject(objectId);
      if (sceneObject && sceneObject.object3D instanceof THREE.Mesh) {
        sceneObject.object3D.material = originalMaterial;
      }
    });
    this.originalMaterials.clear();
  }

  private clearAllSelectionHighlights(): void {
    // 这个方法现在使用 clearAllHighlights
    this.clearAllHighlights();
  }

  private clearSelectionHighlights(): void {
    // 这个方法现在已弃用，使用 clearAllHighlights 代替
    this.clearAllHighlights();
  }

  public selectObject(objectId: string, addToSelection = false): void {
    const state = this.editor.getState();
    
    if (addToSelection && this.options.multiSelect) {
      if (!state.selectedObjectIds.includes(objectId)) {
        this.editor.dispatch({ type: 'ADD_SELECTION', payload: objectId });
      }
    } else {
      this.editor.dispatch({ type: 'SELECT_OBJECTS', payload: [objectId] });
    }
  }

  public deselectObject(objectId: string): void {
    this.editor.dispatch({ type: 'REMOVE_SELECTION', payload: objectId });
  }

  public clearSelection(): void {
    this.editor.dispatch({ type: 'CLEAR_SELECTION' });
  }

  public selectAll(): void {
    const allObjectIds = this.editor.getAllObjects().map(obj => obj.id);
    this.editor.dispatch({ type: 'SELECT_OBJECTS', payload: allObjectIds });
  }

  public selectByType(type: string): void {
    const objectIds = this.editor.sceneManagerInstance
      .getObjectsByType(type)
      .map(obj => obj.id);
    this.editor.dispatch({ type: 'SELECT_OBJECTS', payload: objectIds });
  }

  public getSelectedObjects() {
    const state = this.editor.getState();
    return state.selectedObjectIds
      .map((id: string) => this.editor.getObject(id))
      .filter((obj: any) => obj !== undefined);
  }

  public dispose(): void {
    this.clearAllHighlights();
    this.selectHighlightMaterial?.dispose();
    this.hoverHighlightMaterial?.dispose();
    super.dispose();
  }
} 