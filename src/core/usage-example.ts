/**
 * EditorCore 重构后的使用示例
 * 展示如何使用新的模块化架构
 */

import * as THREE from 'three';
import { EditorCore } from './EditorCore.refactored';

// 1. 基础使用 - 与原来完全兼容
function basicUsage() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const editor = new EditorCore(canvas);

  // 添加一个立方体
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  
  const sceneObject = editor.addObject(cube);
  console.log('添加的对象ID:', sceneObject.id);

  // 切换工具
  editor.switchTool('drag');
  
  // 设置相机位置
  editor.setCameraPosition(10, 10, 10);
}

// 2. 高级使用 - 访问特定管理器
function advancedUsage() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const editor = new EditorCore(canvas);

  // 访问光照管理器
  const lightingManager = editor.getLightingManager();
  
  // 设置环境光
  lightingManager.setAmbientLight(0.4, '#ffffff');
  
  // 启用平行光
  lightingManager.setDirectionalLight(true, 1.0, '#ffffff', { x: 5, y: 10, z: 5 });
  
  // 启用阴影
  lightingManager.enableShadows(true);
  lightingManager.setShadowMapType('PCFSoft');

  // 访问交互管理器
  const interactionManager = editor.getInteractionManager();
  
  // 禁用相机控制器（比如在拖拽时）
  interactionManager.disableCameraControls();
  
  // 稍后重新启用
  setTimeout(() => {
    interactionManager.enableCameraControls();
  }, 1000);
}

// 3. 工具扩展示例
function toolExtension() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const editor = new EditorCore(canvas);

  console.log('可用工具:', editor.getAvailableTools());
  
  // 注册自定义工具（需要先实现 CustomTool 类）
  // const customTool = new CustomTool(editor);
  // editor.registerTool('custom', customTool);
  
  // 切换到自定义工具
  // editor.switchTool('custom');
}

// 4. 状态管理示例
function stateManagement() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const editor = new EditorCore(canvas);

  // 监听状态变化
  const unsubscribe = editor.subscribe((state) => {
    console.log('编辑器状态更新:', {
      activeTool: state.activeTool,
      selectedObjects: state.selectedObjectIds,
      showFunctionPanel: state.showFunctionPanel
    });
  });

  // 获取当前状态
  const currentState = editor.getState();
  console.log('当前激活工具:', currentState.activeTool);
  
  // 派发动作
  editor.dispatch({
    type: 'TOGGLE_FUNCTION_PANEL'
  });

  // 清理监听器
  setTimeout(() => unsubscribe(), 5000); // 5秒后取消监听
}

// 5. 历史记录示例
function historyManagement() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const editor = new EditorCore(canvas);
  
  const historyManager = editor.getHistoryManager();

  // 添加历史快照
  editor.addHistorySnapshot('添加立方体');
  
  // 检查是否可以撤销/重做
  console.log('可以撤销:', editor.canUndo());
  console.log('可以重做:', editor.canRedo());
  
  // 撤销操作
  if (editor.canUndo()) {
    editor.undo();
  }
  
  // 重做操作
  if (editor.canRedo()) {
    editor.redo();
  }
  
  // 获取历史记录列表
  const history = historyManager.getHistoryList();
  console.log('历史记录:', history);
}

// 6. 事件监听示例
function eventListening() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const editor = new EditorCore(canvas);
  
  const eventSystem = editor.eventSystemInstance;

  // 监听对象选中事件
  eventSystem.on('object:select', (data) => {
    console.log('对象被选中:', data.objectIds);
  });

  // 监听工具切换事件
  eventSystem.on('tool:change', (data) => {
    console.log('工具切换:', `从 ${data.oldTool} 切换到 ${data.newTool}`);
  });

  // 监听相机变化事件
  eventSystem.on('camera:change', (data) => {
    console.log('相机状态变化:', data);
  });
}

// 7. 批量操作和性能优化
function batchOperations() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const editor = new EditorCore(canvas);
  
  const historyManager = editor.getHistoryManager();

  // 开始批量操作
  historyManager.startBatch('批量添加对象');

  // 添加多个对象
  for (let i = 0; i < 10; i++) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ 
      color: Math.random() * 0xffffff 
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(i * 2, 0, 0);
    
    editor.addObject(mesh);
  }

  // 结束批量操作
  historyManager.endBatch('批量添加对象');
}

// 8. 清理资源
function cleanup() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const editor = new EditorCore(canvas);

  // 使用完毕后清理资源
  window.addEventListener('beforeunload', () => {
    editor.dispose();
  });
}

// 导出示例函数
export {
  basicUsage,
  advancedUsage,
  toolExtension,
  stateManagement,
  historyManagement,
  eventListening,
  batchOperations,
  cleanup
}; 