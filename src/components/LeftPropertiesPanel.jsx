import React, { useState } from 'react';
import { Minus, Square, Circle as CircleIcon } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function LeftPropertiesPanel() {
  const [minimized, setMinimized] = useState(false);
  const selectedObjectIds = useStore((state) => state.uiState.selectedObjectIds);
  const objects = useStore((state) => state.objects);
  const updateObjectParameters = useStore((state) => state.updateObjectParameters);
  const updateObjectMeta = useStore((state) => state.updateObjectMeta);
  const groupSelected = useStore((state) => state.groupSelected);
  const ungroupSelected = useStore((state) => state.ungroupSelected);

  const presentationSettings = useStore((state) => state.presentationSettings);
  const updatePresentationSettings = useStore((state) => state.updatePresentationSettings);

  if (selectedObjectIds.length === 0) {
    const handleStudioChange = (key, value) => {
      updatePresentationSettings({ studioRig: { ...presentationSettings.studioRig, [key]: parseFloat(value) } });
    };

    return (
      <div className="absolute left-6 top-24 w-80 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar z-10 flex flex-col gap-5 p-5 rounded-2xl bg-workspace-panel/95 backdrop-blur-md border border-white/5 shadow-2xl text-xs text-gray-300">
        <h2 className="text-sm font-semibold text-white tracking-wide">Studio Render Rig</h2>
        
        <div className="space-y-3">
          <h3 className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider border-b border-white/10 pb-1">Procedural Lightformers</h3>
          {[
            { id: 'keyLightIntensity', label: 'Key Light (Top/Side)', max: 20 },
            { id: 'edgeLightIntensity', label: 'Edge Light (Side)', max: 15 },
            { id: 'fillLightIntensity', label: 'Fill Light (Front)', max: 5 },
          ].map(light => (
            <div key={light.id}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[9px] text-gray-500 font-mono">{light.label}</label>
                <span className="text-[9px] text-amber-400 font-bold">{(presentationSettings.studioRig[light.id]).toFixed(1)}</span>
              </div>
              <input
                type="range" min="0" max={light.max} step="0.1"
                value={presentationSettings.studioRig[light.id]}
                onChange={(e) => handleStudioChange(light.id, e.target.value)}
                className="w-full h-1.5 bg-workspace-button rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          ))}
          <p className="text-[9px] text-gray-500 leading-tight">These planes form the PMREM Environment Map. Metallic reflections perfectly match these emitted light sources.</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider border-b border-white/10 pb-1">Post-Processing</h3>
          {[
            { id: 'exposure', label: 'Camera Exposure', min: 0.1, max: 3, step: 0.05 },
            { id: 'contrast', label: 'Contrast', min: 0.5, max: 1.5, step: 0.05 },
            { id: 'saturation', label: 'Saturation', min: 0, max: 2, step: 0.05 },
          ].map(post => (
            <div key={post.id}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[9px] text-gray-500 font-mono">{post.label}</label>
                <span className="text-[9px] text-workspace-accent font-bold">{(presentationSettings[post.id]).toFixed(2)}</span>
              </div>
              <input
                type="range" min={post.min} max={post.max} step={post.step}
                value={presentationSettings[post.id]}
                onChange={(e) => updatePresentationSettings({ [post.id]: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-workspace-button rounded-lg appearance-none cursor-pointer accent-workspace-accent"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Multi-select context
  if (selectedObjectIds.length > 1) {
    return (
      <div className="absolute left-6 top-24 w-72 z-10 p-5 rounded-2xl bg-workspace-panel/90 backdrop-blur-md border border-white/5 shadow-2xl">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Multiple Selection</h2>
        <p className="text-xs text-gray-400 mb-4">{selectedObjectIds.length} objects selected</p>
        <button
          onClick={groupSelected}
          className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          Group / Combine
        </button>
        <p className="text-[9px] text-gray-500 mt-2 text-center">Groups Solids and cuts Holes.</p>
      </div>
    );
  }

  const selectedObjectId = selectedObjectIds[0];
  const selectedObject = objects[selectedObjectId];

  if (!selectedObject) return null;

  const handleParamChange = (key, value) => {
    const parsedVal = parseFloat(value);
    if (!isNaN(parsedVal)) {
      updateObjectParameters(selectedObjectId, { [key]: parsedVal });
    }
  };

  const handleMetaChange = (key, value) => {
    updateObjectMeta(selectedObjectId, { [key]: value });
  };

  if (minimized) {
    return (
      <div className="absolute left-6 top-24 z-10 p-3 rounded-2xl bg-workspace-panel/90 backdrop-blur-md border border-white/5 shadow-2xl flex items-center justify-between w-64 cursor-pointer" onClick={() => setMinimized(false)}>
        <span className="text-xs font-semibold text-white">{selectedObject.name || "Object"}</span>
        <Square size={14} className="text-gray-400" />
      </div>
    );
  }

  const maxFillet = selectedObject.primitiveType === 'box' ? Math.max(0, Math.min(selectedObject.parameters.width || 1.2, selectedObject.parameters.height || 1.2, selectedObject.parameters.depth || 1.2) / 2 - 0.01) : 0.5;

  return (
    <div className="absolute left-6 top-24 w-80 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar z-10 flex flex-col gap-4 p-5 rounded-2xl bg-workspace-panel/95 backdrop-blur-md border border-white/5 shadow-2xl text-xs text-gray-300">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1 mr-2">
          <input
            type="text"
            value={selectedObject.name || ""}
            onChange={(e) => handleMetaChange('name', e.target.value)}
            className="w-full bg-transparent border-b border-white/20 text-sm font-semibold text-white focus:outline-none focus:border-workspace-accent pb-1"
            placeholder="Object Name"
          />
          <p className="text-[9px] text-gray-500 font-mono mt-1 truncate">{selectedObject.id}</p>
        </div>
        <button onClick={() => setMinimized(true)} className="p-1 text-gray-400 hover:text-white">
          <Minus size={16} />
        </button>
      </div>

      <hr className="border-white/5" />

      {/* Ungroup CSG Option */}
      {selectedObject.type === 'csg' && (
        <div>
          <button
            onClick={ungroupSelected}
            className="w-full py-2 rounded bg-amber-600/80 hover:bg-amber-500 text-white font-medium transition-colors uppercase text-[10px] tracking-wider"
          >
            Ungroup Objects
          </button>
        </div>
      )}

      {/* Solid / Hole Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => handleMetaChange('booleanMode', 'solid')}
          className={`flex-1 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors ${selectedObject.booleanMode === 'solid' ? 'bg-workspace-accent text-white' : 'bg-workspace-button text-gray-400 hover:text-gray-200'}`}
        >
          Solid
        </button>
        <button
          onClick={() => handleMetaChange('booleanMode', 'hole')}
          className={`flex-1 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors border border-dashed ${selectedObject.booleanMode === 'hole' ? 'bg-red-900/50 border-red-500 text-red-200' : 'border-gray-600 text-gray-400 hover:text-red-300'}`}
        >
          Hole
        </button>
      </div>

      {/* Material Parameters */}
      {selectedObject.booleanMode === 'solid' && (
        <div className="flex flex-col gap-3 mt-1">
          <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">PBR Material</label>
          
          <div className="flex justify-between items-center bg-workspace-button/50 p-1.5 rounded">
            <span className="text-[10px] font-mono">Base Color</span>
            <input 
              type="color" 
              value={selectedObject.materialParams?.color || '#ffffff'} 
              onChange={(e) => updateObjectMeta(selectedObjectId, { materialParams: { ...selectedObject.materialParams, color: e.target.value } })}
              className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
          </div>

          <div className="space-y-2">
            {[
              { id: 'metalness', label: 'Metalness', min: 0, max: 1, step: 0.01 },
              { id: 'roughness', label: 'Roughness', min: 0, max: 1, step: 0.01 },
              { id: 'clearcoat', label: 'Clearcoat', min: 0, max: 1, step: 0.01 },
              { id: 'transmission', label: 'Transmission (Glass)', min: 0, max: 1, step: 0.01 },
              { id: 'ior', label: 'IOR', min: 1, max: 2.33, step: 0.01 },
            ].map(prop => (
              <div key={prop.id}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] text-gray-500 font-mono">{prop.label}</label>
                  <span className="text-[9px] text-workspace-accent font-bold">{(selectedObject.materialParams?.[prop.id] || 0).toFixed(2)}</span>
                </div>
                <input
                  type="range" min={prop.min} max={prop.max} step={prop.step}
                  value={selectedObject.materialParams?.[prop.id] || 0}
                  onChange={(e) => {
                    updateObjectMeta(selectedObjectId, { 
                      materialParams: { ...selectedObject.materialParams, [prop.id]: parseFloat(e.target.value) }
                    });
                  }}
                  className="w-full h-1.5 bg-workspace-button rounded-lg appearance-none cursor-pointer accent-workspace-accent"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <hr className="border-white/5" />

      {/* Dimensions */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-white uppercase tracking-wider text-[10px] text-gray-400">Dimensions</h3>
        
        {selectedObject.primitiveType === 'box' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 font-mono">W</label>
                <input type="number" step="0.1" value={selectedObject.parameters.width} onChange={(e) => handleParamChange('width', e.target.value)} className="w-full bg-workspace-button rounded px-2 py-1 text-white focus:outline-none font-mono" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-mono">H</label>
                <input type="number" step="0.1" value={selectedObject.parameters.height} onChange={(e) => handleParamChange('height', e.target.value)} className="w-full bg-workspace-button rounded px-2 py-1 text-white focus:outline-none font-mono" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-mono">D</label>
                <input type="number" step="0.1" value={selectedObject.parameters.depth} onChange={(e) => handleParamChange('depth', e.target.value)} className="w-full bg-workspace-button rounded px-2 py-1 text-white focus:outline-none font-mono" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] text-gray-400 font-mono">Edge Fillets</label>
                <button 
                  onClick={() => handleParamChange('advancedFillet', !selectedObject.parameters.advancedFillet)}
                  className={`text-[9px] px-1.5 py-0.5 rounded border ${selectedObject.parameters.advancedFillet ? 'bg-workspace-accent/20 border-workspace-accent text-workspace-accent' : 'border-gray-600 text-gray-500'}`}
                >
                  {selectedObject.parameters.advancedFillet ? 'Advanced' : 'Uniform'}
                </button>
              </div>

              {!selectedObject.parameters.advancedFillet ? (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[9px] text-gray-500 font-mono">All Edges</label>
                    <span className="text-[9px] text-workspace-accent font-bold">{selectedObject.parameters.filletRadius.toFixed(2)}</span>
                  </div>
                  <input
                    type="range" min="0" max={maxFillet} step="0.01"
                    value={selectedObject.parameters.filletRadius}
                    onChange={(e) => handleParamChange('filletRadius', e.target.value)}
                    className="w-full h-1.5 bg-workspace-button rounded-lg appearance-none cursor-pointer accent-workspace-accent"
                  />
                </div>
              ) : (
                <div className="space-y-3 bg-black/20 p-2 rounded border border-white/5">
                  {/* Top Edges */}
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold mb-1 block">Top Edges</label>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      {['topFront', 'topBack', 'topLeft', 'topRight'].map(edge => (
                        <div key={edge} className="flex items-center gap-1">
                          <span className="text-[8px] text-gray-500 w-4">{edge.substring(3,4)}</span>
                          <input type="range" min="0" max={maxFillet} step="0.01" value={selectedObject.parameters.edgeRadii?.[edge] || 0} onChange={(e) => {
                            const newRadii = { ...selectedObject.parameters.edgeRadii, [edge]: parseFloat(e.target.value) };
                            updateObjectParameters(selectedObjectId, { edgeRadii: newRadii });
                          }} className="w-full h-1 accent-workspace-accent" />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Bottom Edges */}
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold mb-1 block">Bottom Edges</label>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      {['bottomFront', 'bottomBack', 'bottomLeft', 'bottomRight'].map(edge => (
                        <div key={edge} className="flex items-center gap-1">
                          <span className="text-[8px] text-gray-500 w-4">{edge.substring(6,7)}</span>
                          <input type="range" min="0" max={maxFillet} step="0.01" value={selectedObject.parameters.edgeRadii?.[edge] || 0} onChange={(e) => {
                            const newRadii = { ...selectedObject.parameters.edgeRadii, [edge]: parseFloat(e.target.value) };
                            updateObjectParameters(selectedObjectId, { edgeRadii: newRadii });
                          }} className="w-full h-1 accent-workspace-accent" />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Vertical Edges */}
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold mb-1 block">Vertical Edges</label>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      {['frontLeft', 'frontRight', 'backLeft', 'backRight'].map(edge => (
                        <div key={edge} className="flex items-center gap-1">
                          <span className="text-[8px] text-gray-500 w-4">{edge.substring(0,1)}{edge.substring(edge.indexOf('R') > -1 ? edge.indexOf('R') : edge.indexOf('L'), edge.indexOf('R') > -1 ? edge.indexOf('R')+1 : edge.indexOf('L')+1)}</span>
                          <input type="range" min="0" max={maxFillet} step="0.01" value={selectedObject.parameters.edgeRadii?.[edge] || 0} onChange={(e) => {
                            const newRadii = { ...selectedObject.parameters.edgeRadii, [edge]: parseFloat(e.target.value) };
                            updateObjectParameters(selectedObjectId, { edgeRadii: newRadii });
                          }} className="w-full h-1 accent-workspace-accent" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedObject.primitiveType === 'sphere' && (
          <div>
            <label className="text-[10px] text-gray-500 font-mono block mb-1">Radius</label>
            <input type="range" min="0.1" max="5" step="0.1" value={selectedObject.parameters.radius} onChange={(e) => handleParamChange('radius', e.target.value)} className="w-full accent-workspace-accent" />
          </div>
        )}

        {selectedObject.primitiveType === 'cylinder' && (
          <div className="space-y-2">
            <div><label className="text-[10px] text-gray-500 font-mono">Radius Top</label><input type="range" min="0" max="3" step="0.1" value={selectedObject.parameters.radiusTop} onChange={(e) => handleParamChange('radiusTop', e.target.value)} className="w-full accent-workspace-accent" /></div>
            <div><label className="text-[10px] text-gray-500 font-mono">Radius Btm</label><input type="range" min="0" max="3" step="0.1" value={selectedObject.parameters.radiusBottom} onChange={(e) => handleParamChange('radiusBottom', e.target.value)} className="w-full accent-workspace-accent" /></div>
            <div><label className="text-[10px] text-gray-500 font-mono">Height</label><input type="range" min="0.1" max="5" step="0.1" value={selectedObject.parameters.height} onChange={(e) => handleParamChange('height', e.target.value)} className="w-full accent-workspace-accent" /></div>
          </div>
        )}
      </div>

    </div>
  );
}
