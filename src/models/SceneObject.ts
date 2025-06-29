import * as THREE from 'three';

export interface SceneObjectProperties {
  id: string;
  name: string;
  type: 'mesh' | 'group' | 'light' | 'camera' | 'helper';
  visible: boolean;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  material?: THREE.Material | THREE.Material[];
  geometry?: THREE.BufferGeometry;
  userData: Record<string, any>;
  children: string[];
  parentId?: string;
}

export interface SceneObjectBounds {
  min: THREE.Vector3;
  max: THREE.Vector3;
  center: THREE.Vector3;
  size: THREE.Vector3;
}

export class SceneObject {
  public id: string;
  public name: string;
  public type: SceneObjectProperties['type'];
  public object3D: THREE.Object3D;
  public visible: boolean;
  public userData: Record<string, any>;
  public children: string[] = [];
  public parentId?: string;

  constructor(object3D: THREE.Object3D, properties?: Partial<SceneObjectProperties>) {
    this.id = properties?.id || THREE.MathUtils.generateUUID();
    this.name = properties?.name || `Object_${this.id.slice(0, 8)}`;
    this.type = this.detectObjectType(object3D);
    this.object3D = object3D;
    this.visible = properties?.visible ?? true;
    this.userData = properties?.userData || {};
    this.parentId = properties?.parentId;
    
    // 设置object3D的userData
    this.object3D.userData = {
      ...this.object3D.userData,
      sceneObjectId: this.id,
    };
  }

  private detectObjectType(object3D: THREE.Object3D): SceneObjectProperties['type'] {
    if (object3D instanceof THREE.Mesh) return 'mesh';
    if (object3D instanceof THREE.Group) return 'group';
    if (object3D instanceof THREE.Light) return 'light';
    if (object3D instanceof THREE.Camera) return 'camera';
    return 'group';
  }

  public getProperties(): SceneObjectProperties {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      visible: this.visible,
      position: this.object3D.position.clone(),
      rotation: this.object3D.rotation.clone(),
      scale: this.object3D.scale.clone(),
      material: this.getMaterial(),
      geometry: this.getGeometry(),
      userData: { ...this.userData },
      children: [...this.children],
      parentId: this.parentId,
    };
  }

  public updateProperties(properties: Partial<SceneObjectProperties>): void {
    if (properties.name !== undefined) this.name = properties.name;
    if (properties.visible !== undefined) {
      this.visible = properties.visible;
      this.object3D.visible = properties.visible;
    }
    if (properties.position) this.object3D.position.copy(properties.position);
    if (properties.rotation) this.object3D.rotation.copy(properties.rotation);
    if (properties.scale) this.object3D.scale.copy(properties.scale);
    if (properties.userData) this.userData = { ...this.userData, ...properties.userData };
  }

  public getBounds(): SceneObjectBounds {
    const box = new THREE.Box3().setFromObject(this.object3D);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    
    box.getCenter(center);
    box.getSize(size);

    return {
      min: box.min.clone(),
      max: box.max.clone(),
      center,
      size,
    };
  }

  public getMaterial(): THREE.Material | THREE.Material[] | undefined {
    if (this.object3D instanceof THREE.Mesh) {
      return this.object3D.material;
    }
    return undefined;
  }

  public getGeometry(): THREE.BufferGeometry | undefined {
    if (this.object3D instanceof THREE.Mesh) {
      return this.object3D.geometry;
    }
    return undefined;
  }

  public clone(): SceneObject {
    const clonedObject3D = this.object3D.clone();
    return new SceneObject(clonedObject3D, {
      name: `${this.name}_Copy`,
      type: this.type,
      visible: this.visible,
      userData: { ...this.userData },
    });
  }

  public dispose(): void {
    // 清理资源
    if (this.object3D instanceof THREE.Mesh) {
      this.object3D.geometry?.dispose();
      const material = this.object3D.material;
      if (Array.isArray(material)) {
        material.forEach(mat => mat.dispose());
      } else {
        material?.dispose();
      }
    }
  }
} 