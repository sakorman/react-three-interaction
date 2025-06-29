import * as THREE from 'three';

/**
 * 创建基础几何体
 */
export const createBasicGeometry = {
  box: (width = 1, height = 1, depth = 1) => new THREE.BoxGeometry(width, height, depth),
  sphere: (radius = 1, widthSegments = 32, heightSegments = 16) => 
    new THREE.SphereGeometry(radius, widthSegments, heightSegments),
  cylinder: (radiusTop = 1, radiusBottom = 1, height = 1, segments = 32) =>
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
  plane: (width = 1, height = 1) => new THREE.PlaneGeometry(width, height),
  cone: (radius = 1, height = 1, segments = 32) => 
    new THREE.ConeGeometry(radius, height, segments),
  torus: (radius = 1, tube = 0.4, radialSegments = 16, tubularSegments = 100) =>
    new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments),
};

/**
 * 创建基础材质
 */
export const createBasicMaterial = {
  standard: (color = 0xffffff, options?: Partial<THREE.MeshStandardMaterialParameters>) => 
    new THREE.MeshStandardMaterial({ color, ...options }),
  basic: (color = 0xffffff, options?: Partial<THREE.MeshBasicMaterialParameters>) =>
    new THREE.MeshBasicMaterial({ color, ...options }),
  lambert: (color = 0xffffff, options?: Partial<THREE.MeshLambertMaterialParameters>) =>
    new THREE.MeshLambertMaterial({ color, ...options }),
  phong: (color = 0xffffff, options?: Partial<THREE.MeshPhongMaterialParameters>) =>
    new THREE.MeshPhongMaterial({ color, ...options }),
};

/**
 * 创建快捷网格对象
 */
export const createMesh = (
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position?: [number, number, number]
): THREE.Mesh => {
  const mesh = new THREE.Mesh(geometry, material);
  if (position) {
    mesh.position.set(...position);
  }
  return mesh;
};

/**
 * 计算对象的包围盒
 */
export const getBoundingBox = (object: THREE.Object3D): THREE.Box3 => {
  const box = new THREE.Box3();
  box.setFromObject(object);
  return box;
};

/**
 * 计算两点之间的距离
 */
export const getDistance = (
  point1: THREE.Vector3,
  point2: THREE.Vector3
): number => {
  return point1.distanceTo(point2);
};

/**
 * 将度数转换为弧度
 */
export const degToRad = (degrees: number): number => {
  return degrees * Math.PI / 180;
};

/**
 * 将弧度转换为度数
 */
export const radToDeg = (radians: number): number => {
  return radians * 180 / Math.PI;
};

/**
 * 创建辅助线框
 */
export const createWireframe = (
  geometry: THREE.BufferGeometry,
  color = 0x00ff00
): THREE.LineSegments => {
  const wireframeGeometry = new THREE.EdgesGeometry(geometry);
  const wireframeMaterial = new THREE.LineBasicMaterial({ color });
  return new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
};

/**
 * 创建包围盒辅助器
 */
export const createBoundingBoxHelper = (
  object: THREE.Object3D,
  color = 0xffff00
): THREE.Box3Helper => {
  const box = getBoundingBox(object);
  return new THREE.Box3Helper(box, color);
};

/**
 * 检查射线与对象的相交
 */
export const raycast = (
  raycaster: THREE.Raycaster,
  objects: THREE.Object3D[],
  recursive = true
): THREE.Intersection[] => {
  return raycaster.intersectObjects(objects, recursive);
};

/**
 * 从鼠标位置创建射线
 */
export const createRayFromMouse = (
  mouse: THREE.Vector2,
  camera: THREE.Camera
): THREE.Raycaster => {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  return raycaster;
};

/**
 * 将屏幕坐标转换为标准化设备坐标
 */
export const screenToNDC = (
  x: number,
  y: number,
  width: number,
  height: number
): THREE.Vector2 => {
  return new THREE.Vector2(
    (x / width) * 2 - 1,
    -(y / height) * 2 + 1
  );
};

/**
 * 创建网格地面
 */
export const createGridFloor = (
  size = 20,
  divisions = 20,
  colorCenterLine = 0x888888,
  colorGrid = 0x444444
): THREE.GridHelper => {
  return new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid);
};

/**
 * 创建坐标轴辅助器
 */
export const createAxesHelper = (size = 5): THREE.AxesHelper => {
  return new THREE.AxesHelper(size);
};

/**
 * 复制对象
 */
export const cloneObject = (object: THREE.Object3D): THREE.Object3D => {
  return object.clone();
};

/**
 * 设置对象阴影
 */
export const enableShadows = (object: THREE.Object3D): void => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * 获取对象的世界位置
 */
export const getWorldPosition = (object: THREE.Object3D): THREE.Vector3 => {
  const worldPosition = new THREE.Vector3();
  object.getWorldPosition(worldPosition);
  return worldPosition;
};

/**
 * 获取对象的世界旋转
 */
export const getWorldQuaternion = (object: THREE.Object3D): THREE.Quaternion => {
  const worldQuaternion = new THREE.Quaternion();
  object.getWorldQuaternion(worldQuaternion);
  return worldQuaternion;
};

/**
 * 获取对象的世界缩放
 */
export const getWorldScale = (object: THREE.Object3D): THREE.Vector3 => {
  const worldScale = new THREE.Vector3();
  object.getWorldScale(worldScale);
  return worldScale;
};

/**
 * 清理几何体和材质资源
 */
export const disposeObject = (object: THREE.Object3D): void => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      
      const material = child.material;
      if (Array.isArray(material)) {
        material.forEach(mat => mat.dispose());
      } else {
        material?.dispose();
      }
    }
  });
}; 