import * as THREE from 'three';
import { BaseTool } from '../BaseTool';
import { EditorCore } from '../../core/EditorCore';
import { EventSystem } from '../../core/EventSystem';
import { SceneManager } from '../../core/SceneManager';
import { SceneObject } from '../../models/SceneObject';
import { TrajectorySystem, TrajectoryType, TrajectoryOptions } from '../../core/TrajectorySystem';

export interface TrajectoryToolOptions {
  showPreview?: boolean;
  previewColor?: string;
  previewOpacity?: number;
  snapToGrid?: boolean;
}

export class TrajectoryTool extends BaseTool {
  private trajectorySystem: TrajectorySystem;
  private previewLine?: THREE.Line;
  private selectedObject?: SceneObject;
  private currentTrajectoryType: TrajectoryType = 'linear';
  private options: TrajectoryToolOptions;

  constructor(editor: EditorCore, options: TrajectoryToolOptions = {}) {
    super(editor, 'trajectory');
    this.trajectorySystem = new TrajectorySystem(this.getEventSystem());
    this.options = {
      showPreview: true,
      previewColor: '#00ff00',
      previewOpacity: 0.6,
      snapToGrid: false,
      ...options,
    };

    this.trajectorySystem.start();
  }

  /**
   * 工具激活 - 设置交互监听和视觉反馈
   * 职责：事件监听、预览系统、用户反馈
   */
  public activate(): void {
    super.activate();
    this.createPreviewLine(); // 创建轨迹预览线条
    
    // 事件驱动的对象选择系统
    // 监听用户的对象选择操作，更新工具状态
    this.getEventSystem().on('object:select', (data: { objectIds: string[] }) => {
      if (data.objectIds.length > 0) {
        // 获取第一个选中的对象作为轨迹的目标
        this.selectedObject = this.getSceneManager().getObject(data.objectIds[0]);
        this.updatePreview(); // 更新轨迹预览
      }
    });

    // 监听对象取消选择事件
    this.getEventSystem().on('object:deselect', () => {
      this.selectedObject = undefined;
      this.hidePreview(); // 隐藏预览，清理视觉状态
    });
  }

  public deactivate(): void {
    super.deactivate();
    this.hidePreview();
    this.removePreviewLine();
    this.selectedObject = undefined;
  }

  public onMouseDown(event: MouseEvent): boolean {
    if (!this.selectedObject) return false;

    const mouse = this.getMousePosition(event);
    const intersections = this.getSceneManager().raycast(mouse, this.getCamera());
    
    if (intersections.length > 0) {
      const targetPosition = intersections[0].point;
      this.createTrajectoryToPoint(targetPosition);
      return true;
    }

    return false;
  }

  public onMouseMove(event: MouseEvent): boolean {
    if (!this.selectedObject || !this.options.showPreview) return false;

    const mouse = this.getMousePosition(event);
    const intersections = this.getSceneManager().raycast(mouse, this.getCamera());
    
    if (intersections.length > 0) {
      const targetPosition = intersections[0].point;
      this.updatePreviewTo(targetPosition);
      return true;
    }

    return false;
  }

  public setTrajectoryType(type: TrajectoryType): void {
    this.currentTrajectoryType = type;
    this.updatePreview();
  }

  public createLinearTrajectory(targetPosition: THREE.Vector3, options: Partial<TrajectoryOptions> = {}): string | null {
    if (!this.selectedObject) return null;

    const trajectoryOptions: TrajectoryOptions = {
      duration: 2,
      easing: 'linear',
      ...options,
    };

    const trajectoryId = this.trajectorySystem.createTrajectory(
      this.selectedObject,
      'linear',
      targetPosition,
      trajectoryOptions
    );

    this.trajectorySystem.startTrajectory(trajectoryId);
    return trajectoryId;
  }

