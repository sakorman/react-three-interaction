# 轨迹动画功能指南

本指南介绍如何在 react-three-interaction 中使用轨迹动画功能。

## 功能概述

轨迹动画系统支持多种运动模式：
- **直线轨迹**：从当前位置到目标位置的直线运动
- **圆形轨迹**：以指定中心点的圆形运动
- **弧形轨迹**：抛物线轨迹，适合投掷动画
- **矩形轨迹**：沿矩形路径的运动
- **重力轨迹**：模拟重力影响的物理运动
- **螺旋轨迹**：螺旋向上的轨迹

## 基本用法

### 1. 导入相关组件

```tsx
import { 
  TrajectorySystem, 
  TrajectoryPanel,
  EditorCore 
} from 'react-three-interaction';
```

### 2. 创建轨迹系统

```tsx
const editor = new EditorCore(canvas);
const trajectorySystem = new TrajectorySystem(editor.eventSystem);
trajectorySystem.start();
```

### 3. 使用轨迹面板组件

```tsx
import React from 'react';
import { TrajectoryPanel } from 'react-three-interaction';

const MyApp = () => {
  const [selectedObject, setSelectedObject] = useState(null);

  return (
    <div>
      <TrajectoryPanel
        trajectorySystem={trajectorySystem}
        selectedObject={selectedObject}
        onCreateTrajectory={(type, params) => {
          console.log('创建轨迹:', type, params);
        }}
      />
    </div>
  );
};
```

## 轨迹类型详解

### 直线轨迹

```javascript
// 创建直线轨迹
const trajectoryId = trajectorySystem.createTrajectory(
  sceneObject,
  'linear',
  new THREE.Vector3(10, 0, 10), // 目标位置
  {
    duration: 2,
    easing: 'linear'
  }
);

trajectorySystem.startTrajectory(trajectoryId);
```

### 圆形轨迹

```javascript
const trajectoryId = trajectorySystem.createTrajectory(
  sceneObject,
  'circular',
  {
    center: new THREE.Vector3(0, 0, 0),
    radius: 5,
    startAngle: 0,
    endAngle: Math.PI * 2,
    clockwise: true
  },
  {
    duration: 4,
    loop: true
  }
);
```

### 弧形轨迹

```javascript
const trajectoryId = trajectorySystem.createTrajectory(
  sceneObject,
  'arc',
  {
    startPoint: new THREE.Vector3(0, 0, 0),
    endPoint: new THREE.Vector3(10, 0, 10),
    height: 3 // 弧形最高点
  },
  {
    duration: 3,
    easing: 'easeOut'
  }
);
```

### 矩形轨迹

```javascript
const trajectoryId = trajectorySystem.createTrajectory(
  sceneObject,
  'rectangular',
  {
    center: new THREE.Vector3(0, 0, 0),
    width: 8,
    height: 6,
    startCorner: 'topLeft'
  },
  {
    duration: 8,
    loop: true
  }
);
```

### 重力轨迹

```javascript
const trajectoryId = trajectorySystem.createTrajectory(
  sceneObject,
  'gravity',
  {
    initialVelocity: new THREE.Vector3(5, 10, 0),
    gravity: -9.82,
    airResistance: 0.1
  },
  {
    duration: 5
  }
);
```

### 螺旋轨迹

```javascript
const trajectoryId = trajectorySystem.createTrajectory(
  sceneObject,
  'spiral',
  {
    center: new THREE.Vector3(0, 0, 0),
    radius: 3,
    height: 10,
    turns: 3,
    clockwise: true
  },
  {
    duration: 6
  }
);
```

## 高级选项

### 缓动函数

支持多种缓动函数：
- `linear`：线性
- `easeIn`：缓入
- `easeOut`：缓出
- `easeInOut`：缓入缓出
- `bounce`：弹跳效果

### 动画控制

```javascript
// 开始轨迹
trajectorySystem.startTrajectory(trajectoryId);

// 停止轨迹
trajectorySystem.stopTrajectory(trajectoryId);

// 移除轨迹
trajectorySystem.removeTrajectory(trajectoryId);

// 获取活跃轨迹
const activeTrajectories = trajectorySystem.getActiveTrajectories();
```

### 事件监听

```javascript
editor.eventSystem.on('trajectory:start', (data) => {
  console.log('轨迹开始:', data.trajectoryId);
});

editor.eventSystem.on('trajectory:update', (data) => {
  console.log('轨迹更新:', data.progress);
});

editor.eventSystem.on('trajectory:end', (data) => {
  console.log('轨迹结束:', data.trajectoryId);
});
```

## 性能优化

1. **适度使用轨迹数量**：避免同时运行过多轨迹
2. **合理设置帧率**：轨迹系统会自动限制更新频率
3. **及时清理**：结束的轨迹会自动清理，但可以手动移除

## 示例场景

### 投掷物动画

```javascript
// 创建投掷物轨迹
const throwTrajectory = trajectorySystem.createTrajectory(
  ballObject,
  'gravity',
  {
    initialVelocity: new THREE.Vector3(8, 12, 3),
    gravity: -9.82,
    airResistance: 0.05
  },
  {
    duration: 4,
    onComplete: () => {
      console.log('投掷完成');
    }
  }
);
```

### 巡逻动画

```javascript
// 创建巡逻路径
const patrolTrajectory = trajectorySystem.createTrajectory(
  guardObject,
  'rectangular',
  {
    center: new THREE.Vector3(0, 0, 0),
    width: 12,
    height: 8
  },
  {
    duration: 10,
    loop: true,
    easing: 'linear'
  }
);
```

### 装饰动画

```javascript
// 创建漂浮效果
const floatingTrajectory = trajectorySystem.createTrajectory(
  decorObject,
  'sine',
  {
    startPoint: decorObject.position.clone(),
    endPoint: decorObject.position.clone(),
    amplitude: 0.5,
    frequency: 2,
    axis: 'y'
  },
  {
    duration: 3,
    loop: true
  }
);
```

## 常见问题

### Q: 轨迹动画卡顿怎么办？
A: 检查是否有太多同时运行的轨迹，考虑减少轨迹数量或优化缓动函数。

### Q: 如何实现自定义轨迹？
A: 可以通过 `onUpdate` 回调函数自定义轨迹行为：

```javascript
const customTrajectory = trajectorySystem.createTrajectory(
  object,
  'linear',
  targetPosition,
  {
    duration: 3,
    onUpdate: (progress, position) => {
      // 自定义位置计算
      position.y += Math.sin(progress * Math.PI * 4) * 0.5;
    }
  }
);
```

### Q: 如何与物理引擎结合？
A: 轨迹系统可以与 PhysicsManager 结合使用，实现更复杂的物理交互。

## 总结

轨迹动画系统为 3D 场景提供了丰富的动画选项，支持多种运动模式和自定义参数。通过合理使用不同的轨迹类型和参数，可以创造出生动有趣的 3D 动画效果。 