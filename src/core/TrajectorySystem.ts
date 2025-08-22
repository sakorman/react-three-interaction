import * as THREE from 'three';
import { EventSystem } from './EventSystem';
import { SceneObject } from '../models/SceneObject';

export type TrajectoryType = 'linear' | 'circular' | 'arc' | 'rectangular' | 'gravity' | 'bezier' | 'sine' | 'spiral';

export interface TrajectoryOptions {
  duration: number; // 持续时间（秒）
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';
  loop?: boolean;
  yoyo?: boolean;
  delay?: number;
  onUpdate?: (progress: number, position: THREE.Vector3) => void;
  onComplete?: () => void;
}

export interface CircularTrajectoryParams {
  center: THREE.Vector3;
  radius: number;
  startAngle?: number;
  endAngle?: number;
  clockwise?: boolean;
  heightVariation?: number; // Y轴变化
}

export interface ArcTrajectoryParams {
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
  height: number; // 弧形高度
  segments?: number;
}

export interface RectangularTrajectoryParams {
  center: THREE.Vector3;
  width: number;
  height: number;
  startCorner?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

export interface GravityTrajectoryParams {
  initialVelocity: THREE.Vector3;
  gravity?: number;
  airResistance?: number;
  bounceCount?: number;
  bounceDamping?: number;
}

export interface BezierTrajectoryParams {
  startPoint: THREE.Vector3;
  controlPoint1: THREE.Vector3;
  controlPoint2: THREE.Vector3;
  endPoint: THREE.Vector3;
}

export interface SineTrajectoryParams {
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
  amplitude: number;
  frequency: number;
  axis?: 'x' | 'y' | 'z';
}

export interface SpiralTrajectoryParams {
  center: THREE.Vector3;
  radius: number;
  height: number;
  turns: number;
  clockwise?: boolean;
}

export type TrajectoryParams = 
  | THREE.Vector3  // For linear trajectories
  | CircularTrajectoryParams
  | ArcTrajectoryParams  
  | RectangularTrajectoryParams
  | GravityTrajectoryParams
  | BezierTrajectoryParams
  | SineTrajectoryParams
  | SpiralTrajectoryParams;

export interface TrajectoryInstance {
  id: string;
  sceneObjectId: string;
  type: TrajectoryType;
  params: TrajectoryParams;
  options: TrajectoryOptions;
  startTime: number;
  startPosition: THREE.Vector3;
  isActive: boolean;
  progress: number;
}

export class TrajectorySystem {
  private eventSystem: EventSystem;
  private trajectories: Map<string, TrajectoryInstance> = new Map();
  private isRunning = false;

  constructor(eventSystem: EventSystem) {
    this.eventSystem = eventSystem;
  }

  public createTrajectory(
    sceneObject: SceneObject,
    type: TrajectoryType,
    params: TrajectoryParams,
    options: TrajectoryOptions
  ): string {
    const trajectoryId = THREE.MathUtils.generateUUID();
    
    const trajectory: TrajectoryInstance = {
      id: trajectoryId,
      sceneObjectId: sceneObject.id,
      type,
      params,
      options,
      startTime: performance.now(),
      startPosition: sceneObject.object3D.position.clone(),
      isActive: false,
      progress: 0,
    };

    this.trajectories.set(trajectoryId, trajectory);
    return trajectoryId;
  }

  public startTrajectory(trajectoryId: string): boolean {
    const trajectory = this.trajectories.get(trajectoryId);
    if (!trajectory) return false;

    trajectory.isActive = true;
    trajectory.startTime = performance.now() + (trajectory.options.delay || 0) * 1000;
    trajectory.progress = 0;

    this.eventSystem.emit('trajectory:start', {
      trajectoryId,
      objectId: trajectory.sceneObjectId,
    });

    return true;
  }

  public stopTrajectory(trajectoryId: string): boolean {
    const trajectory = this.trajectories.get(trajectoryId);
    if (!trajectory) return false;

    trajectory.isActive = false;
    
    this.eventSystem.emit('trajectory:end', {
      trajectoryId,
      objectId: trajectory.sceneObjectId,
    });

    return true;
  }

  public removeTrajectory(trajectoryId: string): boolean {
    const trajectory = this.trajectories.get(trajectoryId);
    if (!trajectory) return false;

    if (trajectory.isActive) {
      this.stopTrajectory(trajectoryId);
    }

    this.trajectories.delete(trajectoryId);
    return true;
  }

  public update(sceneObjects: Map<string, SceneObject>): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();

