declare module 'cannon' {
  export interface Vec3 {
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): void;
  }

  export class Vec3 {
    constructor(x?: number, y?: number, z?: number);
  }

  export interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    setFromAxisAngle(axis: Vec3, angle: number): void;
  }

  export class Quaternion {
    constructor(x?: number, y?: number, z?: number, w?: number);
  }

  export interface Material {
    friction: number;
    restitution: number;
  }

  export class Material {
    constructor(options?: { friction?: number; restitution?: number });
  }

  export interface Shape {}

  export class Shape {}

  export class Box extends Shape {
    constructor(halfExtents: Vec3);
  }

  export class Sphere extends Shape {
    constructor(radius: number);
  }

  export class Cylinder extends Shape {
    constructor(radiusTop: number, radiusBottom: number, height: number, numSegments: number);
  }

  export class Plane extends Shape {
    constructor();
  }

  export interface Body {
    mass: number;
    position: Vec3;
    quaternion: Quaternion;
    velocity: Vec3;
    material?: Material;
    fixedRotation: boolean;
    addShape(shape: Shape): void;
    applyForce(force: Vec3, worldPoint: Vec3): void;
    applyImpulse(impulse: Vec3, worldPoint: Vec3): void;
  }

  export class Body {
    constructor(options?: { mass?: number; material?: Material });
  }

  export interface ContactEquation {
    bi: Body;
    bj: Body;
    enabled: boolean;
  }

  export interface Solver {
    iterations: number;
    tolerance?: number;
  }

  export interface Broadphase {
    type: string;
  }

  export interface World {
    gravity: Vec3;
    broadphase: Broadphase;
    solver: Solver;
    bodies: Body[];
    contacts: ContactEquation[];
    addBody(body: Body): void;
    removeBody(body: Body): void;
    step(deltaTime: number): void;
  }

  export class World {
    constructor();
  }

  export class NaiveBroadphase {
    constructor();
  }
} 