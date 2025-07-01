import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { 
  createEditor, 
  EditorProvider,
  MobxPropertyPanel,
  SelectMenu,
  ResourceManager,
  DebugPanel,
  createBasicGeometry,
  createBasicMaterial,
  createMesh,
} from '../../src';

class ThreeJSExample {
  private canvas: HTMLCanvasElement;
  private editor: any;
  private controls: OrbitControls;

  constructor() {
    this.canvas = document.getElementById('three-canvas') as HTMLCanvasElement;
    this.init();
  }

  private init() {
    // 创建编辑器
    this.editor = createEditor({
      canvas: this.canvas,
      enableControls: true,
      enableStats: true,
      autoResize: true,
    });

    // 添加轨道控制器
    this.controls = new OrbitControls(this.editor.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // 启动渲染循环
    this.animate();

    // 绑定UI事件
    this.bindEvents();

    // 创建React应用
    this.createReactApp();

    // 添加一些初始对象
    this.addInitialObjects();
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
  }

  private bindEvents() {
    const btnSelect = document.getElementById('btn-select') as HTMLButtonElement;
    const btnDrag = document.getElementById('btn-drag') as HTMLButtonElement;
    const btnAddCube = document.getElementById('btn-add-cube') as HTMLButtonElement;
    const btnAddSphere = document.getElementById('btn-add-sphere') as HTMLButtonElement;
    const btnAddCylinder = document.getElementById('btn-add-cylinder') as HTMLButtonElement;
    const btnClear = document.getElementById('btn-clear') as HTMLButtonElement;
    const btnToggleResource = document.getElementById('btn-toggle-resource') as HTMLButtonElement;
    const btnTogglePanel = document.getElementById('btn-toggle-panel') as HTMLButtonElement;

    btnSelect?.addEventListener('click', () => {
      this.setActiveButton(btnSelect);
      this.editor.switchTool('select');
    });

    btnDrag?.addEventListener('click', () => {
      this.setActiveButton(btnDrag);
      this.editor.switchTool('drag');
    });

    btnAddCube?.addEventListener('click', () => {
      this.addCube();
    });

    btnAddSphere?.addEventListener('click', () => {
      this.addSphere();
    });

    btnAddCylinder?.addEventListener('click', () => {
      this.addCylinder();
    });

    btnClear?.addEventListener('click', () => {
      this.clearScene();
    });

    btnToggleResource?.addEventListener('click', () => {
      this.editor.dispatch({ type: 'TOGGLE_RESOURCE_MANAGER' });
    });

    btnTogglePanel?.addEventListener('click', () => {
      this.editor.dispatch({ type: 'TOGGLE_FUNCTION_PANEL' });
    });
  }

  private setActiveButton(activeButton: HTMLButtonElement) {
    const buttons = document.querySelectorAll('.toolbar button');
    buttons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
  }

  private addCube() {
    const geometry = createBasicGeometry.box(1, 1, 1);
    const material = createBasicMaterial.standard(Math.random() * 0xffffff);
    const mesh = createMesh(geometry, material, [
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
    ]);
    
    this.editor.addObject(mesh);
  }

  private addSphere() {
    const geometry = createBasicGeometry.sphere(0.5);
    const material = createBasicMaterial.standard(Math.random() * 0xffffff);
    const mesh = createMesh(geometry, material, [
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
    ]);
    
    this.editor.addObject(mesh);
  }

  private addCylinder() {
    const geometry = createBasicGeometry.cylinder(0.5, 0.5, 1);
    const material = createBasicMaterial.standard(Math.random() * 0xffffff);
    const mesh = createMesh(geometry, material, [
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
    ]);
    
    this.editor.addObject(mesh);
  }

  private clearScene() {
    const objects = this.editor.getAllObjects();
    objects.forEach((obj: any) => {
      this.editor.removeObject(obj.id);
    });
  }

  private addInitialObjects() {
    // 添加一个初始立方体
    const cubeGeometry = createBasicGeometry.box();
    const cubeMaterial = createBasicMaterial.standard(0x00ff00);
    const cube = createMesh(cubeGeometry, cubeMaterial, [0, 0, 0]);
    this.editor.addObject(cube);

    // 添加一个初始球体
    const sphereGeometry = createBasicGeometry.sphere(0.7);
    const sphereMaterial = createBasicMaterial.standard(0xff0000);
    const sphere = createMesh(sphereGeometry, sphereMaterial, [2, 0, 0]);
    this.editor.addObject(sphere);

    // 添加一个地面
    const groundGeometry = createBasicGeometry.plane(10, 10);
    const groundMaterial = createBasicMaterial.lambert(0x808080);
    const ground = createMesh(groundGeometry, groundMaterial, [0, -1, 0]);
    ground.rotation.x = -Math.PI / 2;
    this.editor.addObject(ground);
  }

  private createReactApp() {
    // 创建React应用容器
    const reactContainer = document.createElement('div');
    reactContainer.id = 'react-ui';
    document.body.appendChild(reactContainer);

    const root = ReactDOM.createRoot(reactContainer);
    
    const App = () => {
      return React.createElement(
        EditorProvider, 
        { editor: this.editor } as any,
        React.createElement(MobxPropertyPanel, { key: 'property-panel' } as any),
        React.createElement(SelectMenu, { key: 'select-menu' } as any),
        React.createElement(ResourceManager, { key: 'resource-manager' } as any),
        React.createElement(DebugPanel, { key: 'debug-panel' } as any)
      );
    };

    root.render(React.createElement(App));
  }
}

// 启动应用
window.addEventListener('DOMContentLoaded', () => {
  new ThreeJSExample();
}); 