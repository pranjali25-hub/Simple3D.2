import React, { useEffect } from 'react';
import Viewport from './components/Viewport';
import TopBar from './components/TopBar';
import RightToolbox from './components/RightToolbox';
import LeftPropertiesPanel from './components/LeftPropertiesPanel';
import BottomBar from './components/BottomBar';
import { useStore } from './store/useStore';

export default function App() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore hotkeys if typing inside input / textarea / select elements
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(activeTag)) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl + Z
      if (ctrlKey && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        useStore.getState().undo();
        return;
      }

      // Redo: Ctrl + Y or Ctrl + Shift + Z
      if ((ctrlKey && e.key.toLowerCase() === 'y') || (ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        useStore.getState().redo();
        return;
      }

      // Copy: Ctrl + C
      if (ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        useStore.getState().copySelected();
        return;
      }

      // Paste: Ctrl + V
      if (ctrlKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        useStore.getState().pasteClipboard();
        return;
      }

      // Duplicate: Ctrl + D
      if (ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        useStore.getState().duplicateSelected();
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedIds = useStore.getState().uiState.selectedObjectIds;
        if (selectedIds.length > 0) {
          e.preventDefault();
          selectedIds.forEach(id => useStore.getState().removeObject(id));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-screen h-screen relative bg-workspace-dark overflow-hidden select-none">
      {/* Immersive 3D Viewport Background */}
      <Viewport />

      {/* Floating Nomad-style Menus */}
      <TopBar />
      <RightToolbox />
      <LeftPropertiesPanel />
      <BottomBar />

      {/* Floating Instructions/Help overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 p-4 rounded-xl bg-workspace-panel/80 backdrop-blur-md border border-white/5 pointer-events-none max-w-md w-full shadow-xl z-0 text-center">
        <h1 className="text-xs font-semibold text-white tracking-wide">3D Product Concepting Tool</h1>
        <p className="text-[9px] text-gray-400 font-mono tracking-wider uppercase mt-0.5">Nomad Sculpt Render & Tinkercad CSG</p>
        
        <div className="mt-3 space-y-1.5 text-[10px] text-gray-300">
          <div>🖱️ <span className="font-semibold text-white">Left-Drag</span>: Rotate | <span className="font-semibold text-white">Right-Drag</span>: Pan | <span className="font-semibold text-white">Scroll</span>: Zoom</div>
          <div className="text-gray-400 border-t border-white/5 pt-1.5 mt-1.5 flex justify-center gap-2 flex-wrap">
            <span className="text-white font-medium">Ctrl+Z / Y</span>: Undo/Redo | 
            <span className="text-white font-medium">Ctrl+C / V</span>: Copy/Paste | 
            <span className="text-white font-medium">Ctrl+D</span>: Duplicate | 
            <span className="text-white font-medium">ENTER</span>: Stamp Pos
          </div>
        </div>
      </div>
    </div>
  );
}
