import * as THREE from 'three';
import { EventSystem } from './EventSystem';

export interface RenderManagerOptions {
  antialias?: boolean;
  alpha?: boolean;
  autoResize?: boolean;
}

export class RenderManager {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private eventSystem: EventSystem;
  private options: Required<RenderManagerOptions>;
  private animationFrameId?: number;

  constructor(
    canvas: HTMLCanvasElement, 
    scene: THREE.Scene, 
    eventSystem: EventSystem,
    options: RenderManagerOptions = {}
  ) {
    this.canvas = canvas;
    this.scene = scene;
    this.eventSystem = eventSystem;
    this.options = {
      antialias: true,
      alpha: true,
      autoResize: true,
      ...options,
    };

    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: this.options.antialias,
      alpha: this.options.alpha,
    });

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      1000
    );

    this.initialize();
  }

  private initialize(): void {
    // 设置渲染器
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // 设置相机
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    // 添加事件监听器
    if (this.options.autoResize) {
      window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    // 开始渲染循环
    this.startRenderLoop();
  }

  private onWindowResize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    
    this.eventSystem.emit('camera:change', { position: [this.camera.position.x, this.camera.position.y, this.camera.position.z] });
  }

  private startRenderLoop(): void {
    const render = () => {
      this.animationFrameId = requestAnimationFrame(render);
      this.renderer.render(this.scene, this.camera);
    };
    render();
  }

  public stopRenderLoop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  public setSize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
    this.eventSystem.emit('camera:change', { position: [x, y, z] });
  }

  public setCameraLookAt(x: number, y: number, z: number): void {
    this.camera.lookAt(x, y, z);
    this.eventSystem.emit('camera:change', { target: [x, y, z] });
  }

  public dispose(): void {
    this.stopRenderLoop();
    this.renderer.dispose();
    
    if (this.options.autoResize) {
      window.removeEventListener('resize', this.onWindowResize.bind(this));
    }
  }

  // Getters
  public get rendererInstance(): THREE.WebGLRenderer { return this.renderer; }
  public get cameraInstance(): THREE.PerspectiveCamera { return this.camera; }
  public get canvasElement(): HTMLCanvasElement { return this.canvas; }
  public get isRendering(): boolean { return this.animationFrameId !== undefined; }
} 