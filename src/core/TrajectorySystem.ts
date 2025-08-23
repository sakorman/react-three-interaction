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

  /**
   * 轨迹系统主更新循环 - 每帧调用一次
   * 核心职责：时间进度计算 → 位置计算 → 3D对象更新
   * 
   * @param sceneObjects 场景中所有的3D对象映射表
   */
  public update(sceneObjects: Map<string, SceneObject>): void {
    if (!this.isRunning) return;

    // 使用高精度时间戳，提供亚毫秒级精度
    const currentTime = performance.now();

    this.trajectories.forEach(trajectory => {
      // 性能优化：跳过非活跃轨迹
      if (!trajectory.isActive) return;

      const sceneObject = sceneObjects.get(trajectory.sceneObjectId);
      if (!sceneObject) return;

      // 时间域转换：绝对时间 → 相对进度 (0-1)
      const elapsed = (currentTime - trajectory.startTime) / 1000; // 转换为秒
      const rawProgress = Math.min(elapsed / trajectory.options.duration, 1); // 限制在[0,1]
      
      // 应用缓动函数：改变运动的时间曲线，创造不同的运动感觉
      const progress = this.applyEasing(rawProgress, trajectory.options.easing || 'linear');
      trajectory.progress = progress;

      // 核心算法：根据进度和轨迹类型计算3D空间位置
      const position = this.calculatePosition(trajectory, progress);
      
      // 同步更新：将计算结果应用到3D对象
      sceneObject.object3D.position.copy(position);

      // 事件系统：通知其他组件轨迹状态变化
      this.eventSystem.emit('trajectory:update', {
        trajectoryId: trajectory.id,
        progress,
      });

      // 用户回调：允许外部代码监听轨迹更新
      if (trajectory.options.onUpdate) {
        trajectory.options.onUpdate(progress, position);
      }

      // 生命周期管理：检查轨迹是否完成
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

  /**
   * 圆形轨迹位置计算 - 使用参数方程
   * 数学原理：圆的参数方程 P(t) = C + R * (cos(θ(t)), 0, sin(θ(t)))
   * 
   * @param params 圆形轨迹参数
   * @param progress 动画进度 [0,1]
   * @returns 计算出的3D位置
   */
  private calculateCircularPosition(params: CircularTrajectoryParams, progress: number): THREE.Vector3 {
    const {
      center,           // 圆心位置
      radius,           // 半径
      startAngle = 0,   // 起始角度（弧度）
      endAngle = Math.PI * 2, // 结束角度（弧度，默认一圈）
      clockwise = true, // 顺时针方向
      heightVariation = 0, // Y轴高度变化幅度
    } = params;

    // 角度映射：将进度[0,1]映射到角度范围
    const totalAngle = endAngle - startAngle;
    const currentAngle = startAngle + totalAngle * progress * (clockwise ? 1 : -1);
    
    // 圆的参数方程：
    // x = cx + r * cos(θ)  - 水平位置
    // z = cz + r * sin(θ)  - 深度位置
    const x = center.x + Math.cos(currentAngle) * radius;
    const z = center.z + Math.sin(currentAngle) * radius;
    
    // Y轴额外变化：创造立体螺旋效果
    // 使用正弦波让对象在圆形运动时上下浮动
    const y = center.y + Math.sin(progress * Math.PI) * heightVariation;

    return new THREE.Vector3(x, y, z);
  }

  /**
   * 弧形轨迹位置计算 - 使用二次贝塞尔曲线模拟抛物线
   * 数学原理：二次贝塞尔曲线 B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
   * 
   * @param params 弧形轨迹参数
   * @param progress 动画进度 [0,1]
   * @returns 计算出的3D位置
   */
  private calculateArcPosition(params: ArcTrajectoryParams, progress: number): THREE.Vector3 {
    const { startPoint, endPoint, height } = params;
    
    // 计算抛物线轨迹的控制点
    // 中点位置：起点和终点的中点
    const midPoint = new THREE.Vector3().lerpVectors(startPoint, endPoint, 0.5);
    // 抬升高度：在中点基础上向上偏移，形成弧形
    midPoint.y += height;
    
    // 二次贝塞尔曲线公式：B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    // P₀ = startPoint (起点)
    // P₁ = midPoint (控制点，决定弧形高度)
    // P₂ = endPoint (终点)
    const t = progress;
    const oneMinusT = 1 - t;
    
    return new THREE.Vector3(
      // X坐标：(1-t)²*x₀ + 2(1-t)t*x₁ + t²*x₂
      oneMinusT * oneMinusT * startPoint.x + 2 * oneMinusT * t * midPoint.x + t * t * endPoint.x,
      // Y坐标：(1-t)²*y₀ + 2(1-t)t*y₁ + t²*y₂
      oneMinusT * oneMinusT * startPoint.y + 2 * oneMinusT * t * midPoint.y + t * t * endPoint.y,
      // Z坐标：(1-t)²*z₀ + 2(1-t)t*z₁ + t²*z₂
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

  /**
   * 重力轨迹位置计算 - 基于牛顿力学的物理模拟
   * 物理原理：运动方程 s = s₀ + v₀t + ½at²，阻力模型 F = -kv
   * 
   * @param startPos 起始位置
   * @param params 重力轨迹参数
   * @param progress 动画进度 [0,1]
   * @param duration 动画总时长（秒）
   * @returns 计算出的3D位置
   */
  private calculateGravityPosition(
    startPos: THREE.Vector3,
    params: GravityTrajectoryParams,
    progress: number,
    duration: number
  ): THREE.Vector3 {
    const { 
      initialVelocity,          // 初始速度向量 (m/s)
      gravity = -9.82,          // 重力加速度 (m/s², 地球标准值)
      airResistance = 0         // 空气阻力系数
    } = params;
    
    // 时间映射：将相对进度转换为绝对时间
    const t = progress * duration;
    
    // 空气阻力的指数衰减模型：v(t) = v₀ * e^(-kt)
    // 阻力越大，速度衰减越快
    const dampening = Math.exp(-airResistance * t);
    
    // 水平运动方程（X轴）：考虑空气阻力的匀减速运动
    // x(t) = x₀ + v₀ₓ * t * e^(-kt)
    const x = startPos.x + initialVelocity.x * t * dampening;
    
    // 垂直运动方程（Y轴）：重力影响下的匀加速运动
    // y(t) = y₀ + v₀ᵧ * t + ½ * g * t²
    // 注意：重力通常为负值，因为向下加速
    const y = startPos.y + initialVelocity.y * t + 0.5 * gravity * t * t;
    
    // 深度运动方程（Z轴）：类似X轴，考虑空气阻力
    // z(t) = z₀ + v₀ᵤ * t * e^(-kt)
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

  /**
   * 缓动函数系统 - 改变动画的时间曲线
   * 作用：将线性时间进度转换为不同的运动感觉
   * 
   * @param progress 原始线性进度 [0,1]
   * @param easing 缓动类型
   * @returns 经过缓动处理的进度 [0,1]
   */
  private applyEasing(progress: number, easing: string): number {
    switch (easing) {
      case 'easeIn':
        // 缓入：慢速开始，快速结束 - 二次函数 f(t) = t²
        // 特点：加速度恒定，适合启动动画
        return progress * progress;
        
      case 'easeOut':
        // 缓出：快速开始，慢速结束 - 反向二次函数 f(t) = 1 - (1-t)²
        // 特点：减速度恒定，适合停止动画
        return 1 - Math.pow(1 - progress, 2);
        
      case 'easeInOut':
        // 缓入缓出：慢-快-慢的组合效果
        // 前半段：加速（缓入）
        // 后半段：减速（缓出）
        return progress < 0.5 
          ? 2 * progress * progress                    // 前半段：2t²
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;    // 后半段：平滑过渡
          
      case 'bounce':
        // 弹跳：模拟物理弹跳效果
        return this.bounceEasing(progress);
        
      case 'linear':
      default:
        // 线性：匀速运动，无加速度变化
        return progress;
    }
  }

  /**
   * 弹跳缓动函数 - 模拟物理弹跳效果
   * 原理：分段二次函数，模拟球落地后的多次弹跳
   * 
   * @param progress 动画进度 [0,1]
   * @returns 弹跳效果的进度值
   */
  private bounceEasing(progress: number): number {
    const n1 = 7.5625;  // 弹跳强度系数，控制弹跳的"弹性"
    const d1 = 2.75;     // 时间分段系数，将时间轴分为4个弹跳段
    
    // 第一次弹跳（最大弹跳）：占总时间的 36.4% (1/2.75)
    if (progress < 1 / d1) {
      return n1 * progress * progress;
    } 
    // 第二次弹跳（中等弹跳）：占总时间的 36.4% - 72.7%
    else if (progress < 2 / d1) {
      // 时间偏移，重新映射到 [0, 1/d1] 区间
      return n1 * (progress -= 1.5 / d1) * progress + 0.75;
    } 
    // 第三次弹跳（小弹跳）：占总时间的 72.7% - 90.9%
    else if (progress < 2.5 / d1) {
      return n1 * (progress -= 2.25 / d1) * progress + 0.9375;
    } 
    // 第四次弹跳（微弹跳）：占总时间的 90.9% - 100%
    else {
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