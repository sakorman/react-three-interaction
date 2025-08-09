import React, { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { runInAction } from 'mobx';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  createEditor, 
  EditorProvider,
  MobxPropertyPanel,
  SelectMenu,
  MobxResourceManager,
  TopView,
  DebugPanel,
  ShadowSettings,
  ThemeProvider,
  createBasicGeometry,
  createBasicMaterial,
  createMesh,
  editorStore,
} from '@/index';
import { CanvasContainer } from './CanvasContainer';
import { Toolbar } from './Toolbar';
import { InfoPanel } from './InfoPanel';


export const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string>('select');
  const [editorReady, setEditorReady] = useState<boolean>(false);
  const [showInfoPanel, setShowInfoPanel] = useState<boolean>(false);
  const editorRef = useRef<any>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    // 创建编辑器
    const editor = createEditor({ 
      canvas,
      enableControls: true,
      enableStats: true,
      autoResize: true,
    });

    editorRef.current = editor;

    // 添加轨道控制器
    const controls = new OrbitControls(editor.cameraInstance, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // 将控制器设置到编辑器中进行管理
    editor.setCameraControls(controls);

    // 启动渲染循环
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
    };
    animate();

    // 添加一些初始对象
    addInitialObjects(editor);
    
    // 标记编辑器已经准备好了
    setEditorReady(true);
    
    // 初始化完成后确保UI状态正确
    // 延迟一帧确保所有初始化完成
    requestAnimationFrame(() => {
      runInAction(() => {
        editorStore.showResourceManager = true;
        editorStore.showPropertyPanel = true;
      });
    });
  }, []);

  const addInitialObjects = (editor: any) => {
    // 添加一个初始立方体
    const cubeGeometry = createBasicGeometry.box();
    const cubeMaterial = createBasicMaterial.standard(0x00ff00);
    const cube = createMesh(cubeGeometry, cubeMaterial, [0, 0, 0]);
    editor.addObject(cube);

    // 添加一个初始球体
    const sphereGeometry = createBasicGeometry.sphere(0.7);
    const sphereMaterial = createBasicMaterial.standard(0xff0000);
    const sphere = createMesh(sphereGeometry, sphereMaterial, [2, 0, 0]);
    editor.addObject(sphere);

    // 添加一个地面
    const groundGeometry = createBasicGeometry.plane(10, 10);
    const groundMaterial = createBasicMaterial.lambert(0x808080);
    const ground = createMesh(groundGeometry, groundMaterial, [0, -1, 0]);
    ground.rotation.x = -Math.PI / 2;
    editor.addObject(ground);
  };

  const handleToolChange = useCallback((tool: string) => {
    setActiveTool(tool);
    if (editorRef.current) {
      editorRef.current.switchTool(tool);
      // 同步 MobX store 的激活工具状态
      editorStore.setActiveTool(tool);
    }
  }, []);

  const handleAddCube = useCallback(() => {
    if (!editorRef.current) return;
    
    const geometry = createBasicGeometry.box(1, 1, 1);
    const material = createBasicMaterial.standard(Math.random() * 0xffffff);
    const mesh = createMesh(geometry, material, [
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
    ]);
    
    editorRef.current.addObject(mesh);
  }, []);

  const handleAddSphere = useCallback(() => {
    if (!editorRef.current) return;
    
    const geometry = createBasicGeometry.sphere(0.5);
    const material = createBasicMaterial.standard(Math.random() * 0xffffff);
    const mesh = createMesh(geometry, material, [
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
    ]);
    
    editorRef.current.addObject(mesh);
  }, []);

  const handleAddCylinder = useCallback(() => {
    if (!editorRef.current) return;
    
    const geometry = createBasicGeometry.cylinder(0.5, 0.5, 1);
    const material = createBasicMaterial.standard(Math.random() * 0xffffff);
    const mesh = createMesh(geometry, material, [
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
    ]);
    
    editorRef.current.addObject(mesh);
  }, []);

  const handleClearScene = useCallback(() => {
    if (!editorRef.current) return;
    
    const objects = editorRef.current.getAllObjects();
    objects.forEach((obj: any) => {
      editorRef.current.removeObject(obj.id);
    });
  }, []);

  const handleToggleResourceManager = useCallback(() => {
    if (!editorRef.current) return;
    editorStore.toggleResourceManager();
  }, []);

  const handleToggleFunctionPanel = useCallback(() => {
    if (!editorRef.current) return;
    editorStore.togglePropertyPanel();
  }, []);

  const handleToggleTopView = useCallback(() => {
    if (!editorRef.current) return;
    editorStore.toggleTopView();
  }, []);

  const handleToggleInfoPanel = useCallback(() => {
    setShowInfoPanel(prev => !prev);
  }, []);

  const handleToggleShadowSettings = useCallback(() => {
    editorStore.toggleShadowSettings();
  }, []);

  return (
    <ThemeProvider>
      <CanvasContainer onCanvasReady={handleCanvasReady} />
      
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        onAddCube={handleAddCube}
        onAddSphere={handleAddSphere}
        onAddCylinder={handleAddCylinder}
        onClearScene={handleClearScene}
        onToggleResourceManager={handleToggleResourceManager}
        onToggleFunctionPanel={handleToggleFunctionPanel}
        onToggleTopView={handleToggleTopView}
        onToggleInfoPanel={handleToggleInfoPanel}
        onToggleShadowSettings={handleToggleShadowSettings}
        showInfoPanel={showInfoPanel}
      />
      
      <InfoPanel 
        activeTool={activeTool} 
        visible={showInfoPanel}
        onClose={handleToggleInfoPanel}
      />
      
      {editorReady && editorRef.current && (
        <EditorProvider editor={editorRef.current}>
          <MobxPropertyPanel />
          <SelectMenu />
          <MobxResourceManager />
          <TopView visible={editorStore.showTopView} />
          <DebugPanel />
          <ShadowSettings />
        </EditorProvider>
      )}
    </ThemeProvider>
  );
}; 