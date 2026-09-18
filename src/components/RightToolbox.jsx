import React from 'react';
import { Move, RotateCw, Maximize, Box, Circle, Database, Trash2, CopyPlus, Copy, Clipboard } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function RightToolbox() {
  const activeTool = useStore((state) => state.uiState.activeTool);
  const selectedObjectIds = useStore((state) => state.uiState.selectedObjectIds);
  const clipboard = useStore((state) => state.clipboard);
  const setActiveTool = useStore((state) => state.setActiveTool);
  const addObject = useStore((state) => state.addObject);
  const removeObject = useStore((state) => state.removeObject);
  const copySelected = useStore((state) => state.copySelected);
  const pasteClipboard = useStore((state) => state.pasteClipboard);
  const duplicateSelected = useStore((state) => state.duplicateSelected);

  const tools = [
    { id: 'translate', label: 'Translate', icon: Move },
    { id: 'rotate', label: 'Rotate', icon: RotateCw },
    { id: 'scale', label: 'Scale', icon: Maximize },
  ];

  const handleSpawn = (shapeType) => {
    const id = `${shapeType}-${Math.random().toString(36).substr(2, 9)}`;
    const randomOffset = (Math.random() - 0.5) * 1.5;
    
    let newObject = {
      id,
      name: shapeType.charAt(0).toUpperCase() + shapeType.slice(1),
      type: 'primitive',
      primitiveType: shapeType,
      booleanMode: 'solid',
      materialParams: {
        color: shapeType === 'box' ? '#e2e8f0' : shapeType === 'sphere' ? '#fbbf24' : '#059669',
        metalness: 1.0,
        roughness: 0.33,
        clearcoat: 0.0,
        transmission: 0.0,
        ior: 1.5,
      },
      position: [randomOffset, 0, randomOffset],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      parameters: {}
    };

    if (shapeType === 'box') {
      newObject.parameters = { width: 1.2, height: 1.2, depth: 1.2, filletRadius: 0, advancedFillet: false, edgeRadii: {} };
    } else if (shapeType === 'sphere') {
      newObject.parameters = { radius: 0.75 };
    } else if (shapeType === 'cylinder') {
      newObject.parameters = { radiusTop: 0.5, radiusBottom: 0.5, height: 1.4 };
    }

    addObject(newObject);
    useStore.getState().selectObject(id); 
  };

  const handleDelete = () => {
    selectedObjectIds.forEach(id => removeObject(id));
  };

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
      {/* Transform Tools Group */}
      <div className="flex flex-col gap-2 p-2 rounded-2xl bg-workspace-panel/80 backdrop-blur-md border border-white/5 shadow-2xl">
        <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest text-center mb-1 select-none">Tool</div>
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`p-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-workspace-accent text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-workspace-hover'
              }`}
              title={t.label}
            >
              <Icon size={20} />
              <span className="absolute right-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black/90 text-[10px] text-gray-200 border border-white/5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Edit Actions Group */}
      <div className="flex flex-col gap-2 p-2 rounded-2xl bg-workspace-panel/80 backdrop-blur-md border border-white/5 shadow-2xl">
        <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest text-center mb-1 select-none">Edit</div>
        
        <button
          onClick={duplicateSelected}
          disabled={selectedObjectIds.length === 0}
          className={`p-3 rounded-xl transition-colors group relative ${
            selectedObjectIds.length > 0 
              ? 'text-gray-300 hover:text-white hover:bg-workspace-hover' 
              : 'text-gray-600 cursor-not-allowed'
          }`}
          title="Duplicate (Ctrl+D)"
        >
          <CopyPlus size={20} />
          <span className="absolute right-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black/90 text-[10px] text-gray-200 border border-white/5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
            Duplicate
          </span>
        </button>

        <button
          onClick={copySelected}
          disabled={selectedObjectIds.length === 0}
          className={`p-3 rounded-xl transition-colors group relative ${
            selectedObjectIds.length > 0 
              ? 'text-gray-300 hover:text-white hover:bg-workspace-hover' 
              : 'text-gray-600 cursor-not-allowed'
          }`}
          title="Copy (Ctrl+C)"
        >
          <Copy size={20} />
          <span className="absolute right-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black/90 text-[10px] text-gray-200 border border-white/5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
            Copy
          </span>
        </button>

        <button
          onClick={pasteClipboard}
          disabled={!clipboard || clipboard.length === 0}
          className={`p-3 rounded-xl transition-colors group relative ${
            clipboard && clipboard.length > 0 
              ? 'text-gray-300 hover:text-white hover:bg-workspace-hover' 
              : 'text-gray-600 cursor-not-allowed'
          }`}
          title="Paste (Ctrl+V)"
        >
          <Clipboard size={20} />
          <span className="absolute right-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black/90 text-[10px] text-gray-200 border border-white/5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
            Paste
          </span>
        </button>
      </div>

      {/* Spawners Group */}
      <div className="flex flex-col gap-2 p-2 rounded-2xl bg-workspace-panel/80 backdrop-blur-md border border-white/5 shadow-2xl">
        <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest text-center mb-1 select-none">Spawn</div>
        
        <button
          onClick={() => handleSpawn('box')}
          className="p-3 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-workspace-hover transition-colors group relative"
          title="Spawn Cube"
        >
          <Box size={20} />
          <span className="absolute right-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black/90 text-[10px] text-gray-200 border border-white/5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
            Cube
          </span>
        </button>

        <button
          onClick={() => handleSpawn('sphere')}
          className="p-3 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-workspace-hover transition-colors group relative"
          title="Spawn Sphere"
        >
          <Circle size={20} />
          <span className="absolute right-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black/90 text-[10px] text-gray-200 border border-white/5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
            Sphere
          </span>
        </button>

        <button
          onClick={() => handleSpawn('cylinder')}
          className="p-3 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-workspace-hover transition-colors group relative"
          title="Spawn Cylinder"
        >
          <Database size={20} className="rotate-90" />
          <span className="absolute right-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black/90 text-[10px] text-gray-200 border border-white/5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
            Cylinder
          </span>
        </button>
      </div>

      {/* Delete Object Button */}
      {selectedObjectIds.length > 0 && (
        <button
          onClick={handleDelete}
          className="p-3.5 rounded-2xl bg-red-950/80 hover:bg-red-900 border border-red-500/20 text-red-400 hover:text-red-200 transition-all duration-200 shadow-2xl backdrop-blur-md flex items-center justify-center"
          title="Delete Selected (Delete/Backspace)"
        >
          <Trash2 size={20} />
        </button>
      )}
    </div>
  );
}
