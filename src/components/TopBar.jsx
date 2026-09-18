import React from 'react';
import { Camera, Grid, RefreshCw, Layers, Undo2, Redo2, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function TopBar() {
  const presentationSettings = useStore((state) => state.presentationSettings);
  const updatePresentationSettings = useStore((state) => state.updatePresentationSettings);
  const triggerCaptureRender = useStore((state) => state.triggerCaptureRender);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const historyIndex = useStore((state) => state.historyIndex);
  const history = useStore((state) => state.history);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;


  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-2xl bg-workspace-panel/80 backdrop-blur-md border border-white/5 shadow-2xl z-10 text-xs">
      
      {/* Undo / Redo Controls */}
      <div className="flex items-center gap-1 border-r border-white/5 pr-3">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center ${
            canUndo 
              ? 'border-white/10 text-gray-200 hover:bg-workspace-hover active:scale-95' 
              : 'border-transparent text-gray-600 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={15} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center ${
            canRedo 
              ? 'border-white/10 text-gray-200 hover:bg-workspace-hover active:scale-95' 
              : 'border-transparent text-gray-600 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={15} />
        </button>
      </div>

      {/* Background Gradient Colors */}
      <div className="flex items-center gap-3 border-r border-white/5 pr-3">
        <div className="flex flex-col items-center">
          <label className="text-[8px] text-gray-500 uppercase font-semibold mb-0.5">Bg Top</label>
          <input
            type="color"
            value={presentationSettings.bgGradientTop || '#f8fafc'}
            onChange={(e) => updatePresentationSettings({ bgGradientTop: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
            title="Background Top Color"
          />
        </div>
        <div className="flex flex-col items-center">
          <label className="text-[8px] text-gray-500 uppercase font-semibold mb-0.5">Bg Btm</label>
          <input
            type="color"
            value={presentationSettings.bgGradientBottom || '#e2e8f0'}
            onChange={(e) => updatePresentationSettings({ bgGradientBottom: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
            title="Background Bottom Color"
          />
        </div>
      </div>

      {/* Grid Toggle */}
      <button
        onClick={() => updatePresentationSettings({ showGrid: !presentationSettings.showGrid })}
        className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center ${
          presentationSettings.showGrid 
            ? 'bg-workspace-accent/20 border-workspace-accent text-workspace-accent' 
            : 'border-white/5 text-gray-400 hover:text-gray-200 hover:bg-workspace-hover'
        }`}
        title="Toggle Grid"
      >
        <Grid size={15} />
      </button>

      {/* Auto Rotate Toggle */}
      <button
        onClick={() => updatePresentationSettings({ autoRotate: !presentationSettings.autoRotate })}
        className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center ${
          presentationSettings.autoRotate 
            ? 'bg-workspace-accent/20 border-workspace-accent text-workspace-accent' 
            : 'border-white/5 text-gray-400 hover:text-gray-200 hover:bg-workspace-hover'
        }`}
        title="Auto Rotate View"
      >
        <RefreshCw size={15} className={presentationSettings.autoRotate ? 'animate-spin-slow' : ''} />
      </button>

      {/* GPU Path Tracing / Raytracing Mode Toggle */}
      <button
        onClick={() => updatePresentationSettings({ pathTracing: !presentationSettings.pathTracing })}
        className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 font-medium text-[11px] ${
          presentationSettings.pathTracing
            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/10'
            : 'border-white/5 text-gray-400 hover:text-amber-300 hover:bg-workspace-hover'
        }`}
        title="Toggle GPU Photorealistic Raytracing (Blender Cycles Mode)"
      >
        <Sparkles size={13} className={presentationSettings.pathTracing ? 'text-amber-400 animate-pulse' : ''} />
        <span>{presentationSettings.pathTracing ? 'Raytracing ON' : 'Raytracing'}</span>
      </button>

      {/* Capture Screen Button */}
      <button
        onClick={triggerCaptureRender}
        className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-workspace-accent text-white font-medium hover:bg-indigo-500 shadow-md shadow-indigo-600/20 active:scale-95 transition-all text-[11px]"
      >
        <Camera size={14} />
        <span>Capture</span>
      </button>
    </div>
  );
}
