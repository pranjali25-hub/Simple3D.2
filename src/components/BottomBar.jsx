import React from 'react';
import { useStore } from '../store/useStore';

export default function BottomBar() {
  const objects = useStore((state) => state.objects);
  const activeTool = useStore((state) => state.uiState.activeTool);
  const selectedObjectIds = useStore((state) => state.uiState.selectedObjectIds);

  const objectList = Object.values(objects);
  const totalObjects = objectList.length;
  
  const boxCount = objectList.filter(o => o.primitiveType === 'box').length;
  const sphereCount = objectList.filter(o => o.primitiveType === 'sphere').length;
  const cylinderCount = objectList.filter(o => o.primitiveType === 'cylinder').length;
  const csgCount = objectList.filter(o => o.type === 'csg').length;

  return (
    <div className="absolute bottom-6 left-6 flex flex-col gap-1 p-3 rounded-xl bg-workspace-panel/60 backdrop-blur-md border border-white/5 shadow-xl text-[10px] text-gray-400 font-mono select-none pointer-events-none">
      <div className="flex gap-4">
        <div>
          <span className="text-gray-500 font-semibold uppercase">Objects:</span>{' '}
          <span className="text-white font-bold">{totalObjects}</span>
        </div>
        <div>
          <span className="text-gray-500 font-semibold uppercase">Active Tool:</span>{' '}
          <span className="text-indigo-400 font-bold uppercase">{activeTool}</span>
        </div>
      </div>
      
      {totalObjects > 0 && (
        <div className="flex gap-2.5 text-[9px] mt-1 text-gray-500 border-t border-white/5 pt-1">
          {boxCount > 0 && <span>Cubes: {boxCount}</span>}
          {sphereCount > 0 && <span>Spheres: {sphereCount}</span>}
          {cylinderCount > 0 && <span>Cylinders: {cylinderCount}</span>}
          {csgCount > 0 && <span>Groups: {csgCount}</span>}
        </div>
      )}

      {selectedObjectIds.length > 0 && (
        <div className="text-[9px] mt-0.5 text-gray-500 truncate max-w-[200px]">
          Selected: <span className="text-white">{selectedObjectIds.length} object(s)</span>
        </div>
      )}
    </div>
  );
}
