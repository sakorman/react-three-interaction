# EditorCore 重构架构说明

## 重构目标

将原本庞大的 `EditorCore` 类拆分为多个专门的管理器类，遵循：
- **单一职责原则** - 每个管理器负责一个特定的功能领域
- **开放封闭原则** - 易于扩展新功能，无需修改现有代码
- **组合优于继承** - 使用组合模式而非继承来构建功能

## 架构概览

```
EditorCore (协调者)
├── EventSystem (事件总线)
├── RenderManager (渲染管理)
├── StateManager (状态管理)
├── ToolManager (工具管理)
├── InteractionManager (交互管理)
├── SceneManager (场景管理)
├── LightingManager (光照管理)
└── HistoryManager (历史记录管理)
```

## 管理器详解

### 1. EventSystem (事件系统)
- **职责**: 提供事件总线，协调各管理器间的通信
- **特点**: 所有其他管理器都依赖它
- **关键功能**: emit/on/off 事件机制

### 2. RenderManager (渲染管理器)
- **职责**: 管理 Three.js 渲染器、相机和渲染循环
- **核心功能**:
  - WebGL 渲染器初始化和配置
  - 相机管理（位置、朝向、投影）
  - 渲染循环和窗口大小调整
  - 渲染性能监控

### 3. StateManager (状态管理器)
- **职责**: 管理 Zustand 全局状态和 MobX 同步
- **核心功能**:
  - Zustand store 初始化和操作
  - 状态变化监听和事件触发
  - MobX Store 同步
  - 提供类型安全的状态访问 API

### 4. ToolManager (工具管理器)
- **职责**: 管理各种编辑工具的生命周期
- **核心功能**:
  - 工具注册和注销
  - 工具激活和切换
  - 工具扩展性支持
  - 工具状态同步

### 5. InteractionManager (交互管理器)
- **职责**: 处理鼠标事件和相机控制器
- **核心功能**:
  - 鼠标事件处理（点击、拖拽、悬停）
  - 对象选择逻辑（单选/多选）
  - 相机控制器管理（OrbitControls）
  - 交互状态维护

### 6. SceneManager (场景管理器)
- **职责**: 管理 3D 场景中的对象（复用现有）
- **核心功能**:
  - 3D 对象添加、删除、更新
  - 对象层次结构管理
  - 射线检测和对象拾取
  - 对象属性管理

### 7. LightingManager (光照管理器)
- **职责**: 管理光源和阴影系统
- **核心功能**:
  - 各种光源管理（环境光、平行光、点光源、聚光灯）
  - 阴影配置和优化
  - 光照设置的实时更新
  - 光照预设管理

### 8. HistoryManager (历史记录管理器)
- **职责**: 管理撤销/重做功能
- **核心功能**:
  - 历史快照创建和管理
  - 撤销/重做操作
  - 批量操作支持
  - 历史记录限制和清理

## 依赖关系

```
EventSystem (核心依赖)
    ↑
RenderManager → StateManager → HistoryManager
    ↑               ↑              ↑
InteractionManager  ↑         ToolManager
    ↑               ↑              ↑
SceneManager → LightingManager ────┘
```

## API 设计原则

### 1. 统一的接口风格
所有管理器都提供：
- `constructor()` - 初始化
- `dispose()` - 清理资源
- getter 方法访问核心实例

### 2. 事件驱动通信
管理器间通过 EventSystem 通信，避免直接依赖：
```typescript
// 好的做法
this.eventSystem.emit('object:select', { objectIds });

// 避免直接调用
this.toolManager.handleSelection();
```

### 3. 配置驱动
每个管理器都接受配置选项：
```typescript
const renderManager = new RenderManager(canvas, scene, eventSystem, {
  antialias: true,
  autoResize: true
});
```

## 扩展性

### 添加新管理器
1. 创建新的管理器类
2. 在 `EditorCore.initializeManagers()` 中初始化
3. 在 `EditorCore.dispose()` 中清理
4. 暴露必要的公共 API

### 添加新工具
```typescript
const customTool = new CustomTool(editorCore);
editorCore.registerTool('custom', customTool);
```

### 添加新事件类型
在 `EventSystem.ts` 中扩展 `EventType` 和 `EventData` 接口。

## 迁移指南

### 从原 EditorCore 迁移
```typescript
// 原来
const editor = new EditorCore(canvas);
editor.addObject(mesh);

// 现在 (API 保持兼容)
const editor = new EditorCore(canvas);
editor.addObject(mesh);

// 高级用法 (访问特定管理器)
const lightingManager = editor.getLightingManager();
lightingManager.setAmbientLight(0.5, '#ffffff');
```

## 性能优化

### 1. 延迟初始化
非必要管理器可以延迟初始化：
```typescript
private _historyManager?: HistoryManager;
get historyManager() {
  if (!this._historyManager) {
    this._historyManager = new HistoryManager(...);
  }
  return this._historyManager;
}
```

### 2. 事件节流
高频事件（如鼠标移动）使用节流：
```typescript
this.eventSystem.on('mouse:move', throttle(this.handleMouseMove, 16));
```

## 测试策略

### 1. 单元测试
每个管理器独立测试：
```typescript
describe('RenderManager', () => {
  it('should initialize renderer correctly', () => {
    const manager = new RenderManager(canvas, scene, eventSystem);
    expect(manager.rendererInstance).toBeDefined();
  });
});
```

### 2. 集成测试
测试管理器间的协作：
```typescript
describe('EditorCore Integration', () => {
  it('should handle object selection correctly', () => {
    // 测试 InteractionManager、StateManager、SceneManager 的协作
  });
});
```

## 总结

这个重构架构提供了：
- ✅ **更好的可维护性** - 每个管理器职责单一
- ✅ **更强的扩展性** - 易于添加新功能
- ✅ **更好的测试性** - 可以独立测试每个组件
- ✅ **向后兼容性** - 保持原有 API
- ✅ **类型安全** - 提供完整的 TypeScript 支持

通过这种架构，EditorCore 从一个庞大的单体类变成了一个轻量级的协调者，每个管理器都专注于自己的领域，整个系统更加灵活和可维护。 