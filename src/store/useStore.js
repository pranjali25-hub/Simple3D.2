import { create } from 'zustand';

const recordHistory = (history, historyIndex, newObjects) => {
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(newObjects)));
  if (newHistory.length > 30) newHistory.shift();
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1
  };
};

export const useStore = create((set, get) => ({
  presentationSettings: {
    bgGradientTop: "#f8fafc",
    bgGradientBottom: "#e2e8f0",
    showGrid: true,
    autoRotate: false,
    pathTracing: false,
    exposure: 1.0,
    contrast: 1.0,
    saturation: 1.0,
    studioRig: {
      keyLightIntensity: 6,
      edgeLightIntensity: 3,
      fillLightIntensity: 1,
    }
  },
  uiState: {
    selectedObjectIds: [],
    activeTool: "translate" 
  },
  objects: {},
  history: [{}],
  historyIndex: 0,
  clipboard: [],
  captureRenderTrigger: 0,

  // Actions
  triggerCaptureRender: () => set((state) => ({ captureRenderTrigger: state.captureRenderTrigger + 1 })),

  addObject: (obj) => set((state) => {
    // Migrate old objects missing materialParams
    if (!obj.materialParams) {
      obj.materialParams = {
        color: obj.primitiveType === 'box' ? '#e2e8f0' : obj.primitiveType === 'sphere' ? '#fbbf24' : '#059669',
        metalness: 1.0,
        roughness: 0.33,
        clearcoat: 0.0,
        transmission: 0.0,
        ior: 1.5,
      };
    }
    const newObjects = {
      ...state.objects,
      [obj.id]: obj
    };
    const hist = recordHistory(state.history, state.historyIndex, newObjects);
    return {
      objects: newObjects,
      ...hist
    };
  }),

  removeObject: (id) => set((state) => {
    const newObjects = { ...state.objects };
    delete newObjects[id];
    const hist = recordHistory(state.history, state.historyIndex, newObjects);
    return {
      objects: newObjects,
      ...hist,
      uiState: {
        ...state.uiState,
        selectedObjectIds: state.uiState.selectedObjectIds.filter(selectedId => selectedId !== id)
      }
    };
  }),

  updateObjectTransform: (id, transform) => set((state) => {
    if (!state.objects[id]) return {};
    const newObjects = {
      ...state.objects,
      [id]: {
        ...state.objects[id],
        ...transform
      }
    };
    const hist = recordHistory(state.history, state.historyIndex, newObjects);
    return {
      objects: newObjects,
      ...hist
    };
  }),

  updateObjectParameters: (id, params) => set((state) => {
    if (!state.objects[id]) return {};
    const newObjects = {
      ...state.objects,
      [id]: {
        ...state.objects[id],
        parameters: {
          ...state.objects[id].parameters,
          ...params
        }
      }
    };
    const hist = recordHistory(state.history, state.historyIndex, newObjects);
    return {
      objects: newObjects,
      ...hist
    };
  }),

  updateObjectMeta: (id, meta) => set((state) => {
    if (!state.objects[id]) return {};
    const newObjects = {
      ...state.objects,
      [id]: {
        ...state.objects[id],
        ...meta
      }
    };
    const hist = recordHistory(state.history, state.historyIndex, newObjects);
    return {
      objects: newObjects,
      ...hist
    };
  }),

  selectObject: (id, multi = false) => set((state) => {
    if (!id) {
      return { uiState: { ...state.uiState, selectedObjectIds: [] } };
    }
    let newSelection = [...state.uiState.selectedObjectIds];
    if (multi) {
      if (newSelection.includes(id)) {
        newSelection = newSelection.filter(selId => selId !== id);
      } else {
        newSelection.push(id);
      }
    } else {
      newSelection = [id];
    }
    return { uiState: { ...state.uiState, selectedObjectIds: newSelection } };
  }),

  setActiveTool: (tool) => set((state) => ({
    uiState: {
      ...state.uiState,
      activeTool: tool
    }
  })),

  updatePresentationSettings: (settings) => set((state) => ({
    presentationSettings: {
      ...state.presentationSettings,
      ...settings
    }
  })),

  undo: () => set((state) => {
    if (state.historyIndex <= 0) return {};
    const newIndex = state.historyIndex - 1;
    const restoredObjects = JSON.parse(JSON.stringify(state.history[newIndex]));
    return {
      objects: restoredObjects,
      historyIndex: newIndex,
      uiState: { ...state.uiState, selectedObjectIds: [] }
    };
  }),

  redo: () => set((state) => {
    if (state.historyIndex >= state.history.length - 1) return {};
    const newIndex = state.historyIndex + 1;
    const restoredObjects = JSON.parse(JSON.stringify(state.history[newIndex]));
    return {
      objects: restoredObjects,
      historyIndex: newIndex,
      uiState: { ...state.uiState, selectedObjectIds: [] }
    };
  }),

  copySelected: () => set((state) => {
    const selectedIds = state.uiState.selectedObjectIds;
    if (selectedIds.length === 0) return {};
    const copiedObjs = selectedIds.map(id => state.objects[id]).filter(Boolean);
    if (copiedObjs.length === 0) return {};

    return {
      clipboard: JSON.parse(JSON.stringify(copiedObjs))
    };
  }),

  pasteClipboard: () => set((state) => {
    if (!state.clipboard || state.clipboard.length === 0) return {};

    const newObjects = { ...state.objects };
    const newSelectedIds = [];

    state.clipboard.forEach(clipObj => {
      const newId = `${clipObj.primitiveType || clipObj.type || 'obj'}-${Math.random().toString(36).substr(2, 9)}`;
      const newPos = [
        (clipObj.position?.[0] || 0) + 0.4,
        (clipObj.position?.[1] || 0),
        (clipObj.position?.[2] || 0) + 0.4
      ];
      const pastedObj = {
        ...JSON.parse(JSON.stringify(clipObj)),
        id: newId,
        name: `${clipObj.name || 'Object'} (Copy)`,
        position: newPos
      };
      newObjects[newId] = pastedObj;
      newSelectedIds.push(newId);
    });

    const hist = recordHistory(state.history, state.historyIndex, newObjects);

    return {
      objects: newObjects,
      ...hist,
      uiState: {
        ...state.uiState,
        selectedObjectIds: newSelectedIds
      }
    };
  }),

  duplicateSelected: () => set((state) => {
    const selectedIds = state.uiState.selectedObjectIds;
    if (selectedIds.length === 0) return {};

    const selectedObjs = selectedIds.map(id => state.objects[id]).filter(Boolean);
    if (selectedObjs.length === 0) return {};

    const newObjects = { ...state.objects };
    const newSelectedIds = [];

    selectedObjs.forEach(obj => {
      const newId = `${obj.primitiveType || obj.type || 'obj'}-${Math.random().toString(36).substr(2, 9)}`;
      const newPos = [
        (obj.position?.[0] || 0) + 0.4,
        (obj.position?.[1] || 0),
        (obj.position?.[2] || 0) + 0.4
      ];
      const dupObj = {
        ...JSON.parse(JSON.stringify(obj)),
        id: newId,
        name: `${obj.name || 'Object'} (Copy)`,
        position: newPos
      };
      newObjects[newId] = dupObj;
      newSelectedIds.push(newId);
    });

    const hist = recordHistory(state.history, state.historyIndex, newObjects);

    return {
      objects: newObjects,
      ...hist,
      uiState: {
        ...state.uiState,
        selectedObjectIds: newSelectedIds
      }
    };
  }),

  groupSelected: () => set((state) => {
    const selectedIds = state.uiState.selectedObjectIds;
    if (selectedIds.length < 2) return {};

    const selectedObjs = selectedIds.map(id => state.objects[id]).filter(Boolean);
    if (selectedObjs.length < 2) return {};

    const solids = selectedObjs.filter(o => o.booleanMode === "solid" || !o.booleanMode);
    const holes = selectedObjs.filter(o => o.booleanMode === "hole");

    const sortedObjs = [...solids, ...holes];
    const primarySolid = solids.length > 0 ? solids[0] : selectedObjs[0];
    const csgId = `csg-${Math.random().toString(36).substr(2, 9)}`;

    const newCsgObj = {
      id: csgId,
      name: `Group (${primarySolid.name || 'Objects'})`,
      type: "csg",
      booleanMode: primarySolid.booleanMode || "solid",
      materialMode: primarySolid.materialMode || "polishedMetal",
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      children: JSON.parse(JSON.stringify(sortedObjs)),
      parameters: {}
    };

    const newObjects = { ...state.objects };
    selectedObjs.forEach(obj => {
      delete newObjects[obj.id];
    });
    newObjects[csgId] = newCsgObj;

    const hist = recordHistory(state.history, state.historyIndex, newObjects);

    return {
      objects: newObjects,
      ...hist,
      uiState: {
        ...state.uiState,
        selectedObjectIds: [csgId]
      }
    };
  }),

  ungroupSelected: () => set((state) => {
    const selectedIds = state.uiState.selectedObjectIds;
    if (selectedIds.length !== 1) return {};

    const csgObj = state.objects[selectedIds[0]];
    if (!csgObj || csgObj.type !== 'csg' || !csgObj.children) return {};

    const newObjects = { ...state.objects };
    delete newObjects[csgObj.id];

    const restoredIds = [];
    csgObj.children.forEach(child => {
      const newId = `${child.primitiveType || 'shape'}-${Math.random().toString(36).substr(2, 9)}`;
      const restoredObj = {
        ...child,
        id: newId
      };
      newObjects[newId] = restoredObj;
      restoredIds.push(newId);
    });

    const hist = recordHistory(state.history, state.historyIndex, newObjects);

    return {
      objects: newObjects,
      ...hist,
      uiState: {
        ...state.uiState,
        selectedObjectIds: restoredIds
      }
    };
  })
}));
