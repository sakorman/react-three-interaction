import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';

// 启动应用
window.addEventListener('DOMContentLoaded', () => {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(<App />);
}); 