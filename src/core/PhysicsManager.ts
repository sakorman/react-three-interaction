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

  public addPhysicsBody(
    sceneObject: SceneObject,
    options: {
      mass?: number;
      shape?: 'box' | 'sphere' | 'cylinder' | 'custom';
      material?: CANNON.Material;
      fixedRotation?: boolean;
    } = {}
  ): string {
    const { mass = 1, shape = 'box', material, fixedRotation = false } = options;
    const mesh = sceneObject.object3D;

    // 创建物理形状
    let physicsShape: CANNON.Shape;
    const bounds = sceneObject.getBounds();

    switch (shape) {
      case 'sphere':
        const radius = Math.max(bounds.size.x, bounds.size.y, bounds.size.z) / 2;
        physicsShape = new CANNON.Sphere(radius);
        break;
      case 'cylinder':
        physicsShape = new CANNON.Cylinder(
          bounds.size.x / 2,
          bounds.size.x / 2,
          bounds.size.y,
          8
        );
        break;
      case 'box':
      default:
        physicsShape = new CANNON.Box(new CANNON.Vec3(
          bounds.size.x / 2,
          bounds.size.y / 2,
          bounds.size.z / 2
        ));
        break;
    }

    // 创建物理体
    const body = new CANNON.Body({ mass });
    body.addShape(physicsShape);
    body.position.set(
      mesh.position.x,
      mesh.position.y,
      mesh.position.z
    );
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

  public step(deltaTime: number): void {
    if (!this.isRunning) return;

    // 更新物理世界
    this.world.step(Math.min(deltaTime, 1/30));

    // 同步物理体和网格对象
    this.physicsBodies.forEach(physicsBody => {
      const { body, mesh } = physicsBody;
      
      // 同步位置：Cannon Vec3 -> Three Vector3
      mesh.position.set(body.position.x, body.position.y, body.position.z);
      // 同步旋转：Cannon Quaternion -> Three Quaternion
      mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
    });

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