  /**
   * 创建圆形轨迹 - 对象沿圆形路径运动
   * 应用场景：巡逻、装饰动画、行星轨道等
   * 
   * @param center 圆心位置
   * @param radius 半径大小
   * @param options 动画配置选项
   * @returns 轨迹ID，用于后续控制
   */
  public createCircularTrajectory(center: THREE.Vector3, radius: number, options: Partial<TrajectoryOptions> = {}): string | null {
    if (!this.selectedObject) return null;

    // 默认配置：适合循环动画的设置
    const trajectoryOptions: TrajectoryOptions = {
      duration: 4,        // 4秒完成一圈，速度适中
      easing: 'linear',   // 匀速运动，符合圆周运动特性
      loop: true,         // 循环播放，持续运动
      ...options,         // 用户自定义配置覆盖默认值
    };

    // 圆形轨迹参数：完整的 360° 圆形路径
    const params = {
      center,                    // 圆心坐标
      radius,                    // 半径大小
      startAngle: 0,             // 起始角度：0 弧度（3点钟方向）
      endAngle: Math.PI * 2,     // 结束角度：2π 弧度（完整圆形）
      clockwise: true,           // 顺时针方向
    };

    // 轨迹生命周期：创建 → 启动 → 运行
    const trajectoryId = this.trajectorySystem.createTrajectory(
      this.selectedObject,  // 目标对象
      'circular',          // 轨迹类型
      params,              // 轨迹参数
      trajectoryOptions    // 动画选项
    );

    this.trajectorySystem.startTrajectory(trajectoryId); // 立即启动
    return trajectoryId;
  }

  public createArcTrajectory(endPoint: THREE.Vector3, height: number, options: Partial<TrajectoryOptions> = {}): string | null {
    if (!this.selectedObject) return null;

    const trajectoryOptions: TrajectoryOptions = {
      duration: 3,
      easing: 'easeOut',
      ...options,
    };

    const params = {
      startPoint: this.selectedObject.object3D.position.clone(),
      endPoint,
      height,
    };

    const trajectoryId = this.trajectorySystem.createTrajectory(
      this.selectedObject,
      'arc',
      params,
      trajectoryOptions
    );

    this.trajectorySystem.startTrajectory(trajectoryId);
    return trajectoryId;
  }

  public createRectangularTrajectory(center: THREE.Vector3, width: number, height: number, options: Partial<TrajectoryOptions> = {}): string | null {
    if (!this.selectedObject) return null;

    const trajectoryOptions: TrajectoryOptions = {
      duration: 8,
      easing: 'linear',
      loop: true,
      ...options,
    };

    const params = {
      center,
      width,
      height,
      startCorner: 'topLeft' as const,
    };

    const trajectoryId = this.trajectorySystem.createTrajectory(
      this.selectedObject,
      'rectangular',
      params,
      trajectoryOptions
    );

    this.trajectorySystem.startTrajectory(trajectoryId);
    return trajectoryId;
  }

  public createGravityTrajectory(initialVelocity: THREE.Vector3, options: Partial<TrajectoryOptions> = {}): string | null {
    if (!this.selectedObject) return null;

    const trajectoryOptions: TrajectoryOptions = {
      duration: 5,
      easing: 'linear',
      ...options,
    };

    const params = {
      initialVelocity,
      gravity: -9.82,
      airResistance: 0.1,
    };

    const trajectoryId = this.trajectorySystem.createTrajectory(
      this.selectedObject,
      'gravity',
      params,
      trajectoryOptions
    );

    this.trajectorySystem.startTrajectory(trajectoryId);
    return trajectoryId;
  }

  public createSpiralTrajectory(center: THREE.Vector3, radius: number, height: number, turns: number, options: Partial<TrajectoryOptions> = {}): string | null {
    if (!this.selectedObject) return null;

    const trajectoryOptions: TrajectoryOptions = {
      duration: 6,
      easing: 'linear',
      ...options,
    };

    const params = {
      center,
      radius,
      height,
      turns,
      clockwise: true,
    };

    const trajectoryId = this.trajectorySystem.createTrajectory(
      this.selectedObject,
      'spiral',
      params,
      trajectoryOptions
    );

    this.trajectorySystem.startTrajectory(trajectoryId);
    return trajectoryId;
  }

  public stopAllTrajectories(): void {
    const activeTrajectories = this.trajectorySystem.getActiveTrajectories();
    activeTrajectories.forEach(trajectory => {
      this.trajectorySystem.stopTrajectory(trajectory.id);
    });
  }

  /**
   * 工具更新循环 - 每帧调用
   * 职责：同步场景状态、驱动轨迹系统
   * 
   * @param _deltaTime 时间间隔（未使用，轨迹系统内部管理时间）
   */
  public update(_deltaTime: number): void {
    // 场景对象映射构建：为轨迹系统提供最新的对象状态
    // 这种设计允许轨迹系统独立于场景管理器运行
    const sceneObjects = new Map();
    this.getSceneManager().getAllObjects().forEach((obj: SceneObject) => {
      sceneObjects.set(obj.id, obj); // ID → SceneObject 映射
    });
    
    // 驱动轨迹系统：传入当前帧的所有对象状态
    // 轨迹系统会计算每个活跃轨迹的新位置并更新对象
    this.trajectorySystem.update(sceneObjects);
  }