    this.trajectories.forEach(trajectory => {
      if (!trajectory.isActive) return;

      const sceneObject = sceneObjects.get(trajectory.sceneObjectId);
      if (!sceneObject) return;

      const elapsed = (currentTime - trajectory.startTime) / 1000;
      const rawProgress = Math.min(elapsed / trajectory.options.duration, 1);
      
      // 应用缓动函数
      const progress = this.applyEasing(rawProgress, trajectory.options.easing || 'linear');
      trajectory.progress = progress;

      // 计算当前位置
      const position = this.calculatePosition(trajectory, progress);
      
      // 更新对象位置
      sceneObject.object3D.position.copy(position);

      // 触发更新事件
      this.eventSystem.emit('trajectory:update', {
        trajectoryId: trajectory.id,
        progress,
      });

      if (trajectory.options.onUpdate) {
        trajectory.options.onUpdate(progress, position);
      }

      // 检查是否完成
      if (progress >= 1) {
        this.handleTrajectoryComplete(trajectory);
      }
    });
  }

  private calculatePosition(trajectory: TrajectoryInstance, progress: number): THREE.Vector3 {
    const { type, params, startPosition } = trajectory;

    switch (type) {
      case 'linear':
        return this.calculateLinearPosition(startPosition, params as THREE.Vector3, progress);
      
      case 'circular':
        return this.calculateCircularPosition(params as CircularTrajectoryParams, progress);
      
      case 'arc':
        return this.calculateArcPosition(params as ArcTrajectoryParams, progress);
      
      case 'rectangular':
        return this.calculateRectangularPosition(params as RectangularTrajectoryParams, progress);
      
      case 'gravity':
        return this.calculateGravityPosition(startPosition, params as GravityTrajectoryParams, progress, trajectory.options.duration);
      
      case 'bezier':
        return this.calculateBezierPosition(params as BezierTrajectoryParams, progress);
      
      case 'sine':
        return this.calculateSinePosition(params as SineTrajectoryParams, progress);
      
      case 'spiral':
        return this.calculateSpiralPosition(params as SpiralTrajectoryParams, progress);
      
      default:
        return startPosition.clone();
    }
  }

  private calculateLinearPosition(startPos: THREE.Vector3, endPos: THREE.Vector3, progress: number): THREE.Vector3 {
    return new THREE.Vector3().lerpVectors(startPos, endPos, progress);
  }

  private calculateCircularPosition(params: CircularTrajectoryParams, progress: number): THREE.Vector3 {
    const {
      center,
      radius,
      startAngle = 0,
      endAngle = Math.PI * 2,
      clockwise = true,
      heightVariation = 0,
    } = params;

    const totalAngle = endAngle - startAngle;
    const currentAngle = startAngle + totalAngle * progress * (clockwise ? 1 : -1);
    
    const x = center.x + Math.cos(currentAngle) * radius;
    const z = center.z + Math.sin(currentAngle) * radius;
    const y = center.y + Math.sin(progress * Math.PI) * heightVariation;

    return new THREE.Vector3(x, y, z);
  }

  private calculateArcPosition(params: ArcTrajectoryParams, progress: number): THREE.Vector3 {
    const { startPoint, endPoint, height } = params;
    
    // 计算抛物线轨迹
    const midPoint = new THREE.Vector3().lerpVectors(startPoint, endPoint, 0.5);
    midPoint.y += height;
    
    // 二次贝塞尔曲线
    const t = progress;
    const oneMinusT = 1 - t;
    
    return new THREE.Vector3(
      oneMinusT * oneMinusT * startPoint.x + 2 * oneMinusT * t * midPoint.x + t * t * endPoint.x,
      oneMinusT * oneMinusT * startPoint.y + 2 * oneMinusT * t * midPoint.y + t * t * endPoint.y,
      oneMinusT * oneMinusT * startPoint.z + 2 * oneMinusT * t * midPoint.z + t * t * endPoint.z
    );
  }

  private calculateRectangularPosition(params: RectangularTrajectoryParams, progress: number): THREE.Vector3 {
    const { center, width, height, startCorner = 'topLeft' } = params;
    
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    // 计算矩形的四个顶点
    const corners = {
      topLeft: new THREE.Vector3(center.x - halfWidth, center.y, center.z + halfHeight),
      topRight: new THREE.Vector3(center.x + halfWidth, center.y, center.z + halfHeight),
      bottomRight: new THREE.Vector3(center.x + halfWidth, center.y, center.z - halfHeight),
      bottomLeft: new THREE.Vector3(center.x - halfWidth, center.y, center.z - halfHeight),
    };

    const path = [corners.topLeft, corners.topRight, corners.bottomRight, corners.bottomLeft];
    
    // 找到起始角点的索引
    const startIndex = Object.keys(corners).indexOf(startCorner);
    
    // 重新排列路径以从指定角点开始
    const orderedPath = [...path.slice(startIndex), ...path.slice(0, startIndex)];
    
    // 计算当前位置在路径中的位置
    const segmentProgress = progress * 4;
    const segmentIndex = Math.floor(segmentProgress);
    const localProgress = segmentProgress - segmentIndex;
    
    if (segmentIndex >= 3) {
      return orderedPath[0].clone(); // 回到起点
    }
    
    const startPoint = orderedPath[segmentIndex];
    const endPoint = orderedPath[segmentIndex + 1];
    
    return new THREE.Vector3().lerpVectors(startPoint, endPoint, localProgress);
  }

