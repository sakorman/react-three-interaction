import * as THREE from 'three';
import * as CANNON from 'cannon';
import { EventSystem } from './EventSystem';
import { SceneObject } from '../models/SceneObject';

export interface PhysicsOptions {
  gravity?: number;
  enableDebug?: boolean;
  iterations?: number;
  tolerance?: number;
}

export interface PhysicsBody {
  id: string;
  body: CANNON.Body;
  mesh: THREE.Object3D;
  sceneObjectId: string;
}

export class PhysicsManager {
  private world!: CANNON.World;
  private eventSystem: EventSystem;
  private physicsBodies: Map<string, PhysicsBody> = new Map();
  private cannonDebugRenderer?: {
    update: () => void;
    dispose: () => void;
  } | null;
  private options: Required<PhysicsOptions>;
  private isRunning = false;
  private lastTime = 0;

  constructor(eventSystem: EventSystem, options: PhysicsOptions = {}) {
    this.eventSystem = eventSystem;
    this.options = {
      gravity: -9.82,
      enableDebug: false,
      iterations: 10,
      tolerance: 0.0001,
      ...options,
    };

    this.initializePhysicsWorld();
  }

  private initializePhysicsWorld(): void {
    this.world = new CANNON.World();
    this.world.gravity.set(0, this.options.gravity, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = this.options.iterations;

    // 添加默认地面
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.world.addBody(groundBody);
  }

  /**
   * 为 3D 对象添加物理属性
   * 流程：几何分析 → 碰撞体创建 → 物理属性设置 → 世界注册
   * 
   * @param sceneObject 目标 3D 对象
   * @param options 物理配置参数
   * @returns 物理体唯一标识符
   */
  public addPhysicsBody(
    sceneObject: SceneObject,
    options: {
      mass?: number;                                    // 质量（kg）
      shape?: 'box' | 'sphere' | 'cylinder' | 'custom'; // 碰撞形状
      material?: CANNON.Material;                       // 物理材质
      fixedRotation?: boolean;                          // 是否固定旋转
    } = {}
  ): string {
    const { mass = 1, shape = 'box', material, fixedRotation = false } = options;
    const mesh = sceneObject.object3D;

    // 第一步：几何分析 - 从 3D 网格提取边界信息
    let physicsShape: CANNON.Shape;
    const bounds = sceneObject.getBounds(); // 获取轴对齐边界盒 (AABB)

    // 第二步：碰撞体创建 - 根据形状类型创建对应的物理形状
    switch (shape) {
      case 'sphere':
        // 球形：使用最大尺寸作为半径，确保完全包围原网格
        const radius = Math.max(bounds.size.x, bounds.size.y, bounds.size.z) / 2;
        physicsShape = new CANNON.Sphere(radius);
        break;
        
      case 'cylinder':
        // 圆柱：上下半径相等，高度取 Y 轴尺寸
        physicsShape = new CANNON.Cylinder(
          bounds.size.x / 2,  // 上半径
          bounds.size.x / 2,  // 下半径（与上半径相等，形成圆柱）
          bounds.size.y,      // 高度
          8                   // 分段数（影响碰撞精度）
        );
        break;
        
      case 'box':
      default:
        // 盒子：最常用的碰撞形状，性能最好
        // Cannon.js 使用半尺寸（从中心到边的距离）
        physicsShape = new CANNON.Box(new CANNON.Vec3(
          bounds.size.x / 2,  // X 轴半宽
          bounds.size.y / 2,  // Y 轴半高
          bounds.size.z / 2   // Z 轴半深
        ));
        break;
    }

    // 第三步：物理体创建和配置
    const body = new CANNON.Body({ mass }); // 质量决定惯性和受力响应
    body.addShape(physicsShape);             // 添加碰撞形状
    
    // 第四步：初始状态同步 - 将渲染对象的变换应用到物理体
    body.position.set(
      mesh.position.x,
      mesh.position.y,
      mesh.position.z
    );
    
    // 四元数旋转同步：确保物理体和渲染对象初始朝向一致
    body.quaternion.x = mesh.quaternion.x;
    body.quaternion.y = mesh.quaternion.y;
    body.quaternion.z = mesh.quaternion.z;
    body.quaternion.w = mesh.quaternion.w;

    if (material) {
      body.material = material;
    }

    if (fixedRotation) {
      body.fixedRotation = true;
    }

    this.world.addBody(body);

    const physicsBody: PhysicsBody = {
      id: THREE.MathUtils.generateUUID(),
      body,
      mesh,
      sceneObjectId: sceneObject.id,
    };

    this.physicsBodies.set(physicsBody.id, physicsBody);

    this.eventSystem.emit('physics:body:add', {
      physicsBodyId: physicsBody.id,
      sceneObjectId: sceneObject.id,
    });

    return physicsBody.id;
  }

  public removePhysicsBody(physicsBodyId: string): boolean {
    const physicsBody = this.physicsBodies.get(physicsBodyId);
    if (!physicsBody) return false;

    // Cannon.js 使用 removeBody 方法移除物理体
    (this.world as unknown as { removeBody: (body: CANNON.Body) => void }).removeBody(physicsBody.body);
    this.physicsBodies.delete(physicsBodyId);

    this.eventSystem.emit('physics:body:remove', {
      physicsBodyId,
      sceneObjectId: physicsBody.sceneObjectId,
    });

    return true;
  }

  public applyForce(physicsBodyId: string, force: THREE.Vector3, point?: THREE.Vector3): boolean {
    const physicsBody = this.physicsBodies.get(physicsBodyId);
    if (!physicsBody) return false;

    const cannonForce = new CANNON.Vec3(force.x, force.y, force.z);
    const cannonPoint = point 
      ? new CANNON.Vec3(point.x, point.y, point.z)
      : new CANNON.Vec3(0, 0, 0);

    physicsBody.body.applyForce(cannonForce, cannonPoint);
    return true;
  }

  public applyImpulse(physicsBodyId: string, impulse: THREE.Vector3, point?: THREE.Vector3): boolean {
    const physicsBody = this.physicsBodies.get(physicsBodyId);
    if (!physicsBody) return false;

    const cannonImpulse = new CANNON.Vec3(impulse.x, impulse.y, impulse.z);
    const cannonPoint = point 
      ? new CANNON.Vec3(point.x, point.y, point.z)
      : new CANNON.Vec3(0, 0, 0);

    physicsBody.body.applyImpulse(cannonImpulse, cannonPoint);
    return true;
  }

  public setVelocity(physicsBodyId: string, velocity: THREE.Vector3): boolean {
    const physicsBody = this.physicsBodies.get(physicsBodyId);
    if (!physicsBody) return false;

    physicsBody.body.velocity.set(velocity.x, velocity.y, velocity.z);
    return true;
  }

  public getPhysicsBody(physicsBodyId: string): PhysicsBody | undefined {
    return this.physicsBodies.get(physicsBodyId);
  }

  public getAllPhysicsBodies(): PhysicsBody[] {
    return Array.from(this.physicsBodies.values());
  }

  public start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
  }