  private createTrajectoryToPoint(targetPosition: THREE.Vector3): void {
    if (!this.selectedObject) return;

    switch (this.currentTrajectoryType) {
      case 'linear':
        this.createLinearTrajectory(targetPosition);
        break;
      case 'arc':
        this.createArcTrajectory(targetPosition, 2);
        break;
      case 'circular':
        this.createCircularTrajectory(targetPosition, 3);
        break;
      case 'rectangular':
        this.createRectangularTrajectory(targetPosition, 4, 4);
        break;
      case 'gravity':
        const velocity = new THREE.Vector3()
          .subVectors(targetPosition, this.selectedObject.object3D.position)
          .normalize()
          .multiplyScalar(5);
        this.createGravityTrajectory(velocity);
        break;
      case 'spiral':
        this.createSpiralTrajectory(targetPosition, 2, 3, 2);
        break;
    }
  }

  private createPreviewLine(): void {
    if (!this.options.showPreview) return;

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
      color: this.options.previewColor,
      opacity: this.options.previewOpacity,
      transparent: true,
    });

    this.previewLine = new THREE.Line(geometry, material);
    this.previewLine.visible = false;
    this.getScene().add(this.previewLine);
  }

  private removePreviewLine(): void {
    if (this.previewLine) {
      this.getScene().remove(this.previewLine);
      this.previewLine.geometry.dispose();
      (this.previewLine.material as THREE.Material).dispose();
      this.previewLine = undefined;
    }
  }

  private updatePreview(): void {
    if (!this.selectedObject || !this.previewLine) return;

    // 根据当前轨迹类型更新预览
    this.previewLine.visible = true;
  }

  private updatePreviewTo(targetPosition: THREE.Vector3): void {
    if (!this.selectedObject || !this.previewLine) return;

    const startPosition = this.selectedObject.object3D.position;
    const points = this.generatePreviewPoints(startPosition, targetPosition);
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.previewLine.geometry.dispose();
    this.previewLine.geometry = geometry;
  }

  private generatePreviewPoints(start: THREE.Vector3, end: THREE.Vector3): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const segments = 50;

    switch (this.currentTrajectoryType) {
      case 'linear':
        points.push(start.clone(), end.clone());
        break;
      
      case 'arc':
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const midPoint = new THREE.Vector3().lerpVectors(start, end, 0.5);
          midPoint.y += 2; // 弧形高度
          
          const point = new THREE.Vector3(
            (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * midPoint.x + t * t * end.x,
            (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * midPoint.y + t * t * end.y,
            (1 - t) * (1 - t) * start.z + 2 * (1 - t) * t * midPoint.z + t * t * end.z
          );
          points.push(point);
        }
        break;
      
      case 'circular':
        const center = end;
        const radius = 3;
        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const point = new THREE.Vector3(
            center.x + Math.cos(angle) * radius,
            center.y,
            center.z + Math.sin(angle) * radius
          );
          points.push(point);
        }
        break;
      
      default:
        points.push(start.clone(), end.clone());
    }

    return points;
  }

  private hidePreview(): void {
    if (this.previewLine) {
      this.previewLine.visible = false;
    }
  }

  private getMousePosition(event: MouseEvent): THREE.Vector2 {
    const rect = this.getCanvas().getBoundingClientRect();
    return new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
  }

  private getEventSystem(): EventSystem {
    // 访问 EditorCore 的私有 eventSystem 属性
    return (this.editor as unknown as { eventSystem: EventSystem }).eventSystem;
  }

  private getSceneManager(): SceneManager {
    // 访问 EditorCore 的私有 sceneManager 属性
    return (this.editor as unknown as { sceneManager: SceneManager }).sceneManager;
  }

  private getCamera(): THREE.PerspectiveCamera {
    // 访问 EditorCore 的私有 camera 属性
    return (this.editor as unknown as { camera: THREE.PerspectiveCamera }).camera;
  }

  private getScene(): THREE.Scene {
    // 访问 EditorCore 的私有 scene 属性
    return (this.editor as unknown as { scene: THREE.Scene }).scene;
  }

  private getCanvas(): HTMLCanvasElement {
    // 访问 EditorCore 的私有 canvas 属性
    return (this.editor as unknown as { canvas: HTMLCanvasElement }).canvas;
  }

  public dispose(): void {
    super.dispose();
    this.trajectorySystem.dispose();
    this.removePreviewLine();
  }

  public getTrajectorySystem(): TrajectorySystem {
    return this.trajectorySystem;
  }
} 