  private calculateGravityPosition(
    startPos: THREE.Vector3,
    params: GravityTrajectoryParams,
    progress: number,
    duration: number
  ): THREE.Vector3 {
    const { initialVelocity, gravity = -9.82, airResistance = 0 } = params;
    
    const t = progress * duration;
    const dampening = Math.exp(-airResistance * t);
    
    const x = startPos.x + initialVelocity.x * t * dampening;
    const y = startPos.y + initialVelocity.y * t + 0.5 * gravity * t * t;
    const z = startPos.z + initialVelocity.z * t * dampening;
    
    return new THREE.Vector3(x, y, z);
  }

  private calculateBezierPosition(params: BezierTrajectoryParams, progress: number): THREE.Vector3 {
    const { startPoint, controlPoint1, controlPoint2, endPoint } = params;
    
    const t = progress;
    const oneMinusT = 1 - t;
    const oneMinusT2 = oneMinusT * oneMinusT;
    const oneMinusT3 = oneMinusT2 * oneMinusT;
    const t2 = t * t;
    const t3 = t2 * t;
    
    return new THREE.Vector3(
      oneMinusT3 * startPoint.x + 3 * oneMinusT2 * t * controlPoint1.x + 3 * oneMinusT * t2 * controlPoint2.x + t3 * endPoint.x,
      oneMinusT3 * startPoint.y + 3 * oneMinusT2 * t * controlPoint1.y + 3 * oneMinusT * t2 * controlPoint2.y + t3 * endPoint.y,
      oneMinusT3 * startPoint.z + 3 * oneMinusT2 * t * controlPoint1.z + 3 * oneMinusT * t2 * controlPoint2.z + t3 * endPoint.z
    );
  }

  private calculateSinePosition(params: SineTrajectoryParams, progress: number): THREE.Vector3 {
    const { startPoint, endPoint, amplitude, frequency, axis = 'y' } = params;
    
    const basePos = new THREE.Vector3().lerpVectors(startPoint, endPoint, progress);
    const offset = Math.sin(progress * frequency * Math.PI * 2) * amplitude;
    
    switch (axis) {
      case 'x':
        basePos.x += offset;
        break;
      case 'y':
        basePos.y += offset;
        break;
      case 'z':
        basePos.z += offset;
        break;
    }
    
    return basePos;
  }

  private calculateSpiralPosition(params: SpiralTrajectoryParams, progress: number): THREE.Vector3 {
    const { center, radius, height, turns, clockwise = true } = params;
    
    const angle = progress * turns * Math.PI * 2 * (clockwise ? 1 : -1);
    const currentRadius = radius * (1 - progress * 0.5); // 螺旋向内收缩
    
    const x = center.x + Math.cos(angle) * currentRadius;
    const z = center.z + Math.sin(angle) * currentRadius;
    const y = center.y + progress * height;
    
    return new THREE.Vector3(x, y, z);
  }

  private applyEasing(progress: number, easing: string): number {
    switch (easing) {
      case 'easeIn':
        return progress * progress;
      case 'easeOut':
        return 1 - Math.pow(1 - progress, 2);
      case 'easeInOut':
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      case 'bounce':
        return this.bounceEasing(progress);
      case 'linear':
      default:
        return progress;
    }
  }

  private bounceEasing(progress: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (progress < 1 / d1) {
      return n1 * progress * progress;
    } else if (progress < 2 / d1) {
      return n1 * (progress -= 1.5 / d1) * progress + 0.75;
    } else if (progress < 2.5 / d1) {
      return n1 * (progress -= 2.25 / d1) * progress + 0.9375;
    } else {
      return n1 * (progress -= 2.625 / d1) * progress + 0.984375;
    }
  }

  private handleTrajectoryComplete(trajectory: TrajectoryInstance): void {
    if (trajectory.options.loop) {
      trajectory.startTime = performance.now();
      trajectory.progress = 0;
    } else {
      trajectory.isActive = false;
      
      this.eventSystem.emit('trajectory:end', {
        trajectoryId: trajectory.id,
        objectId: trajectory.sceneObjectId,
      });

      if (trajectory.options.onComplete) {
        trajectory.options.onComplete();
      }
    }
  }

  public start(): void {
    this.isRunning = true;
  }

  public stop(): void {
    this.isRunning = false;
  }

  public getTrajectory(trajectoryId: string): TrajectoryInstance | undefined {
    return this.trajectories.get(trajectoryId);
  }

  public getAllTrajectories(): TrajectoryInstance[] {
    return Array.from(this.trajectories.values());
  }

  public getActiveTrajectories(): TrajectoryInstance[] {
    return this.getAllTrajectories().filter(t => t.isActive);
  }

  public dispose(): void {
    this.stop();
    this.trajectories.clear();
  }

  public getStats() {
    return {
      totalTrajectories: this.trajectories.size,
      activeTrajectories: this.getActiveTrajectories().length,
      isRunning: this.isRunning,
    };
  }
} 