  public stop(): void {
    this.isRunning = false;
  }

  /**
   * 物理引擎主更新循环 - 每帧调用一次
   * 核心职责：物理世界计算 → 渲染对象同步
   * 
   * @param deltaTime 自上次更新以来的时间间隔（秒）
   */
  public step(deltaTime: number): void {
    if (!this.isRunning) return;

    // 物理世界更新：固定时间步长确保稳定性
    // 限制最大时间步长为 1/30 秒，防止物理爆炸
    // Cannon.js 内部使用数值积分求解运动方程
    this.world.step(Math.min(deltaTime, 1/30));

    // 双向同步：物理引擎 ↔ 3D渲染引擎
    // 将 Cannon.js 的物理计算结果同步到 Three.js 的渲染对象
    this.physicsBodies.forEach(physicsBody => {
      const { body, mesh } = physicsBody;
      
      // 位置同步：Cannon Vec3 → Three Vector3
      // 原理：物理引擎计算出新位置后，更新渲染对象的位置
      mesh.position.set(body.position.x, body.position.y, body.position.z);
      
      // 旋转同步：Cannon Quaternion → Three Quaternion
      // 原理：四元数表示 3D 旋转，避免万向锁问题
      mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
    });

    // 事件通知：告知其他系统物理更新完成
    this.eventSystem.emit('physics:step', { deltaTime });
  }

  public setGravity(gravity: THREE.Vector3): void {
    this.world.gravity.set(gravity.x, gravity.y, gravity.z);
    this.options.gravity = gravity.y;
  }

  public enableDebugRenderer(scene: THREE.Scene, enabled: boolean): void {
    if (enabled && !this.cannonDebugRenderer) {
      // 这里可以添加调试渲染器的实现
      // 需要额外的cannon调试渲染器库
      console.log('Physics debug renderer enabled');
    } else if (!enabled && this.cannonDebugRenderer) {
      console.log('Physics debug renderer disabled');
      this.cannonDebugRenderer = undefined;
    }
  }

  public dispose(): void {
    this.stop();
    this.physicsBodies.clear();
    this.world.contacts = [];
    this.world.bodies = [];
  }

  public getStats() {
    return {
      totalBodies: this.physicsBodies.size,
      worldBodies: this.world.bodies.length,
      isRunning: this.isRunning,
      gravity: this.options.gravity,
    };
  }
} 