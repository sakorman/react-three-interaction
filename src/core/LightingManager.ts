import * as THREE from 'three';
import { EventSystem } from './EventSystem';
import { EditorSettings } from '../models/EditorState';

export class LightingManager {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private eventSystem: EventSystem;

  // 光源管理
  private ambientLight?: THREE.AmbientLight;
  private directionalLight?: THREE.DirectionalLight;
  private pointLight?: THREE.PointLight;
  private spotLight?: THREE.SpotLight;

  constructor(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    eventSystem: EventSystem
  ) {
    this.scene = scene;
    this.renderer = renderer;
    this.eventSystem = eventSystem;
    
    this.initializeLights();
  }

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

  public applyLightingSettings(settings: EditorSettings): void {
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

  public applyShadowSettings(settings: EditorSettings): void {
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

  // 光源控制API
  public setAmbientLight(intensity: number, color: string): void {
    if (this.ambientLight) {
      this.ambientLight.intensity = intensity;
      this.ambientLight.color.setHex(parseInt(color.replace('#', ''), 16));
    }
  }

  public setDirectionalLight(
    enabled: boolean,
    intensity?: number,
    color?: string,
    position?: { x: number; y: number; z: number }
  ): void {
    if (this.directionalLight) {
      this.directionalLight.visible = enabled;
      if (enabled && intensity !== undefined) {
        this.directionalLight.intensity = intensity;
      }
      if (enabled && color) {
        this.directionalLight.color.setHex(parseInt(color.replace('#', ''), 16));
      }
      if (enabled && position) {
        this.directionalLight.position.set(position.x, position.y, position.z);
      }
    }
  }

  public setPointLight(
    enabled: boolean,
    intensity?: number,
    color?: string,
    position?: { x: number; y: number; z: number }
  ): void {
    if (this.pointLight) {
      this.pointLight.visible = enabled;
      if (enabled && intensity !== undefined) {
        this.pointLight.intensity = intensity;
      }
      if (enabled && color) {
        this.pointLight.color.setHex(parseInt(color.replace('#', ''), 16));
      }
      if (enabled && position) {
        this.pointLight.position.set(position.x, position.y, position.z);
      }
    }
  }

  public setSpotLight(
    enabled: boolean,
    intensity?: number,
    color?: string,
    position?: { x: number; y: number; z: number },
    target?: { x: number; y: number; z: number },
    angle?: number,
    penumbra?: number
  ): void {
    if (this.spotLight) {
      this.spotLight.visible = enabled;
      if (enabled && intensity !== undefined) {
        this.spotLight.intensity = intensity;
      }
      if (enabled && color) {
        this.spotLight.color.setHex(parseInt(color.replace('#', ''), 16));
      }
      if (enabled && position) {
        this.spotLight.position.set(position.x, position.y, position.z);
      }
      if (enabled && target) {
        this.spotLight.target.position.set(target.x, target.y, target.z);
      }
      if (enabled && angle !== undefined) {
        this.spotLight.angle = angle;
      }
      if (enabled && penumbra !== undefined) {
        this.spotLight.penumbra = penumbra;
      }
    }
  }

  public enableShadows(enabled: boolean): void {
    this.renderer.shadowMap.enabled = enabled;
  }

  public setShadowMapType(type: 'Basic' | 'PCF' | 'PCFSoft' | 'VSM'): void {
    switch (type) {
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
    }
  }

  public dispose(): void {
    // 移除光源
    if (this.ambientLight) {
      this.scene.remove(this.ambientLight);
      this.ambientLight = undefined;
    }
    if (this.directionalLight) {
      this.scene.remove(this.directionalLight);
      this.directionalLight = undefined;
    }
    if (this.pointLight) {
      this.scene.remove(this.pointLight);
      this.pointLight = undefined;
    }
    if (this.spotLight) {
      this.scene.remove(this.spotLight);
      this.scene.remove(this.spotLight.target);
      this.spotLight = undefined;
    }
  }

  // Getters
  public get ambientLightInstance(): THREE.AmbientLight | undefined {
    return this.ambientLight;
  }

  public get directionalLightInstance(): THREE.DirectionalLight | undefined {
    return this.directionalLight;
  }

  public get pointLightInstance(): THREE.PointLight | undefined {
    return this.pointLight;
  }

  public get spotLightInstance(): THREE.SpotLight | undefined {
    return this.spotLight;
  }
} 